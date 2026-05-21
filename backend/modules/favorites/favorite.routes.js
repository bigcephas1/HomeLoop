import express from 'express';

import protect from '../../middleware/auth.middleware.js';

import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} from './favorite.controller.js';

const router = express.Router();

router.post('/:propertyId', protect, addFavorite);

router.get('/', protect, getMyFavorites);

router.delete('/:propertyId', protect, removeFavorite);

export default router;
