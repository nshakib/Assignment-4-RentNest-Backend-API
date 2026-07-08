import { prisma } from "../../lib/prisma"
import { ICreatePropertyPayload } from "./property.interface"


const createProperty = async (payload : ICreatePropertyPayload, userId : string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where : {
            id : userId
        }
    })

    if(user.activeStatus === "BLOCKED"){
        throw new Error("User is blocked!")
    }

    const result = await prisma.property.create({
        data : {
            ...payload,
            landlordId : userId
        }
    })

    return result
}

export const propertyService = {
    createProperty
}