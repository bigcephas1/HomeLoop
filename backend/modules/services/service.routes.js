import express from 'express';
import protect from '../../middleware/auth.middleware.js';
import {
  createService,
  getServices,
  getSingleService,
  updateService,
  deleteService,
} from './service.controller.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getSingleService);
router.post('/', protect, createService);
router.patch('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

export default router;
