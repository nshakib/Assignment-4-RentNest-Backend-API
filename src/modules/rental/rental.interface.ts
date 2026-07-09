export interface ICreateRentalRequestPayload {
  startDate: Date;
  endDate: Date;
  leaseTermMonths?: number;
  additionalNote?: string;
}