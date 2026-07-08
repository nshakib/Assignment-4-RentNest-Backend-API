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