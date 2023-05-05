import express from 'express';
import tourController from '../controllers/tourController.ts';
import authController from '../controllers/authController.ts';
import reviewRouter from '../routes/reviewRoutes.ts';

const router = express.Router();

router.use('/:tourId/review', reviewRouter);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(authController.protect, tourController.createTour);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly/plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,

    tourController.deleteTour
  );

export default router;
