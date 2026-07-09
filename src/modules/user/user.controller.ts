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

export const userController = {
    getMyProfile
}