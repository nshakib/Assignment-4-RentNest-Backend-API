import { prisma } from "../../lib/prisma.js"
import { ICreatePropertyPayload, IPropertyQuery, IUpdatePropertyPayload, IUpdatePropertyStatusPayload } from "./property.interface.js"
import { PropertyWhereInput } from "../../../generated/prisma/models.js"
import { PropertyStatus } from "../../../generated/prisma/enums.js"


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
    andConditions.push({ status: (status as PropertyStatus) ?? PropertyStatus.ACTIVE })

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

const getAllPropertiesForAdmin = async (query: IPropertyQuery) => {
    const page = Math.max(Number(query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100)
    const skip = (page - 1) * limit

    const sortBy = query.sortBy || "createdAt"
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc"

    const andConditions: PropertyWhereInput[] = []

    if (query.status) {
        andConditions.push({ status: query.status as PropertyStatus })
    }

    if (query.searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: query.searchTerm, mode: "insensitive" } },
                { city: { contains: query.searchTerm, mode: "insensitive" } }
            ]
        })
    }

    const where: PropertyWhereInput = andConditions.length > 0 ? { AND: andConditions } : {}

    const [properties, total] = await Promise.all([
        prisma.property.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                category: true,
                landlord: {
                    select: { id: true, name: true, email: true, activeStatus: true }
                }
            }
        }),
        prisma.property.count({ where })
    ])

    return {
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        data: properties
    }
}

const getPropertyById = async (propertyId : string) => {
    const property = await prisma.property.findUniqueOrThrow({
        where : {
            id: propertyId
        },
        include:{
            landlord : {
                omit:{password:true},
            },
            amenities: {
                include: {
                    amenity: true  // pulls the actual Amenity record (name, icon, etc.)
                }
            },
            category : true,
            images : true,
            reviews : true,
            _count:{
                select : {
                    reviews : true
                }
            }
        }
    })

    if (!property) {
        throw new Error('Property not found');
    }

    return property
}

const updateProperty = async (propertyId : string, payload : IUpdatePropertyPayload, landlordId : string, isAdmin:boolean) => {
    const property = await prisma.property.findUniqueOrThrow({
        where : {
            id : propertyId
        }
    })

    if(!isAdmin && property.landlordId !== landlordId){
        throw new Error("You are not the owner of this property!")
    }

    const { amenities, ...propertyData } = payload;
    const result = await prisma.property.update({
        where : {
            id : propertyId
        },
        data: {
            ...propertyData,
            ...(amenities && {
                amenities: {
                deleteMany: {},                      // clear old links
                create: amenities.map((amenityId) => ({ amenityId })),
                },
            }),
        },
        include: {
            landlord: {
                omit: {
                    password: true
                }
            },
        }
    })

    return result;

}

const deleteProperty = async (propertyId: string, landlordId : string, isAdmin : boolean) => {
    const property = await prisma.property.findUniqueOrThrow({
        where : {
            id: propertyId
        }
    })

    if (!isAdmin && property.landlordId !== landlordId) {
        throw new Error("You are not the owner of this property!")
    }

    await prisma.property.delete({
        where : {
            id : propertyId
        }
    })
}

const updatePropertyStatus = async (propertyId: string, landlordId: string, payload: IUpdatePropertyStatusPayload) => {
    const property = await prisma.property.findUniqueOrThrow({
        where: { id: propertyId }
    })

    if (property.landlordId !== landlordId) {
        throw new Error("You are not authorized to update this property")
    }



    const result = await prisma.property.update({
        where: { id: propertyId },
        data: { 
            status: payload.status 
        }
    })

    return result
}

const getPropertyStatusSummary = async (landlordId: string) => {
    const result = await prisma.property.groupBy({
        by: ["status"],
        where: { landlordId },
        _count: {
            id: true
        }
    })

    const summary = result.reduce((acc: Record<string, number>, item: { status: string; _count: { id: number } }) => {
        acc[item.status] = item._count.id
        return acc
    }, {} as Record<string, number>)

    return summary
}

const getMyProperties = async (userId : string) => {
    const result = await prisma.property.findMany({
        where : {
            landlordId : userId
        },
        include: {
            category: true,
            images: true,
            amenities: {
                include: { amenity: true }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    return result
}

export const propertyService = {
    createProperty,
    getAllProperties,
    getAllPropertiesForAdmin,
    getPropertyById,
    updateProperty,
    deleteProperty,
    updatePropertyStatus,
    getPropertyStatusSummary,
    getMyProperties
}