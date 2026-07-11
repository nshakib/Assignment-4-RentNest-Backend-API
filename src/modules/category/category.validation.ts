import { z } from "zod"

const createCategoryValidation = z.object({
    body: z.object({
        name: z.string().min(2, "Category name must be at least 2 characters").max(100)
    })
})

const updateCategoryValidation = z.object({
    body: z.object({
        name: z.string().min(2, "Category name must be at least 2 characters").max(100).optional()
    })
})

export const categoryValidation = {
    createCategoryValidation,
    updateCategoryValidation
}