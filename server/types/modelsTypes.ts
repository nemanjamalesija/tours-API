import { Document, ToObjectOptions, Types } from 'mongoose';

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
};
