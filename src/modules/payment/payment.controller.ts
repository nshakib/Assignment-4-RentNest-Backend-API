import { Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { paymentService } from "./payment.service"
import httpStatus from "http-status"

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.user?.id as string

    const result = await paymentService.createPaymentIntent(tenantId, req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Payment intent created successfully",
        data: result
    })
})

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
    const { paymentIntentId } = req.body

    const result = await paymentService.confirmPayment(paymentIntentId)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment status synced successfully",
        data: result
    })
})

export const paymentController = {
    createPaymentIntent,
    confirmPayment,
}