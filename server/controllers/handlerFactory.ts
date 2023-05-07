import { Model, Document } from 'mongoose';
import catchAsync from '../helpers/catchAsync.ts';
import AppError from '../helpers/appError.ts';
import { NextFunction, Request, Response } from 'express';
import APIFeatures from '../helpers/APIFeatures.ts';
import { Review } from '../models/reviewModel.ts';

const deleteOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      const error = new AppError('No document found with that ID', 404);

      return next(error);
    }

    res.status(204).json({
      status: 'sucess',
      data: null,
    });
  });

const updateOne = <T extends Document>(Model: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      const error = new AppError('No document found with that ID', 404);

      return next(error);
    }

    res.status(201).json({
      status: 'sucess',
      data: {
        data: doc,
      },
    });
  });

const createOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = new Model(req.body);

    await doc.save();

    res.status(201).json({
      status: 'sucess',
      data: { doc },
    });
  });

const getOne = <T extends Document>(Model: Model<T>, populateField: string) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findById(req.params.id).populate(populateField);

    if (!doc) {
      const error = new AppError('There is no document with that ID', 404);

      return next(error);
    }

    res.status(200).json({
      status: 'sucess',
      data: { doc },
    });
  });

const getAll = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }; // to allow ApiFeatures on getAllReviews

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .select()
      .paginate();

    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'sucess',
      length: doc.length,
      data: { doc },
    });
  });

export default { deleteOne, updateOne, createOne, getOne, getAll };
