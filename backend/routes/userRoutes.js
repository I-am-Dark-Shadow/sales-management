import express from 'express';
const router = express.Router();
import {
  getTeamExecutives,
  updateUserStatus,
  resetExecutivePassword,
  updateUserProfile,
  getExecutiveDetails,
} from '../controllers/userController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

// --- Routes accessible by ANY authenticated user ---
// This route allows both managers and executives to update their own profile.
router.patch('/profile', protect, updateUserProfile);


// --- Routes accessible by MANAGERS ONLY ---
// We now apply the requireRole('MANAGER') middleware to each specific route.

router.get('/', protect, requireRole('MANAGER'), getTeamExecutives);

router.patch('/:id/status', protect, requireRole('MANAGER'), updateUserStatus);

router.post('/:id/reset-password', protect, requireRole('MANAGER'), resetExecutivePassword);

router.get('/:id/details', protect, requireRole('MANAGER'), getExecutiveDetails);

export default router;