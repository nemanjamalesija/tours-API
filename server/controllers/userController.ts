import { NextFunction, Request, Response } from 'express';
import catchAsync from '../helpers/catchAsync.ts';
import User from '../models/userModel.ts';
import AppError from '../helpers/appError.ts';
import handlerFactory from './handlerFactory.ts';

const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj: { [key: string]: string } = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = req.body.currentUser.id;

  next();
};

const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Create error if user posts password data
    if (req.body.password || req.body.passwordConfirm) {
      const error = new AppError(
        'This route is not for password update. Please use /updateMypassword',
        400
      );

      next(error);
    }

    // 2. Filter fields that are not allowed
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3. Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.body.currentUser.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    //4. Send response to the client
    res.status(200).json({
      status: 'sucess',
      data: {
        updatedUser,
      },
    });
  }
);

const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.body.currentUser._id, {
      active: false,
    });

    res.status(204).json({
      status: 'sucess',
      data: null,
    });
  }
);

const getAllUsers = handlerFactory.getAll(User);
const getUser = handlerFactory.getOne(User, '');

// ONLY FOR ADMINISTORS. DO NOT UPDATE PASSWORDS WITH THIS
const updateUser = handlerFactory.updateOne(User);
const deleteUser = handlerFactory.deleteOne(User);

export default {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
};
