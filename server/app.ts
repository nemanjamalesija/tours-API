import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import tourRouter from './routes/tourRoutes.ts';
import userRouter from './routes/userRoutes.ts';
import AppError from './helpers/appError.ts';
import { globalErrorHandler } from './controllers/errorController.ts';

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(express.static(`${__dirName}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

/* Handle wrong main url */
app.all('*', (req, res, next) => {
  const error = new AppError(`Can't find ${req.originalUrl} on this server`, 'fail', 404);

  next(error);
});

app.use(globalErrorHandler);

export default app;
