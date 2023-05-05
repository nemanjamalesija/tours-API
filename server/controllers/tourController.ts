import { NextFunction, Request, Response } from 'express';
import APIFeatures from '../helpers/APIFeatures.ts';
import Tour from '../models/tourModel.ts';
import catchAsync from '../helpers/catchAsync.ts';
import AppError from '../helpers/appError.ts';
import handlerFactory from './handlerFactory.ts';

// get top 5 tours middleware
const aliasTopTours = (req: Request, res: Response, next: NextFunction) => {
  (req.query.limit = '5'), (req.query.sort = '-ratingsAverage,price');
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours = catchAsync(async (req: Request, res: Response) => {
  // EXECUTE QUERY

  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .select()
    .paginate();

  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'sucess',
    lenghth: tours.length,
    data: tours,
  });
});

const getTour = handlerFactory.getOne(Tour, 'reviews');

const createTour = handlerFactory.createOne(Tour);

const updateTour = handlerFactory.updateOne(Tour);

const deleteTour = handlerFactory.deleteOne(Tour);

// AGREGATION PIPELINE
const getTourStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },

    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        averageRating: { $avg: '$ratingsAverage' },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    { $sort: { averageRating: -1 } },
  ]);

  res.status(200).json({
    message: 'sucess',
    data: stats,
  });
});

const getMonthlyPlan = catchAsync(async (req: Request, res: Response) => {
  const year = Number(req.params.year);

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },

    { $addFields: { month: '$_id' } },

    { $project: { _id: 0 } },

    { $sort: { numTourStarts: -1 } },

    { $limit: 12 },
  ]);

  res.status(200).json({
    length: plan.length,
    message: 'sucess',
    data: plan,
  });
});

export default {
  aliasTopTours,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
};
