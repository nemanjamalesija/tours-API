import { Document } from 'mongoose';

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
};

export type userType = Document & {
  name: string;
  email: string;
  photo: string;
  password: string;
  passwordConfirm: string | undefined;
  correctPassword: (
    candidatePassword: string,
    userPassword: string
  ) => Promise<boolean>;
};
