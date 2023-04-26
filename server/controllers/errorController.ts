import { Request, Response } from 'express';
import { HttpError } from '../types/errorType.ts';

export const globalErrorHandler = (err: HttpError, req: Request, res: Response) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    statusCode: err.statusCode,
    status: 'fail',
    message: err.message,
  });
};
