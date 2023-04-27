import { NextFunction, Request, Response } from 'express';
import AppError from '../helpers/appError.ts';
import { HttpError } from '../types/errorType.ts';
import { errorMongoDB } from '../types/errorMongoDB.ts';

const handleOperationalError = (res: Response, err: any) => {
  return res.status(err.statusCode || 500).json({
    statusCode: err.statusCode,
    status: 'fail',
    message: err.message,
  });
};

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 'fail', 404);
};

const handleProgrammingError = (res: Response, err: any) => {
  // 1. Log error
  console.error(`ERROR: ${err}`);

  // 2. Send generic response
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

const globalErrorHandler = (
  err: HttpError | errorMongoDB,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    handleOperationalError(res, err as HttpError);
  }

  // Programming or other unknown error: don't leak error
  else {
    let error: errorMongoDB = { ...err };

    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    handleOperationalError(res, error as errorMongoDB);
  }
};

export default globalErrorHandler;
