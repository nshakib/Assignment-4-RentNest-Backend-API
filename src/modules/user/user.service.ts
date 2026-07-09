import { prisma } from "../../lib/prisma"

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

export const userService = {
    getMyProfile,
}