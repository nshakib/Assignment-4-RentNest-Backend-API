// payment.service.ts
import config from "../../config/index.js"
import { prisma } from "../../lib/prisma.js"
import { stripe } from "../../lib/stripe.js"
import ApiError from "../../errors/ApiError.js"
import httpStatus from "http-status"
import { PaymentStatus, RentalRequestStatus } from "../../../generated/prisma/enums.js"
import Stripe from "stripe"
import { handleChangeSubscription, handleCheckoutCompleted, handleInvoiceFailed, handleInvoicePaid } 
from "../../utils/payment.utils.js"
import { Prisma } from "../../../generated/prisma/client.js"

const createCheckoutSession = async (tenantId: string, rentalRequestId: string) => {
    
    if (!rentalRequestId || typeof rentalRequestId !== "string") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid rental request ID");
    }
    const transactionResult = await prisma.$transaction(async (tx:Prisma.TransactionClient) => {
        
        const rentalRequest = await tx.rentalRequest.findUniqueOrThrow({
            where: { 
                id: rentalRequestId 
            },
            include: { 
                property: true, 
                tenant: true 
            }
        })

        if (!rentalRequest) {
            throw new ApiError(httpStatus.NOT_FOUND, "Rental request not found");
        }

        if (rentalRequest.tenantId !== tenantId) {
            throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized for this rental request")
        }

        if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Rental request must be approved before payment")
        }

        const existingPayment = await tx.payment.findFirst({
            where: { 
                rentalRequestId, 
                status:PaymentStatus.PAID 
            }
        });
        if (existingPayment) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Payment already completed for this request");
        }

        let stripeCustomerId = rentalRequest.stripeCustomerId

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: rentalRequest.tenant.email,
                name: rentalRequest.tenant.name,
                metadata: { tenantId }
            })
            stripeCustomerId = customer.id

            await tx.rentalRequest.update({
                where: { id: rentalRequestId },
                data: { stripeCustomerId }
            })
        }

        const amountInPaisa = Math.round(Number(rentalRequest.property.monthlyRent) * 100)
        console.log("DEBUG config.app_url:", JSON.stringify(config.app_url))


        if (isNaN(amountInPaisa) || amountInPaisa <= 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid rental amount");
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        unit_amount: amountInPaisa,
                        recurring: { interval: "month" },
                        product_data: {
                            name: `Rent - ${rentalRequest.property.title}`
                        }
                    },
                    quantity: 1
                }
            ],
            mode: "subscription",
            customer: stripeCustomerId,
            payment_method_types: ["card"],
            success_url: `${config.app_url}/payment/success?rentalRequestId=${rentalRequestId}`,
            cancel_url: `${config.app_url}/payment/cancel`,
            metadata: {
                tenantId,
                rentalRequestId
            }
        })

        return session.url
    })

    return { paymentUrl: transactionResult }
}
const handleWebhook = async (payload: Buffer, signature: string) => {
    const endpointSecret = config.stripe_webhook_secret

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (err: any) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
        case "checkout.session.completed":
            await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
            break
        case "invoice.paid":
            await handleInvoicePaid(event.data.object as Stripe.Invoice)
            break
        case "invoice.payment_failed":
            await handleInvoiceFailed(event.data.object as Stripe.Invoice)
            break
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
            await handleChangeSubscription(event.data.object as Stripe.Subscription)
            break
        default:
            console.log(`Unhandled event type ${event.type}`)
            break
    }
}

const getMyPaymentHistory = async (tenantId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where: { tenantId },
            include: {
                rentalRequest: {
                    include: {
                        property: {
                            select: { id: true, title: true, city: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        }),
        prisma.payment.count({ where: { tenantId } })
    ]);

    return {
        data: payments,
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit)
        }
    };
};


export const paymentService = {
    createCheckoutSession,
    handleWebhook,
    getMyPaymentHistory
}