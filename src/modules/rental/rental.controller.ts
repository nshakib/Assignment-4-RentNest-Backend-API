import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const createRentalRequest = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const tenantId = req.user?.id

    const propertyId = req.params.id
    if(!propertyId){
        throw new Error("Property id is required in the params");
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

export const rentalController = {
    createRentalRequest
}