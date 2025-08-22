import express from 'express';
const router = express.Router();
import {
  loginUser,
  registerExecutive,
  logoutUser,
  getMe,
  refreshToken,
} from '../controllers/authController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.post('/register', protect, requireRole('MANAGER'), registerExecutive);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

export default router;