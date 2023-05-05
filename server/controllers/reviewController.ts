import { NextFunction, Request, Response } from 'express';
import { Review } from '../models/reviewModel.ts';
import catchAsync from '../helpers/catchAsync.ts';
import handlerFactory from './handlerFactory.ts';

const getAllReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter).select('name');

    res.status(200).json({
      status: 'sucess',
      length: reviews.length,
      data: {
        reviews,
      },
    });
  }
);

const setTourUserIds = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.body.currentUser.id;

  next();
};

const createReview = handlerFactory.createOne(Review);
const updateReview = handlerFactory.updateOne(Review);
const getSingleReview = handlerFactory.getOne(Review, '');
const deleteReview = handlerFactory.deleteOne(Review);

export default {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview,
  setTourUserIds,
};
