import express from 'express';
import tourController from '../controllers/tourController.ts';
import authController from '../controllers/authController.ts';
import reviewRouter from '../routes/reviewRoutes.ts';

const router = express.Router();

router.use('/:tourId/review', reviewRouter);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin, lead-guide'),
    tourController.createTour
  );

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly/plan/:year').get(tourController.getMonthlyPlan);

// GEO
router
  .route('/tours-within/:distance/center/:latlng/:unit')
  .get(tourController.getToursWithin);
router.route('/distances/:latlng/:unit/').get(tourController.getDistances);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin, lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin, lead-guide'),
    tourController.deleteTour
  );

export default router;
