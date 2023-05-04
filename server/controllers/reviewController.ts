import { NextFunction, Request, Response } from 'express';
import { Review } from '../models/reviewModel.ts';
import catchAsync from '../helpers/catchAsync.ts';
import AppError from '../helpers/appError.ts';

const getAllReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviews = await Review.find();

    res.status(200).json({
      status: 'sucess',
      length: reviews.length,
      data: {
        reviews,
      },
    });
  }
);

const getSingleReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const currentReview = await Review.findById(req.params.id);

    if (!currentReview) {
      const error = new AppError('There is no review under that ID', 404);

      return next(error);
    }

    res.status(200).json({
      status: 'sucess',
      data: { currentReview },
    });
  }
);

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { review, rating, createdAt, tour, user } = req.body;

    const newReview = await Review.create({
      review,
      rating,
      createdAt,
      tour,
      user,
    });

    res.status(201).json({ status: 'sucess', data: { newReview } });
  }
);

const updateReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedReview) {
      const error = new AppError('There is no review under that ID', 404);

      return next(error);
    }

    res.status(201).json({
      status: 'sucess',
      data: { updatedReview },
    });
  }
);

const deleteReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);

    if (!deletedReview) {
      const error = new AppError('There is no review under that ID', 404);

      return next(error);
    }
    res.status(500).json({ status: 'sucess', data: null });
  }
);

export default {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview,
};
