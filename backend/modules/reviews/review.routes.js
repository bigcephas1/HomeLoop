import express from 'express';
import protect from '../../middleware/auth.middleware.js';

import {
  createReview,
  getPropertyReviews,
  updateReview,
  deleteReview,
} from './review.controller.js';

const router = express.Router();

router.get('/:propertyId', getPropertyReviews);

router.post('/:propertyId', protect, createReview);

router.patch('/:id', protect, updateReview);

router.delete('/:id', protect, deleteReview);

export default router;
