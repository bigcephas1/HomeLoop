import express from 'express';
import protect from '../../middleware/auth.middleware.js';
import {
  bookRepresentative,
  getMyInspections,
  getRepresentativeInspections,
  updateInspectionStatus,
  cancelInspection,
} from './representativeInspection.controller.js';

const router = express.Router();

router.use(protect);

router.post('/book', bookRepresentative);
router.get('/my-inspections', getMyInspections);
router.get('/representative/inspections', getRepresentativeInspections);
router.patch('/:id/status', updateInspectionStatus);
router.patch('/:id/cancel', cancelInspection);

export default router;
