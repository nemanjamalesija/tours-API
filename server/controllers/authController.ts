import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../helpers/catchAsync.ts';
import User from '../models/userModel.ts';
import AppError from '../helpers/appError.ts';
import sendResetEmail from '../helpers/setResetEmail.ts';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_STRING as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, passwordConfirm, passwordChangedAt, role } =
      req.body;

    const newUser = await User.create({
      name,
      email,
      role,
      password,
      passwordConfirm,
      passwordChangedAt,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  }
);

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
      const error = new AppError('Please provide both email and password', 404);

      return next(error);
    }

    // 2. Check if the user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      const error = new AppError('Incorrect email or password', 401);

      next(error);
    }

    // 3. If everything ok, send token to client
    else {
      const token = signToken(user._id);

      res.status(200).json({
        status: 'sucess',
        token,
      });
    }
  }
);

const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get the token and check if it exist
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    )
      token = req.headers.authorization.split(' ')[1] || undefined;

    if (!token) {
      const message = 'You are not logged in! Please log in to get access';
      const error = new AppError(message, 401);

      return next(error);
    }

    // 2. Validate the token
    const decodeTokenFn: (token: string, secret: string) => Promise<any> =
      promisify(jwt.verify);

    const decodedTokenObj = await decodeTokenFn(
      token,
      process.env.JWT_SECRET_STRING as string
    );

    // 3. Check if user still exists
    const currentUser = await User.findById(decodedTokenObj.id);

    if (!currentUser) {
      const message = 'The user belonging to the token no longer exists';
      const error = new AppError(message, 401);

      return next(error);
    }

    // 4. Check if user changed password after the token was issued
    else if (currentUser.changedPasswordAfter(decodedTokenObj.iat)) {
      const error = new AppError(
        'User recently changed password! Please log in again',
        401
      );

      return next(error);
    }

    // If all okay, grant access to protected route
    else {
      req.body = { ...req.body, currentUser };
      return next();
    }
  }
);

const restritTo = (...roles: ['admin', 'lead-guide']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userWithPrivilege = roles.includes(req.body.currentUser.role);

    if (!userWithPrivilege) {
      const message = 'You do not have permission to perfom this operation';
      const error = new AppError(message, 403);

      return next(error);
    }
    return next();
  };
};

const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. get user based on posted email
    const currentUser = await User.findOne({ email: req.body.email });
    console.log('aaaaaaaaaaaa');

    if (!currentUser) {
      const error = new AppError(
        'User with this email adress not found. Please try again',
        404
      );

      return next(error);
    }

    // 2. generate the random token
    const resetToken = currentUser.createPasswordResetToken();
    await currentUser.save({ validateBeforeSave: false });

    // 3. send it back as an email

    //prettier-ignore
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword${resetToken}`;

    const message = `Forgot your password? 
                     Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.
                     \n If you didn't forget your password, please ignore this email.`;

    try {
      await sendResetEmail({
        email: currentUser.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });

      res.status(200).json({
        status: 'sucess',
        message: 'Token sent to the email!',
      });
    } catch (err) {
      currentUser.passwordResetToken = undefined;
      currentUser.passwordResetExpires = undefined;
      await currentUser.save({ validateBeforeSave: false });

      const error = new AppError(
        'There was an error sending the email. Please try again later',
        500
      );

      return next(error);
    }
  }
);

const resetPassword = (req: Request, res: Response, next: NextFunction) => {};

export default {
  signUp,
  login,
  protect,
  restritTo,
  forgotPassword,
  resetPassword,
};
