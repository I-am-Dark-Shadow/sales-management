import express from 'express';
const router = express.Router();
import { getCloudinarySignature } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/signature', protect, getCloudinarySignature);

export default router;