import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { categoryService } from "./category.service.js";
import httpStatus from "http-status"


const createCategory = catchAsync(async (req, res) => {
    const payload = req.body;
    const result = await categoryService.createCategory(payload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Category created successfully",
        data: result
    })
})

const getAllCategories = catchAsync(async (req:Request, res:Response) => {
    const result = await categoryService.getAllCategories()

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories retrieved successfully",
        data: result
    })
})

const updateCategory = catchAsync(async (req, res) => {
    const id = req.params.id
    const payload = req.body;
    const result = await categoryService.updateCategory(id as string, payload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category updated successfully",
        data: result
    })
})

const deleteCategory = catchAsync(async (req, res) => {
    const id = req.params.id
    const result = await categoryService.deleteCategory(id as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category deleted successfully",
        data: result
    })
})


export const categoryController = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
}