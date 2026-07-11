import { Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { userService } from "./user.service"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status"


const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string
    const result = await userService.getMyProfile(userId)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Profile retrieved successfully",
        data: result
    })
})

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string
    const payload = req.body;
    const result = await userService.updateMyProfile(userId, payload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Profile updated successfully",
        data: result
    })
})

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getAllUsers()

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users retrieved successfully",
        data: result
    })
})

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id
    const {activeStatus}  = req.body

    const result = await userService.updateUserStatus(userId as string, activeStatus)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User status updated successfully",
        data: result
    })
})

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string

    const result = await userService.changePassword(userId, req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password changed successfully",
        data: result
    })
})

export const userController = {
    getMyProfile,
    updateMyProfile,
    getAllUsers,
    updateUserStatus,
    changePassword
}