import { RentalRequestStatus } from "../../../generated/prisma/enums.js"
import ApiError from "../../errors/ApiError.js"
import { prisma } from "../../lib/prisma.js"
import { ICreateReviewPayload } from "./review.interface.js"
import httpStatus from "http-status"

const createReview = async (tenantId: string, payload: ICreateReviewPayload) => {
    const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
        where: { 
            id: payload.rentalRequestId 
        }
    })

    // Only the tenant who made the request can review it
    if (rentalRequest.tenantId !== tenantId) {
        throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to review this rental")
    }

    
   if (rentalRequest.status !== RentalRequestStatus.COMPLETED) {
        throw new ApiError(httpStatus.BAD_REQUEST, "You can only review a rental after it has been completed")
    }

    // Prevent duplicate reviews (DB constraint also enforces this, but a clean error is nicer)
    const existingReview = await prisma.review.findUnique({
        where: { rentalRequestId: payload.rentalRequestId }
    })

    if (existingReview) {
        throw new ApiError(httpStatus.BAD_REQUEST, "You have already reviewed this rental")
    }

    if (payload.rating < 1 || payload.rating > 5) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5")
    }

    const result = await prisma.review.create({
        data: {
            propertyId: rentalRequest.propertyId,
            tenantId,
            rentalRequestId: payload.rentalRequestId,
            rating: payload.rating,
            title: payload.title,
            reviewText: payload.reviewText
        },
        include: {
            tenant: { select: { id: true, name: true } },
            property: { select: { id: true, title: true } }
        }
    })

    return result
}

const getReceivedReviews = async (landlordId: string) => {
    const reviews = await prisma.review.findMany({
        where: {
            property: { landlordId }
        },
        include: {
            tenant: { select: { id: true, name: true } },
            property: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: "desc" }
    })

    return reviews
}

export const reviewService = {
    createReview,
    getReceivedReviews
}