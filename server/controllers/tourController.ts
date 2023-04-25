import { NextFunction, Request, Response } from 'express';
import APIFeatures from '../helpers/APIFeatures.ts';
import Tour from '../models/Tour.ts';

// get top 5 tours middleware
const aliasTopTours = (req: Request, res: Response, next: NextFunction) => {
  (req.query.limit = '5'), (req.query.sort = '-ratingsAverage,price');
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours = async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    res.status(404).json({
      status: 'fail',
      message: `${error.message}`,
    });
  }
};

const getTour = async (req: Request, res: Response) => {
  try {
    const currentTour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'sucess',
      data: currentTour,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'fail',
      message: `${error.message}`,
    });
  }
};

const createTour = async (req: Request, res: Response) => {
  try {
    const newTour = new Tour({
      ...req.body,
    });

    await newTour.save();

    res.status(201).json({
      status: 'sucess',
      data: newTour,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'fail',
      message: `${error.message}`,
    });
  }
};

const updateTour = async (req: Request, res: Response) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(201).json({
      status: 'sucess',
      data: updatedTour,
    });
  } catch (error: any) {
    res.status(501).json({
      status: 'fail',
      message: `${error.message}`,
    });
  }
};

const deleteTour = async (req: Request, res: Response) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    res.status(500).json({
      status: 'sucess',
      deletedTour,
    });
  } catch (error: any) {
    res.status(501).json({
      status: 'fail',
      message: `${error.message}`,
    });
  }
};

// AGREGATION PIPELINE
const getTourStats = async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    res.status(404).json({
      status: 'fail',
      message: `${error.message}`,
    });
  }
};

`mali drazen iz somica zivio je preko pica`;

const getMonthlyPlan = async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    res.status(404).json({
      status: 'fail',
      message: `${error.message}`,
    });
  }
};

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
