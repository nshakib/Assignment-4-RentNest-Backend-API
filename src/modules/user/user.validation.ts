import { z } from "zod"

const updateProfileValidation = z.object({
    body: z.object({
        name: z.string().min(2).max(255).optional()
    })
})

const changePasswordValidation = z.object({
    body: z.object({
        oldPassword: z.string().min(1, "Old password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters")
    })
})

export const userValidation = {
    updateProfileValidation,
    changePasswordValidation
}