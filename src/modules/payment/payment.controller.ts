import { Request, Response } from "express"
import httpStatus from "http-status"
import { paymentService } from "./payment.service.js"
import { catchAsync } from "../../utils/catchAsync.js"
import { sendResponse } from "../../utils/sendResponse.js"

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.user?.id as string
    const { rentalRequestId } = req.body

    const result = await paymentService.createCheckoutSession(tenantId, rentalRequestId)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Checkout session created successfully",
        data: result
    })
})

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string

    await paymentService.handleWebhook(req.body, signature)

    res.status(200).json({ received: true })
})

const getMyPaymentHistory = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.user?.id as string

    const result = await paymentService.getMyPaymentHistory(tenantId)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment history retrieved successfully",
        data: result
    })
})


export const paymentController = {
    createCheckoutSession,
    handleStripeWebhook,
    getMyPaymentHistory
}