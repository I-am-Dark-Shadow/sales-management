import express from 'express';
const router = express.Router();
import { getMessagesForTeam } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/:teamId/messages').get(protect, getMessagesForTeam);

export default router;