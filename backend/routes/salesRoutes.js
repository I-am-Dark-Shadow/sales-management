import express from 'express';
const router = express.Router();
import { addDailySale, getMySales, getTeamSales } from '../controllers/salesController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

router.post('/', protect, requireRole('EXECUTIVE'), addDailySale);
router.get('/my-sales', protect, requireRole('EXECUTIVE'), getMySales);
router.get('/team-sales', protect, requireRole('MANAGER'), getTeamSales);

export default router;