import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../types/errorType.ts';

const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      status: 'fail',
      message: err.message,
    });
  }
  // Programming or other unknown error: don't leak error
  else {
    // 1. Log error
    console.error(`ERROR: ${err}`);

    // 2. Send generic response
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

export default globalErrorHandler;
