import express from 'express';
const router = express.Router();
import { getCalendarEvents } from '../controllers/calendarController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

router.get('/events', protect, requireRole('EXECUTIVE'), getCalendarEvents);

export default router;