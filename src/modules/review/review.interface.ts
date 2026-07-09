export interface ICreateReviewPayload {
    rentalRequestId: string
    rating: number
    title?: string
    reviewText: string
}