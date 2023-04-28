import { NextFunction, Request, Response } from 'express';
import AppError from '../helpers/appError.ts';
import { HttpError } from '../types/errorType.ts';
import { castErrorDB } from '../types/castError.ts';
import { duplicateErrorDB } from '../types/duplicateError.ts';
import { validatorErrorDB } from '../types/validatorError.ts';

const handleOperationalError = (res: Response, err: any) => {
  return res.status(err.statusCode || 500).json({
    statusCode: err.statusCode,
    status: 'fail',
    message: err.message || 'Something went wrong',
  });
};

const handleCastErrorDB = (err: castErrorDB) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 'fail', 404);
};

const handleDuplicateFieldErrorHandlerDB = (err: duplicateErrorDB) => {
  const tourName = err.keyValue.name;

  const message = `The tour under the name ${tourName} already exists`;

  return new AppError(message, 'fail', 404);
};

const handleValidatorErrorDB = (err: validatorErrorDB) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data, ${errors.join('. ')}`;
  return new AppError(message, 'fail', 404);
};

const globalErrorHandler = (
  err: HttpError | castErrorDB | duplicateErrorDB | validatorErrorDB,
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

  // mongoDB errors
  else {
    let error: castErrorDB | duplicateErrorDB | validatorErrorDB = { ...err };

    // 1. Id doesn't exist
    if (err.name === 'CastError') error = handleCastErrorDB(error as castErrorDB);

    // 2. Tour already exists
    if (error.code) error = handleDuplicateFieldErrorHandlerDB(error as duplicateErrorDB);

    // 3. Validation error
    if (err.name === 'ValidationError')
      error = handleValidatorErrorDB(error as validatorErrorDB);

    console.log(JSON.stringify(err));
    handleOperationalError(res, error);
  }
};

export default globalErrorHandler;
