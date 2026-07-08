import { prisma } from "../../lib/prisma"
import { ICreatePropertyPayload, IPropertyQuery } from "./property.interface"
import { PropertyWhereInput } from "../../../generated/prisma/models"


const createProperty = async ( payload : ICreatePropertyPayload, userId : string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where : {
            id : userId
        }
    })

    if(user.activeStatus === "BLOCKED"){
        throw new Error("User is blocked!")
    }
    const { amenities, ...propertyData } = payload

    const result = await prisma.property.create({
        data : {
            ...propertyData,
            landlordId : userId,
            amenities: amenities && amenities.length > 0
                ? {
                    create: amenities.map((amenityId) => ({
                        amenityId // or whatever the FK field is named on PropertyAmenity
                    }))
                }
                : undefined
        }
    })

    return result
}

const buildWhereClause = (query: IPropertyQuery): PropertyWhereInput => {
    const {
        searchTerm,
        city,
        categoryId,
        minRent,
        maxRent,
        bedrooms,
        bathrooms,
        familyAllowed,
        bachelorAllowed,
        petsAllowed,
        smokingAllowed,
        amenities,
        status
    } = query

    const andConditions: PropertyWhereInput[] = []

    // Default to only showing active listings unless caller overrides it
    andConditions.push({ status: status ?? "active" })

    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: "insensitive" } },
                { description: { contains: searchTerm, mode: "insensitive" } },
                { city: { contains: searchTerm, mode: "insensitive" } },
                { neighborhood: { contains: searchTerm, mode: "insensitive" } },
                { streetAddress: { contains: searchTerm, mode: "insensitive" } }
            ]
        })
    }

    if (city) {
        andConditions.push({ city: { equals: city, mode: "insensitive" } })
    }

    if (categoryId) {
        andConditions.push({ categoryId })
    }

    if (bedrooms) {
        andConditions.push({ bedrooms: Number(bedrooms) })
    }

    if (bathrooms) {
        andConditions.push({ bathrooms: Number(bathrooms) })
    }

    if (familyAllowed) {
        andConditions.push({ familyAllowed: familyAllowed === "true" })
    }

    if (bachelorAllowed) {
        andConditions.push({ bachelorAllowed: bachelorAllowed === "true" })
    }

    if (petsAllowed) {
        andConditions.push({ petsAllowed: petsAllowed === "true" })
    }

    if (smokingAllowed) {
        andConditions.push({ smokingAllowed: smokingAllowed === "true" })
    }

    if (minRent || maxRent) {
        andConditions.push({
            monthlyRent: {
                ...(minRent ? { gte: Number(minRent) } : {}),
                ...(maxRent ? { lte: Number(maxRent) } : {})
            }
        })
    }

    if (amenities) {
        const amenityIds = amenities.split(",").map((id) => id.trim())
        andConditions.push({
            AND: amenityIds.map((amenityId) => ({
                amenities: {
                    some: { amenityId }
                }
            }))
        })
    }

    return andConditions.length > 0 ? { AND: andConditions } : {}
}

const getAllProperties = async (query: IPropertyQuery) => {
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const skip = (page - 1) * limit

    const sortBy = query.sortBy || "createdAt"
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc"

    const where = buildWhereClause(query)

    const [properties, total] = await Promise.all([
        prisma.property.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                category: true,
                images: true,
                amenities: {
                    include: { amenity: true }
                },
                landlord: {
                    select: { id: true, name: true, email: true }
                }
            }
        }),
        prisma.property.count({ where })
    ])

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },
        data: properties
    }
}

const getPropertyById = async (id : string) => {
    const result = await prisma.property.findUniqueOrThrow({
        where : {
            id
        }
    })

    return result
}

const updateProperty = async (id : string, payload : ICreatePropertyPayload) => {
    const result = await prisma.property.update({
        where : {
            id
        },
        data : payload
    })

    return result

}

const deleteProperty = async (id : string) => {
    const result = await prisma.property.delete({
        where : {
            id
        }
    })

    return result
}

const getPropertyStats = async () => {
    const result = await prisma.property.groupBy({
        by : ["status"],
        _count : {
            id : true
        }
    })

    return result
}

const getMyProperties = async (userId : string) => {
    const result = await prisma.property.findMany({
        where : {
            landlordId : userId
        }
    })

    return result
}

export const propertyService = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getPropertyStats,
    getMyProperties
}