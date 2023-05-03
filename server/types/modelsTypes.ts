import { Document } from 'mongoose';

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
  guides: any[];
};

export type userType = Document & {
  name: string;
  email: string;
  photo: string;
  role: string;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  passwordResetToken: string | undefined;
  passwordResetExpires: Date | undefined;
  active: boolean;
  correctPassword: (
    candidatePassword: string,
    userPassword: string
  ) => Promise<boolean>;

  changedPasswordAfter: (jwtTimestamp: number) => boolean;
  createPasswordResetToken: () => string;
};
