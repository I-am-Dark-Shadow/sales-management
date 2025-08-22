import express from 'express';
const router = express.Router();
import {
  applyForLeave,
  getMyLeaveHistory,
  getTeamLeaveRequests,
  updateLeaveStatus,
} from '../controllers/leaveController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

router.post('/apply', protect, requireRole('EXECUTIVE'), applyForLeave);
router.get('/my-history', protect, requireRole('EXECUTIVE'), getMyLeaveHistory);
router.get('/team-requests', protect, requireRole('MANAGER'), getTeamLeaveRequests);
router.patch('/:id/status', protect, requireRole('MANAGER'), updateLeaveStatus);

export default router;