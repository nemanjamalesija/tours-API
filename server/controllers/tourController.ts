import { NextFunction, Request, Response } from 'express';
import Tour from '../models/Tour.ts';

const getAllTours = async (req: Request, res: Response) => {
  try {
    console.log(req.query);
    console.log(req.query.sort);
    // BUILD QUERY
    // 1a Filtering
    const queryObject = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObject[el]);

    // 1b Advanced filtering gte, gt, lte, lt => $gte $gt $lte $lt
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryString));

    // 1c Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.toString().split(',').join(' ');
      console.log(sortBy);

      query = query.sort(sortBy);
      // EXECUTE QUERY
    }
    const tours = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'sucess',
      lenghth: tours.length,
      tours,
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
      tour: currentTour,
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
      createdTour: newTour,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'fail',
      message: `${error.message}`,
    });
  }
};

const updateTour = async (req: Request, res: Response) => {
  console.log(req.body);
  console.log('aa');

  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(201).json({
      status: 'sucess',
      updatedTour,
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

export default { getAllTours, getTour, createTour, updateTour, deleteTour };
