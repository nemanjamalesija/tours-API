import { NextFunction, Request, Response } from 'express';
import AsyncRequestHandlerType from '../types/asyncRequestHandler.ts';

const catchAsync = (func: AsyncRequestHandlerType) => {
  return (req: Request, res: Response, next: NextFunction) =>
    func(req, res, next).catch(next);
};

export default catchAsync;
