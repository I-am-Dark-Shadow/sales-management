import express from 'express';
const router = express.Router();
import { getMyNotifications, markNotificationsAsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getMyNotifications);
router.route('/mark-read').post(protect, markNotificationsAsRead);

export default router;