import express, { NextFunction, Request, Response, Errback } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import tourRouter from './routes/tourRoutes.ts';
import userRouter from './routes/userRoutes.ts';
import AppError from './helpers/appError.ts';
import { HttpError } from './types/errorType.ts';
import globalErrorHandler from './controllers/errorController.ts';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);

const app = express();

// GLOBAL MIDDLEWARES

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security HTTP headers
app.use(helmet());

// Limit request from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // miliseconds (1 hour)
  message: 'Too many request from this IP. Please try again in an hour',
});
app.use('/api', limiter);

// Cross origin policy
app.use(cors());

// Body parser
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection

// Data sanitization against XSS

// Serving static files
app.use(express.static(`${__dirName}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const message = `Can't find ${req.originalUrl} on this server`;
  const error = new AppError(message, 404);

  next(error);
});

app.use(globalErrorHandler);

export default app;
