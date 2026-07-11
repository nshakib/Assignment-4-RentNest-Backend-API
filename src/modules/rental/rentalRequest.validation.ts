import { z } from "zod"

const createRentalRequestValidation = z.object({
    params: z.object({
        id: z.string().uuid("Invalid property ID")
    }),
    body: z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        leaseTermMonths: z.number().int().positive().optional(),
        additionalNote: z.string().optional()
    }).refine((data) => data.endDate > data.startDate, {
        message: "End date must be after start date",
        path: ["endDate"]
    })
})

const rejectRentalRequestValidation = z.object({
    body: z.object({
        rejectionReason: z.string().min(5, "Rejection reason must be at least 5 characters")
    })
})

export const rentalRequestValidation = {
    createRentalRequestValidation,
    rejectRentalRequestValidation
}