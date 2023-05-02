import { NextFunction, Request, Response } from 'express';
import catchAsync from '../helpers/catchAsync.ts';
import User from '../models/userModel.ts';
import AppError from '../helpers/appError.ts';

const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj: { [key: string]: string } = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
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
    console.log(updatedUser);
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

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.find();

  res.status(200).json({
    length: users.length,
    status: 'sucess',
    data: { users },
  });
});

const getUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
const updateUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
const deleteUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

export default {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
};
