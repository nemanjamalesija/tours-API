import express from 'express';
import reviewController from '../controllers/reviewController.ts';

const router = express.Router();

router.route('/').get(reviewController.getAllReviews);

router.route('/').post(reviewController.createReview);

router.route('/:id').get(reviewController.getSingleReview);

router.route('/:id').patch(reviewController.updateReview);

router.route('/:id').delete(reviewController.deleteReview);

export default router;
