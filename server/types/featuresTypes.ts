import mongoose from 'mongoose';
import { TourType } from './modelsTypes.ts';
import { ParsedQs } from 'qs';

export type APIFeaturesQueryType = mongoose.Query<TourType[], TourType, {}, TourType>;

export type APIFeaturesType = {
  query: APIFeaturesQueryType;
  queryString: ParsedQs;
};
