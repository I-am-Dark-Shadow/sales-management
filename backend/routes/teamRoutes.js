import express from 'express';
const router = express.Router();
import { createTeam, getMyTeams, updateTeamMembers, deleteTeam } from '../controllers/teamController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

router.use(protect, requireRole('MANAGER'));

router.route('/')
  .post(createTeam)
  .get(getMyTeams);

router.route('/:id')
    .delete(deleteTeam)

router.route('/:id/members')
    .put(updateTeamMembers);

export default router;