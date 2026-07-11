import {z} from "zod";
import { PropertyStatus } from "../../../generated/prisma/enums.js";

const createPropertyValidation = z.object({
    body:z.object({
        categoryId: z.string().uuid("Invalid category ID"),
        title: z.string().min(3, "Title must be at least 3 characters").max(255),
        description: z.string().optional(),
        areaSqft: z.number().int().positive().optional(),
        bedrooms: z.number().int().nonnegative().optional(),
        bathrooms: z.number().int().nonnegative().optional(),
        monthlyRent: z.number().positive("Rent must be greater than 0"),
        maintenanceFee: z.number().nonnegative().optional(),
        city: z.string().min(1, "City is required"),
        neighborhood: z.string().optional(),
        streetAddress: z.string().min(1, "Street address is required"),
        familyAllowed: z.boolean().optional(),
        bachelorAllowed: z.boolean().optional(),
        petsAllowed: z.boolean().optional(),
        smokingAllowed: z.boolean().optional(),
        availableFrom: z.coerce.date().optional(),
        amenities: z.array(z.string().uuid("Invalid amenity ID")).optional()
    })
})

const updatePropertyValidation = z.object({
    body:z.object({
        categoryId: z.string().uuid().optional(),
        title: z.string().min(3).max(255).optional(),
        description: z.string().optional(),
        areaSqft: z.number().int().positive().optional(),
        bedrooms: z.number().int().nonnegative().optional(),
        bathrooms: z.number().int().nonnegative().optional(),
        monthlyRent: z.number().positive().optional(),
        maintenanceFee: z.number().nonnegative().optional(),
        city: z.string().min(1).optional(),
        neighborhood: z.string().optional(),
        streetAddress: z.string().min(1).optional(),
        familyAllowed: z.boolean().optional(),
        bachelorAllowed: z.boolean().optional(),
        petsAllowed: z.boolean().optional(),
        smokingAllowed: z.boolean().optional(),
        availableFrom: z.coerce.date().optional(),
        amenities: z.array(z.string().uuid()).optional()
    })
})

const updatePropertyStatusValidation = z.object({
    body:z.object({
        status: z.nativeEnum(PropertyStatus)
    })
})

export const propertyValidation = {
    createPropertyValidation,
    updatePropertyValidation,
    updatePropertyStatusValidation
}