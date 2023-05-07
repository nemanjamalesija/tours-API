import { NextFunction, Request, Response } from 'express';
import Tour from '../models/tourModel.ts';
import catchAsync from '../helpers/catchAsync.ts';
import handlerFactory from './handlerFactory.ts';
import AppError from '../helpers/appError.ts';

// get top 5 tours middleware
const aliasTopTours = (req: Request, res: Response, next: NextFunction) => {
  (req.query.limit = '5'), (req.query.sort = '-ratingsAverage,price');
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours = handlerFactory.getAll(Tour);
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

// tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/-40,45/unit/mi
const getToursWithin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { latlng, distance, unit } = req.params;

    const [lat, lng] = latlng.split(',');
    const radius =
      unit === 'mi' ? Number(distance) / 3963.2 : Number(distance) / 6378.1;

    if (!lat || !lng) {
      const error = new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400
      );

      return next(error);
    }

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
      status: 'sucess',
      results: tours.length,
      data: { data: tours },
    });
  }
);

export default {
  aliasTopTours,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
};
