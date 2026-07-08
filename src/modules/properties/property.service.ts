import { prisma } from "../../lib/prisma"
import { ICreatePropertyPayload } from "./property.interface"


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

export const propertyService = {
    createProperty
}