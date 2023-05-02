import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../helpers/catchAsync.ts';
import User from '../models/userModel.ts';
import AppError from '../helpers/appError.ts';
import sendResetEmail from '../helpers/setResetEmail.ts';
import crypto from 'crypto';
import { userType } from '../types/modelsTypes.ts';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_STRING as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (res: Response, statusCode: number, user: userType) => {
  const token = signToken(user._id);

  const jwtCookieExpiresIn =
    Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000; // miliseconds

  const expirationDate = new Date(Date.now() + jwtCookieExpiresIn);

  const cookieOptions = {
    expires: expirationDate,
    secure: true,
    httpOnly: true,
  };

  if (process.env.NODE_ENV !== 'development') cookieOptions.secure === true;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        ...user.toObject(),
        password: undefined,
      },
    },
  });
};

const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, passwordConfirm, passwordChangedAt, role } =
      req.body;

    // 1. Create new user
    const newUser = await User.create({
      name,
      email,
      role,
      password,
      passwordConfirm,
      passwordChangedAt,
    });

    // 2. Sign token an send success response
    createSendToken(res, 201, newUser);
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
    const currentUser = await User.findOne({ email }).select('+password');

    if (
      !currentUser ||
      !(await currentUser.correctPassword(password, currentUser.password))
    ) {
      const error = new AppError('Incorrect email or password', 401);

      next(error);
    }

    // 3. If everything ok, send token to client
    else createSendToken(res, 200, currentUser);
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
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
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

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const currentUser = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2. If token has not expired, and there is an user, set new password
    if (!currentUser) {
      const error = new AppError('Token is invalid or has expired!', 400);
      return next(error);
    }

    currentUser.password = req.body.password;
    currentUser.passwordConfirm = req.body.passwordConfirm;
    currentUser.passwordResetToken = undefined;
    currentUser.passwordResetExpires = undefined;

    await currentUser.save();

    // 3. Update changedPasswordAt property for the user (add middleware in the model)

    // 4. Log in the user
    createSendToken(res, 200, currentUser);
  }
);

const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get user from the collection

    const { password, passwordConfirm } = req.body;
    const newPassword: string | undefined = req.body.newPassword;

    if (!newPassword) {
      const error = new AppError('Please provide the new password', 401);

      return next(error);
    }

    if (newPassword.length < 6) {
      const error = new AppError(
        'The length of the password must be minimum 8 letters',
        401
      );

      return next(error);
    }

    const currentUser = await User.findById(req.body.currentUser._id).select(
      '+password'
    ); //  current user is set from the protect middleware

    // 2. Check if user exists and if entered password is correct
    if (
      !currentUser ||
      !(await currentUser.correctPassword(password, currentUser.password))
    ) {
      const error = new AppError('Your current password is wrong', 401);

      return next(error);
    }

    // 3. If pw correct, update password
    currentUser.password = newPassword;
    currentUser.passwordConfirm = passwordConfirm;
    await currentUser.save();

    // 4. Log user in, send jwt
    createSendToken(res, 200, currentUser);
  }
);

export default {
  signUp,
  login,
  protect,
  restritTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
