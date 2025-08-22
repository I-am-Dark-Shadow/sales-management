import express from 'express';
const router = express.Router();
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getLeaderboard);

export default router;