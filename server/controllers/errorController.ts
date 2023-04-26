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

  return res.status(err.statusCode).json({
    statusCode: err.statusCode,
    status: 'fail',
    message: err.message,
  });
};

export default globalErrorHandler;
