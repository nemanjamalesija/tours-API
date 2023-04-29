import { NextFunction, Request, Response } from 'express';
import AppError from '../helpers/appError.ts';
import { castErrorDB } from '../types/castError.ts';
import { duplicateErrorDB } from '../types/duplicateError.ts';
import { validatorErrorDB } from '../types/validatorError.ts';

const sendErrorDev = (res: Response, err: any) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (res: Response, err: any) => {
  console.log(JSON.stringify(err));

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 🔥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const handleCastErrorDB = (err: castErrorDB) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 404);
};

const handleDuplicateFieldErrorDB = (err: duplicateErrorDB) => {
  const tourName = err.keyValue.name;

  const message = `The tour under the name ${tourName} already exists`;

  return new AppError(message, 404);
};

const handleValidatorErrorDB = (err: validatorErrorDB) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data, ${errors.join('. ')}`;
  return new AppError(message, 404);
};

const handleJWTError = () => {
  const message = 'Invalid Token! Please log in again';
  return new AppError(message, 401);
};

const handleJWTExpiredError = () => {
  const message = 'Your token has expired! Please log in again';
  return new AppError(message, 401);
};

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(process.env.NODE_ENV);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // DEVELOPMENT ERROR HANDLING
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(res, err);
  }

  // PRODUCTION ERROR HANDLING
  else {
    let error = { ...err };

    // MONGO DB ERRORS
    // 1. Cast error
    if (err.name === 'CastError')
      error = handleCastErrorDB(error as castErrorDB);

    // 2. Tour name already exist
    if (err.code === 11000)
      error = handleDuplicateFieldErrorDB(error as duplicateErrorDB);

    // 3. Didn't specify all fields
    if (err.name === 'ValidationError')
      error = handleValidatorErrorDB(error as validatorErrorDB);

    // JWT ERRORS
    // 1. Someone manipulated JWT
    if (err.name === 'JsonWebTokenError') error = handleJWTError();

    // 2. Token expired
    if ((err.name = 'TokenExpiredError')) error = handleJWTExpiredError();

    sendErrorProd(res, error);

    console.log(JSON.stringify(err));
  }
};

export default globalErrorHandler;
