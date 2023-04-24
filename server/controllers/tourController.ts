import { NextFunction, Request, Response } from 'express';
import Tour from '../models/Tour.ts';
import { ParsedQs } from 'qs';
import { APIFeaturesType, APIFeaturesQueryType } from '../types/featuresTypes.ts';

// get top 5 tours middleware
const aliasTopTours = (req: Request, res: Response, next: NextFunction) => {
  (req.query.limit = '5'), (req.query.sort = '-ratingsAverage,price');
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

class APIFeatures implements APIFeaturesType {
  query: APIFeaturesQueryType;
  queryString: ParsedQs;

  constructor(query: APIFeaturesQueryType, queryString: ParsedQs) {
    this.query = query;
    this.queryString = queryString;
  }

  //1 filtering
  filter() {
    // 1a excluding fields
    const queryObject = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObject[el]);

    // 1b Advanced filtering gte, gt, lte, lt => $gte $gt $lte $lt
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  // 2 sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.toString().split(',').join(' ');
      console.log(sortBy);

      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort('price');

    return this;
  }

  // 3 field limiting
  select() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.toString().split(',').join(' ');

      this.query = this.query.select(fields);
    } else this.query = this.query.select('-__v');

    return this;
  }

  paginate() {
    // 4 pagination

    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    if (this.queryString.page) {
      const countDocumentsAsync = async () => await Tour.countDocuments();
      countDocumentsAsync().then((numTours) => {
        if (skip >= numTours) throw new Error('This page does not exist!');
      });
    }

    return this;
  }
}

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

export default {
  aliasTopTours,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
};
