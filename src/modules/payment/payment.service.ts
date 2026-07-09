import Stripe from "stripe"
import { PaymentStatus, RentalRequestStatus } from "../../../generated/prisma/enums"
import config from "../../config"
import { prisma } from "../../lib/prisma"
import { ICreatePaymentPayload } from "./payment.interface"

const stripe = new Stripe(config.stripe_secret_key as string)

const createPaymentIntent = async (tenantId: string, payload: ICreatePaymentPayload) => {
    const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
        where: { id: payload.rentalRequestId },
        include: { property: true }
    })

    if (rentalRequest.tenantId !== tenantId) {
        throw new Error("You are not authorized to pay for this rental")
    }

    if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
        throw new Error("You can only make payments for an approved rental request")
    }

    // Prevent double-paying the same month
    const existingPayment = await prisma.payment.findUnique({
        where: {
            rentalRequestId_monthNumber: {
                rentalRequestId: payload.rentalRequestId,
                monthNumber: payload.monthNumber
            }
        }
    })

    if (existingPayment && existingPayment.status === PaymentStatus.PAID) {
        throw new Error("This month has already been paid")
    }

    const amount = rentalRequest.property.monthlyRent

    // Stripe requires the smallest currency unit (cents), so multiply by 100
    const amountInCents = Math.round(Number(amount) * 100)

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd", // adjust to "bdt" if Stripe supports it in your account/region
        metadata: {
            rentalRequestId: payload.rentalRequestId,
            tenantId,
            monthNumber: String(payload.monthNumber)
        }
    })

    const payment = existingPayment
        ? await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
                stripePaymentIntentId: paymentIntent.id,
                status: PaymentStatus.PENDING,
                amount
            }
        })
        : await prisma.payment.create({
            data: {
                rentalRequestId: payload.rentalRequestId,
                tenantId,
                monthNumber: payload.monthNumber,
                amount,
                status: PaymentStatus.PENDING,
                stripePaymentIntentId: paymentIntent.id
            }
        })

    return {
        payment,
        clientSecret: paymentIntent.client_secret
    }
}

export const paymentService = {
    createPaymentIntent
}
