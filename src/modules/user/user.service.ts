import { prisma } from "../../lib/prisma"
import { IUpdateProfilePayload } from "./user.interface"

const getMyProfile = async (userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            activeStatus: true,
            createdAt: true,
            updatedAt: true
            // password intentionally excluded
        }
    })

    return user
}

const updateMyProfile = async (userId: string, payload: IUpdateProfilePayload) => {
    if (payload.email) {
        const existing = await prisma.user.findUnique(
            { 
                where: { 
                    email: payload.email 
                } 
            })
        if (existing && existing.id !== userId) {
            throw new Error("This email is already in use")
        }
    }

    const result = await prisma.user.update({
        where: { id: userId },
        data: payload,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            activeStatus: true,
            updatedAt: true
        }
    })

    return result
}

export const userService = {
    getMyProfile,
    updateMyProfile
}