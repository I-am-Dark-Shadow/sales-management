import express from 'express';
const router = express.Router();
import { createProduct, getProducts, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, getProducts)
  .post(protect, requireRole('MANAGER'), createProduct);

router.route('/:id')
  .put(protect, requireRole('MANAGER'), updateProduct)
  .delete(protect, requireRole('MANAGER'), deleteProduct);

export default router;