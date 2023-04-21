import { NextFunction, Request, Response } from 'express';

const checkBody = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

const getAllTours = (req: Request, res: Response) => {};

const getTour = (req: Request, res: Response) => {};

const createTour = (req: Request, res: Response) => {};

const updateTour = (req: Request, res: Response) => {};

const deleteTour = (req: Request, res: Response) => {};

export default { checkBody, getAllTours, getTour, createTour, updateTour, deleteTour };
