import { PropertyStatus } from "../../../generated/prisma/enums"

export interface ICreatePropertyPayload {
    categoryId: string
    title: string
    description?: string
    areaSqft?: number
    bedrooms?: number
    bathrooms?: number
    monthlyRent: number
    maintenanceFee?: number
    city: string
    neighborhood?: string
    streetAddress: string
    familyAllowed?: boolean
    bachelorAllowed?: boolean
    petsAllowed?: boolean
    smokingAllowed?: boolean
    availableFrom?: Date
    amenities?: string[] // array of amenity IDs, handled via nested create/connect
}

export interface IUpdatePropertyPayload{
    categoryId?: string
    title?: string
    description?: string
    areaSqft?: number
    bedrooms?: number
    bathrooms?: number
    monthlyRent?: number
    maintenanceFee?: number
    city?: string
    neighborhood?: string
    streetAddress?: string
    status?: PropertyStatus
    familyAllowed?: boolean
    bachelorAllowed?: boolean
    petsAllowed?: boolean
    smokingAllowed?: boolean
    availableFrom?: Date
    amenities?: string[]
}

export interface IPropertyQuery {

    searchTerm?: string
    city?: string
    categoryId?: string
    minRent?: string
    maxRent?: string
    bedrooms?: string
    bathrooms?: string
    familyAllowed?: string
    bachelorAllowed?: string
    petsAllowed?: string
    smokingAllowed?: string
    amenities?: string // comma-separated amenity IDs, e.g. "id1,id2,id3"
    status?: string
    page?: string
    limit?: string
    sortOrder?: string
    sortBy?: string
} 