import express from 'express';
const router = express.Router();
import { getManagerDashboardStats, getExecutiveDashboardStats, getFinancialSummary } from '../controllers/dashboardController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

router.get('/manager', protect, requireRole('MANAGER'), getManagerDashboardStats);
router.get('/executive', protect, requireRole('EXECUTIVE'), getExecutiveDashboardStats);
router.get('/financial-summary', protect, getFinancialSummary);

export default router;