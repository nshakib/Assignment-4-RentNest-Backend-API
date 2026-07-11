import z from "zod"

const registerValidation = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(255),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(["TENANT", "LANDLORD"], {
            error: "Role must be either TENANT or LANDLORD"
        })
    })
})

const loginValidation = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required")
    })
})

const refreshTokenValidation = {
    refreshToken: z.object({
        body: z.object({
            refreshToken: z.string().min(1, "Refresh token required"),
        }),
    }),
};

export const authValidation = {
    registerValidation,
    loginValidation,
    refreshTokenValidation
}