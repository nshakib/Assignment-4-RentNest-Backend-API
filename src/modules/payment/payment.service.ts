// payment.service.ts
import config from "../../config"
import { prisma } from "../../lib/prisma"
import { stripe } from "../../lib/stripe"
import ApiError from "../../errors/ApiError"
import httpStatus from "http-status"
import { RentalRequestStatus } from "../../../generated/prisma/enums"
import Stripe from "stripe"
import { handleChangeSubscription, handleCheckoutCompleted, handleInvoiceFailed, handleInvoicePaid } from "../../utils/payment.utils"

const createCheckoutSession = async (tenantId: string, rentalRequestId: string) => {
    const transactionResult = await prisma.$transaction(async (tx) => {
        
        const rentalRequest = await tx.rentalRequest.findUniqueOrThrow({
            where: { 
                id: rentalRequestId 
            },
            include: { 
                property: true, 
                tenant: true 
            }
        })

        if (rentalRequest.tenantId !== tenantId) {
            throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized for this rental request")
        }

        if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Rental request must be approved before payment")
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

        const amountInPoisha = Math.round(Number(rentalRequest.property.monthlyRent) * 100)
        console.log("DEBUG config.app_url:", JSON.stringify(config.app_url))
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        unit_amount: amountInPoisha,
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

    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret)

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

const getMyPaymentHistory = async (tenantId: string) => {
    const payments = await prisma.payment.findMany({
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
        orderBy: { createdAt: "desc" }
    })
    return payments
}


export const paymentService = {
    createCheckoutSession,
    handleWebhook,
    getMyPaymentHistory
}