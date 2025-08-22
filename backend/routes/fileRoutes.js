import express from 'express';
const router = express.Router();
import { uploadFileRecord, getSharedFiles, deleteSharedFile } from '../controllers/fileController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, getSharedFiles)
    .post(protect, requireRole('MANAGER'), uploadFileRecord);

router.route('/:id')
    .delete(protect, requireRole('MANAGER'), deleteSharedFile);

export default router;