import { z } from "zod"

const createReviewValidation = z.object({
    body: z.object({
        rentalRequestId: z.string().uuid("Invalid rental request ID"),
        rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
        title: z.string().max(255).optional(),
        reviewText: z.string().min(10, "Review must be at least 10 characters")
    })
})


export const reviewValidation = {
    createReviewValidation,
}