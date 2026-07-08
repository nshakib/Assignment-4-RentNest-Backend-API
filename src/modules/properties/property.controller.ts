import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { propertyService } from "./property.service";

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

const getPropertyById = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const id = req.params.id;

    const result = await propertyService.getPropertyById(id);

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

const getPropertyStats = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const result = await propertyService.getPropertyStats();

    sendResponse(res, {
        success : true,
        statusCode : httpStatus.OK,
        message : "Property Stats Fetched Successfully",
        data : result
    })
})

const getMyProperties = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const id = req.user?.id;

    const result = await propertyService.getMyProperties(id as string);

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
    getPropertyById,
    updateProperty,
    deleteProperty,
    getPropertyStats,
    getMyProperties
}