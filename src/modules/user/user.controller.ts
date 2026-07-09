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

export const userController = {
    getMyProfile,
    updateMyProfile
}