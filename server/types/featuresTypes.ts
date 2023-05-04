import mongoose from 'mongoose';
import { TourType } from './tourTypes.ts';

export type APIFeaturesQueryType = mongoose.Query<
  TourType[],
  TourType,
  {},
  TourType
>;
