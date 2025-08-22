import express from 'express';
const router = express.Router();
import { createExpense, getMyExpenses, deleteExpense } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, getMyExpenses)
  .post(protect, createExpense);

router.route('/:id')
  .delete(protect, deleteExpense);

export default router;