import express from 'express';
import tourController from '../controllers/tourController.ts';

const router = express.Router();

router.route('/').get(tourController.getAllTours).post(tourController.createTour);
router
  .route('/top-5-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

export default router;
