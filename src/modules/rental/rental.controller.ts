import ApiError from "../../errors/ApiError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const createRentalRequest = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const tenantId = req.user?.id

    const propertyId = req.params.id
    if (!propertyId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Property id is required in the params")
    }

    const payload = req.body;

    const result = await rentalService.submitRentalRequest(tenantId as string, propertyId as string, payload);


    sendResponse(res, {
        success : true,
        statusCode : httpStatus.CREATED,
        message : "Rental Request Created SuccessFully",
        data : result
    })
})

const getMyRentalRequests = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.user?.id // adjust based on your auth middleware's shape
    const result = await rentalService.getMyRentalRequests(tenantId as string, req.query)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Rental request history retrieved successfully",
        meta: result.meta,
        data: result.data
    })
})

const getReceivedRentalRequests = catchAsync(async (req: Request, res: Response) => {
    const landlordId = req.user?.id
    const result = await rentalService.getReceivedRentalRequests(landlordId as string, req.query)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Received rental requests retrieved successfully",
        meta: result.meta,
        data: result.data
    })
})


const approveRentalRequest = catchAsync(async (req: Request, res: Response) => {
    const landlordId = req.user?.id
    const requestId  = req.params.id

    const result = await rentalService.approveRentalRequest(requestId as string, landlordId as string)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Rental request approved successfully",
        data: result
    })
})

const rejectRentalRequest = catchAsync(async (req: Request, res: Response) => {
    const landlordId = req.user?.id
    const requestId = req.params.id

    const result = await rentalService.rejectRentalRequest(requestId as string, landlordId as string, req.body)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Rental request rejected successfully",
        data: result
    })
})


export const rentalController = {
    createRentalRequest,
    getMyRentalRequests,
    getReceivedRentalRequests,
    approveRentalRequest,
    rejectRentalRequest
}