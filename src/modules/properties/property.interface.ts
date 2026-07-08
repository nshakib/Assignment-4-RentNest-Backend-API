export interface ICreatePropertyPayload {
    title: string;
    description: string;
    rentAmount: number;
    address: string;
    city: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    availableFrom: Date;
    amenities: string[];
}