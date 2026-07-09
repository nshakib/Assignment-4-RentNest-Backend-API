import { ActiveStatus, Role } from "../../../generated/prisma/enums"
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

const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            activeStatus: true,
            createdAt: true,
            updatedAt: true
            // password excluded
        },
        orderBy: { createdAt: "desc" }
    })

    return users
}

const updateUserStatus = async (userId: string, activeStatus: ActiveStatus) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId }
    })

    if (user.role === Role.ADMIN) {
        throw new Error("Cannot change status of an admin account")
    }

    const result = await prisma.user.update({
        where: { id: userId },
        data: { activeStatus },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            activeStatus: true
        }
    })

    return result
}

export const userService = {
    getMyProfile,
    updateMyProfile,
    getAllUsers,
    updateUserStatus
}