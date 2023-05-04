import { Document, Types } from 'mongoose';

type geoLocationType = {
  type: {
    type: string;
    default: 'Point';
    enum: ['Point'];
  };
  coordinates: [number, number];
  address: string;
  description: string;
  day?: Number;
};

type guidesType = {
  type: Types.ObjectId;
  ref: string;
}[];

export type TourType = Document & {
  name: string;
  duration: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  maxGroupSize: number;
  difficulty: string;
  summary: string;
  descrption: string;
  imageCover: string;
  images?: string[];
  createdAt: Date;
  startDates?: Date[];
  slug?: string;
  secretTour?: boolean;
  startLocation: geoLocationType;
  locations: geoLocationType[];
  guides: guidesType;
};
