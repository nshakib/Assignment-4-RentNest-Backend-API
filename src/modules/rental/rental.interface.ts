import { RentalRequestStatus } from "../../../generated/prisma/enums.js";

export interface ICreateRentalRequestPayload {
  startDate: Date;
  endDate: Date;
  leaseTermMonths?: number;
  additionalNote?: string;
}

export interface IRentalRequestQuery {
    status?: RentalRequestStatus
    page?: string
    limit?: string
    sortOrder?: string
    sortBy?: string
}

// rentalRequest.interface.ts
export interface IApproveRentalRequestPayload {
}

export interface IRejectRentalRequestPayload {
    rejectionReason: string
}