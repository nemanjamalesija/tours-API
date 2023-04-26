import { NextFunction, Request, Response } from 'express';

type AsyncRequestHandlerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export default AsyncRequestHandlerType;
