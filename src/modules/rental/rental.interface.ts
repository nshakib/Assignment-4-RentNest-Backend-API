import { RentalRequestStatus } from "../../../generated/prisma/enums";

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