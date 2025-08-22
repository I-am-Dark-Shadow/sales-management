import express from 'express';
const router = express.Router();
import { createIncome, getMyIncomes, deleteIncome } from '../controllers/incomeController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, getMyIncomes)
  .post(protect, createIncome);

router.route('/:id')
  .delete(protect, deleteIncome);

export default router;