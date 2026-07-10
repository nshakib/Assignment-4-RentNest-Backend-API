import ApiError from "../../errors/ApiError"
import { prisma } from "../../lib/prisma"
import { ICreateCategoryPayload } from "./category.interface"
import httpStatus from "http-status"


const createCategory = async (payload: ICreateCategoryPayload) => {
    const existing = await prisma.category.findUnique({
        where: {
            name: payload.name
        }
    })

    if (existing) {
        throw new ApiError(httpStatus.BAD_REQUEST, "This Category already exists");
    }

    const result = await prisma.category.create({ 
        data: payload 
    })

    return result
}

const getAllCategories = async () => {
    const result = await prisma.category.findMany({
        orderBy: {
            createdAt: "asc"
        }
    })
    return result
}

const updateCategory = async (categoryId: string, payload: ICreateCategoryPayload) => {
    const category = await prisma.category.findUniqueOrThrow({
        where: { id: categoryId },
    })

    if(payload.name) {
        const existing = await prisma.category.findUnique({
            where: {
                name: payload.name
            }
        })
    
        if (existing && existing.id !== category.id) {
            throw new ApiError(httpStatus.BAD_REQUEST, "This Category name is already exists");
        }
    }

    const result = await prisma.category.update({
        where: { id: categoryId },
        data: payload
    })

    return result
}

const deleteCategory = async (categoryId: string) => {
    const category = await prisma.category.findUniqueOrThrow({
        where: { id: categoryId },
    })

    const propertiesUsingCategory = await prisma.property.count({
        where: {
            categoryId
        }
    })

    if (propertiesUsingCategory) {
        throw new ApiError(httpStatus.BAD_REQUEST, "This Category is still in use");
    }

    const result = await prisma.category.delete({
        where: { id: categoryId }
    })
    return result
}

export const categoryService = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
}