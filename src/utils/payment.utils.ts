import Stripe from "stripe"
import { prisma } from "../lib/prisma"
import { PaymentStatus, SubscriptionStatus } from "../../generated/prisma/enums"

export const getPeriodEnd = (payload: Stripe.Subscription) => {
    const currentPeriodEndInMilliseconds = payload.items.data[0]?.current_period_end!
    return new Date(currentPeriodEndInMilliseconds * 1000)
}

export const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
    const rentalRequestId = session.metadata?.rentalRequestId
    const tenantId = session.metadata?.tenantId
    const stripeSubscriptionId = session.subscription as string

    if (!rentalRequestId || !tenantId || !stripeSubscriptionId) {
        console.log("Webhook: Missing values for checkout session completion")
        return
    }

    await prisma.rentalRequest.update({
        where: { id: rentalRequestId },
        data: {
            stripeSubscriptionId,
            subscriptionStatus: SubscriptionStatus.ACTIVE
        }
    })

    console.log(`Subscription activated for rental request ${rentalRequestId}`)
}

export const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
    const stripeSubscriptionId = invoice.parent?.subscription_details?.subscription as string

    if (!stripeSubscriptionId) {
        console.log("Webhook: No subscription ID found on invoice")
        return
    }

    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { stripeSubscriptionId }
    })

    if (!rentalRequest) {
        console.log(`Webhook: No rental request found for subscription ${stripeSubscriptionId}`)
        return
    }

    const existing = await prisma.payment.findFirst({
        where: { stripeInvoiceId: invoice.id }
    })
    if (existing) return

    await prisma.payment.create({
        data: {
            rentalRequestId: rentalRequest.id,
            tenantId: rentalRequest.tenantId,
            amount: (invoice.amount_paid / 100).toString(),
            status: PaymentStatus.PAID,
            stripeInvoiceId: invoice.id,
            stripeSubscriptionId,
            paidAt: new Date()
        }
    })
}

export const handleInvoiceFailed = async (invoice: Stripe.Invoice) => {
    const stripeSubscriptionId = invoice.parent?.subscription_details?.subscription as string

    if (!stripeSubscriptionId) return

    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { stripeSubscriptionId }
    })

    if (!rentalRequest) return

    await prisma.payment.create({
        data: {
            rentalRequestId: rentalRequest.id,
            tenantId: rentalRequest.tenantId,
            amount: (invoice.amount_due / 100).toString(),
            status: PaymentStatus.FAILED,
            stripeInvoiceId: invoice.id,
            stripeSubscriptionId,
            failureReason: "Stripe payment failed"
        }
    })
}

export const handleChangeSubscription = async (payload: Stripe.Subscription) => {
    const stripeSubscriptionId = payload.id

    const status =
        payload.status === "active" || payload.status === "trialing"
            ? SubscriptionStatus.ACTIVE
            : payload.status === "canceled"
            ? SubscriptionStatus.CANCELED
            : SubscriptionStatus.EXPIRED

    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { stripeSubscriptionId }
    })

    if (!rentalRequest) {
        console.log(`Webhook: No rental request found for subscription ${stripeSubscriptionId}`)
        return
    }

    await prisma.rentalRequest.update({
        where: { stripeSubscriptionId },
        data: { subscriptionStatus: status }
    })
}