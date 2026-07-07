import { sendResponse } from "../utils/sendResponse";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

export const validateRegisterRole = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.body;

  if (!['TENANT', 'LANDLORD'].includes(role)) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Invalid role. Only TENANT or LANDLORD can self-register',
    });
  }

  next();
};