// Tenant: submit a rental request

import { RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateRentalRequestPayload, IRejectRentalRequestPayload, IRentalRequestQuery } from "./rental.interface";

const submitRentalRequest = async (tenantId: string, propertyId: string, payload: ICreateRentalRequestPayload) => {
  const property = await prisma.property.findUniqueOrThrow({
        where: { 
            id: propertyId 
        },
    });

    if(property.landlordId === tenantId){
        throw new Error("You cannot submit a rental request for your own property!")
    }

  if (property.status !== "active") {
    throw new Error("This property is not available for rent");
  }

  // Prevent duplicate pending requests from the same tenant for the same property
  const existing = await prisma.rentalRequest.findFirst({
    where: {
      propertyId,
      tenantId,
      status: RentalRequestStatus.PENDING,
    },
  });

  if (existing) {
    throw new Error("You already have a pending request for this property");
  }

  const result = await prisma.rentalRequest.create({
    data: {
      ...payload,
      propertyId,
      tenantId,
    },
    include: {
      property: true,
    },
  });

  return result;
};

const getMyRentalRequests = async (tenantId: string, query: IRentalRequestQuery) => {
    const page = Math.max(Number(query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100)
    const skip = (page - 1) * limit

    const sortBy = query.sortBy || "createdAt"
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc"

    const where = {
        tenantId,
        ...(query.status ? { status: query.status } : {})
    }

    const [requests, total] = await Promise.all([
        prisma.rentalRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                property: {
                    include: {
                        category: true,
                        images: true,
                        landlord: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        }),
        prisma.rentalRequest.count({ where })
    ])

    return {
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        data: requests
    }
}

const getReceivedRentalRequests = async (landlordId: string, query: IRentalRequestQuery) => {
    const page = Math.max(Number(query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100)
    const skip = (page - 1) * limit

    const sortBy = query.sortBy || "createdAt"
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc"

    const where = {
        property: { landlordId },
        ...(query.status ? { status: query.status } : {})
    }

    const [requests, total] = await Promise.all([
        prisma.rentalRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                property: true,
                tenant: {
                    select: { id: true, name: true, email: true }
                }
            }
        }),
        prisma.rentalRequest.count({ where })
    ])

    return {
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        data: requests
    }
}

const approveRentalRequest = async (requestId: string, landlordId: string) => {
    const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: { property: true }
    })

    if (rentalRequest.property.landlordId !== landlordId) {
        throw new Error("You are not authorized to approve this request")
    }

    if (rentalRequest.status !== RentalRequestStatus.PENDING) {
        throw new Error(`Cannot approve a request that is already ${rentalRequest.status}`)
    }

    const result = await prisma.rentalRequest.update({
        where: { id: requestId },
        data: {
            status: RentalRequestStatus.APPROVED,
            approvedAt: new Date()
        },
        include: {
            property: true,
            tenant: { select: { id: true, name: true, email: true } }
        }
    })

    return result
}

const rejectRentalRequest = async (
    requestId: string,
    landlordId: string,
    payload: IRejectRentalRequestPayload
) => {
    const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: { property: true }
    })

    if (rentalRequest.property.landlordId !== landlordId) {
        throw new Error("You are not authorized to reject this request")
    }

    if (rentalRequest.status !== RentalRequestStatus.PENDING) {
        throw new Error(`Cannot reject a request that is already ${rentalRequest.status}`)
    }

    const result = await prisma.rentalRequest.update({
        where: { id: requestId },
        data: {
            status: RentalRequestStatus.REJECTED,
            rejectedAt: new Date(),
            rejectionReason: payload.rejectionReason
        },
        include: {
            property: true,
            tenant: { select: { id: true, name: true, email: true } }
        }
    })

    return result
}

export const rentalService = {
  submitRentalRequest,
  getMyRentalRequests,
  getReceivedRentalRequests,
  approveRentalRequest,
  rejectRentalRequest
};
