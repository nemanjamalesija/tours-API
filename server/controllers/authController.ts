import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel.ts';
import catchAsync from '../helpers/catchAsync.ts';

const signUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newUser = await User.create({ ...req.body });

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

export default { signUp };