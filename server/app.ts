import express, { NextFunction, Request, Response, Errback } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import tourRouter from './routes/tourRoutes.ts';
import userRouter from './routes/userRoutes.ts';
import { HttpError } from './types/errorType.ts';

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
  const err: HttpError = new Error(`Can't find ${req.originalUrl} on this server`);

  (err.status = 'fail'), (err.statusCode = 404), next(err);
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: 'fail',
    message: err.message,
  });
});

export { app };
