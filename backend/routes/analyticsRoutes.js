import express from 'express';
const router = express.Router();
import { getSalesProgress, getAttendanceSummary } from '../controllers/analyticsController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

router.get('/sales-progress', protect, requireRole('EXECUTIVE'), getSalesProgress);

router.get('/attendance-summary', protect, requireRole('EXECUTIVE'), getAttendanceSummary);

export default router;