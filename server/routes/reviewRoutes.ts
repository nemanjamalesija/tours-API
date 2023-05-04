import express from 'express';
import reviewController from '../controllers/reviewController.ts';
import authController from '../controllers/authController.ts';

const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

router.route('/');
router.route('/:id').get(reviewController.getSingleReview);

router.route('/:id').patch(reviewController.updateReview);

router.route('/:id').delete(reviewController.deleteReview);

export default router;
