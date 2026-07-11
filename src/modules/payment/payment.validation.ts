import { z } from "zod";

export const paymentValidation = {
    // POST /payments — create checkout session
    createCheckoutSession: z.object({
        body: z.object({
            rentalRequestId: z.string().uuid("Invalid rental request ID"),
        }),
    }),

    // GET /payments — get history
    getPaymentHistory: z.object({
        query: z.object({
            page: z.coerce.number().int().min(1).default(1),
            limit: z.coerce.number().int().max(50).default(10),
        }),
    }),
};