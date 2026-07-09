import { RentalRequestStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"
import { ICreateReviewPayload } from "./review.interface"
import httpStatus from "http-status"

const createReview = async (tenantId: string, payload: ICreateReviewPayload) => {
    const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
        where: { 
            id: payload.rentalRequestId 
        }
    })

    // Only the tenant who made the request can review it
    if (rentalRequest.tenantId !== tenantId) {
        throw new Error("You are not authorized to review this rental")
    }

    // Only allow reviews on approved rentals
    if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
        throw new Error("You can only review a rental that has been approved")
    }

    // Optional: only allow reviews after the lease has actually ended
    if (rentalRequest.endDate > new Date()) {
        throw new Error( "You can only review a rental after it has ended")
    }

    // Prevent duplicate reviews (DB constraint also enforces this, but a clean error is nicer)
    const existingReview = await prisma.review.findUnique({
        where: { rentalRequestId: payload.rentalRequestId }
    })

    if (existingReview) {
        throw new Error( "You have already reviewed this rental")
    }

    if (payload.rating < 1 || payload.rating > 5) {
        throw new Error("Rating must be between 1 and 5")
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

export const reviewService = {
    createReview
}