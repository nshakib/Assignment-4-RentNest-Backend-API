// Tenant: submit a rental request

import { RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateRentalRequestPayload } from "./rental.interface";

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

export const rentalService = {
  submitRentalRequest,
};
