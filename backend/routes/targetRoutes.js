import express from 'express';
const router = express.Router();
import { setTarget, getTeamTargets, getMyTargets, deleteTarget, updateTarget } from '../controllers/targetController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

router.post('/', protect, requireRole('MANAGER'), setTarget);
router.get('/team', protect, requireRole('MANAGER'), getTeamTargets);
router.get('/my', protect, requireRole('EXECUTIVE'), getMyTargets);
router.route('/:id')
    .put(protect, requireRole('MANAGER'), updateTarget) 
    .delete(protect, requireRole('MANAGER'), deleteTarget);

export default router;