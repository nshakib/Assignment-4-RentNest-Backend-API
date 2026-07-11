import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { propertyService } from "./property.service";
import { PropertyStatus } from "../../../generated/prisma/enums";
import { IPropertyQuery } from "./property.interface";
import { PropertyWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createProperty = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const id = req.user?.id

    const payload = req.body;

    const result = await propertyService.createProperty(payload, id as string);


    sendResponse(res, {
        success : true,
        statusCode : httpStatus.CREATED,
        message : "Property Created SuccessFully",
        data : result
    })
})

const getAllProperties = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const query = req.query;
    const result = await propertyService.getAllProperties(query);

    sendResponse(res, {
        success : true,
        statusCode : httpStatus.OK,
        message : "Properties Fetched Successfully",
        data : result.data,
        meta: result.meta
    })
})

const getAllPropertiesForAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await propertyService.getAllPropertiesForAdmin(req.query as any)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All properties retrieved successfully",
        meta: result.meta,
        data: result.data
    })
})

const getPropertyById = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const id = req.params.id;

    const result = await propertyService.getPropertyById(id as string);

    sendResponse(res, {
        success : true,
        statusCode : httpStatus.OK,
        message : "Property Fetched Successfully",
        data : result
    })
})

const updateProperty = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const landlordId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    const propertyId = req.params.id;
    if(!propertyId){
        throw new Error("Property id is required in the params");
    }
    const payload = req.body;

    const result = await propertyService.updateProperty(propertyId as string, payload, landlordId as string, isAdmin);

    sendResponse(res, {
        success : true,
        statusCode : httpStatus.OK,
        message : "Property Updated Successfully",
        data : result
    })
})

const deleteProperty = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
     const landlordId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    const propertyId = req.params.id;
    if(!propertyId){
        throw new Error("Property id is required in the params");
    }
    const payload = req.body;

    const result = await propertyService.deleteProperty(propertyId as string, landlordId as string, isAdmin);

    sendResponse(res, {
        success : true,
        statusCode : httpStatus.OK,
        message : "Property Deleted Successfully",
        data : result
    })
})
const updatePropertyStatus = catchAsync(async (req: Request, res: Response) => {
    const landlordId = req.user?.id
    const propertyId = req.params.id
    const payload = req.body

    if(!propertyId){
        throw new Error("Property id is required in the params");
    }

    const result = await propertyService.updatePropertyStatus(propertyId as string, landlordId as string,payload)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Property status updated successfully",
        data: result
    })
})

const getPropertyStatusSummary = catchAsync(async (req: Request, res: Response) => {
    const landlordId = req.user?.id

    const result = await propertyService.getPropertyStatusSummary(landlordId as string)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Property status summary retrieved successfully",
        data: result
    })
})

const getMyProperties = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const landlordId = req.user?.id;

    const result = await propertyService.getMyProperties(landlordId as string);

    sendResponse(res, {
        success : true,
        statusCode : httpStatus.OK,
        message : "My Properties Fetched Successfully",
        data : result
    })
})

export const propertyController = {
    createProperty,
    getAllProperties,
    getAllPropertiesForAdmin,
    getPropertyById,
    updateProperty,
    deleteProperty,
    updatePropertyStatus,
    getPropertyStatusSummary,
    getMyProperties
}