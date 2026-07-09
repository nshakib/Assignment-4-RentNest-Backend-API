import { Request, Response } from "express"
import httpStatus from "http-status"
import { reviewService } from "./review.service"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"

const createReview = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.user?.id as string
    const payload = req.body


    const result = await reviewService.createReview(tenantId, payload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Review submitted successfully",
        data: result
    })
})

export const reviewController = {
    createReview,
}