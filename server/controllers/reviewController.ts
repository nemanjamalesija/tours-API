import { NextFunction, Request, Response } from 'express';
import { Review } from '../models/reviewModel.ts';
import handlerFactory from './handlerFactory.ts';

const setTourUserIds = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.body.currentUser.id;

  next();
};

const getAllReviews = handlerFactory.getAll(Review);
const getSingleReview = handlerFactory.getOne(Review, ''); // empty string to ignore .populate()
const createReview = handlerFactory.createOne(Review);
const updateReview = handlerFactory.updateOne(Review);
const deleteReview = handlerFactory.deleteOne(Review);

export default {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview,
  setTourUserIds,
};
