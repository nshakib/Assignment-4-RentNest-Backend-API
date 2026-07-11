import { Request, Response } from "express"
import httpStatus from "http-status"
import { reviewService } from "./review.service.js"
import { catchAsync } from "../../utils/catchAsync.js"
import { sendResponse } from "../../utils/sendResponse.js"

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

const getReceivedReviews = catchAsync(async (req: Request, res: Response) => {
    const landlordId = req.user?.id as string

    const result = await reviewService.getReceivedReviews(landlordId)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Received reviews retrieved successfully",
        data: result
    })
})

export const reviewController = {
    createReview,
    getReceivedReviews
}