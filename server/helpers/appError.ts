import { castErrorDB } from '../types/castError.ts';
import { HttpError } from '../types/errorType.ts';

class AppError {
  status: string;
  statusCode: number;
  isOperational: boolean;
  message: string;

  constructor(message: string, statusCode: number) {
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.message = message;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
