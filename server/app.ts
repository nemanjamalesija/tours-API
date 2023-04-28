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

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(express.static(`${__dirName}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`,
  });

  next();
});

app.use(globalErrorHandler);

export default app;
