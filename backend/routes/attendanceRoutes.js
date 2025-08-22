import express from 'express';
const router = express.Router();
import { getAttendanceForMonth, markAttendance } from '../controllers/attendanceController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

router.use(protect, requireRole('EXECUTIVE'));

router.route('/')
    .get(getAttendanceForMonth)
    .post(markAttendance);

export default router;