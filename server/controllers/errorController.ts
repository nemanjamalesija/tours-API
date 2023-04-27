import { NextFunction, Request, Response } from 'express';
import AppError from '../helpers/appError.ts';
import { HttpError } from '../types/errorType.ts';
import { castErrorDB } from '../types/castError.ts';
import { validatorErrorDB } from '../types/validatorError.ts';

const handleOperationalError = (res: Response, err: any) => {
  return res.status(err.statusCode || 500).json({
    statusCode: err.statusCode,
    status: 'fail',
    message: err.message,
  });
};

const handleCastErrorDB = (err: castErrorDB) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 'fail', 404);
};

const handleValidationErrorDB = (err: castErrorDB) => {
  const tourName = err.keyValue.name; // Extract the tour name

  const message = `The tour under the name ${tourName} already exists`;

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
  err: HttpError | castErrorDB | validatorErrorDB,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err.stack);
  console.log(err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    handleOperationalError(res, err as HttpError);
  }

  // Programming or other unknown error: don't leak error
  else {
    let error: castErrorDB | validatorErrorDB = { ...err };

    if (err.name === 'CastError') error = handleCastErrorDB(error as castErrorDB);

    if (error.code === 11000) error = handleValidationErrorDB(error as validatorErrorDB);

    // if (err.name === 'ValidationError') {
    //   error = handleValidationErrorDB(error);
    // }

    console.log(JSON.stringify(error));

    handleOperationalError(res, error);
  }
};

export default globalErrorHandler;
