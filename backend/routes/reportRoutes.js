import express from 'express';
const router = express.Router();
import { 
    exportTeamSalesCSV, 
    exportTeamSalesPDF, 
    exportMySalesCSV, 
    exportMySalesPDF 
} from '../controllers/reportController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

// --- Manager-Only Routes ---
// These routes are explicitly protected and require the 'MANAGER' role.
router.get('/team-sales/csv', protect, requireRole('MANAGER'), exportTeamSalesCSV);
router.get('/team-sales/pdf', protect, requireRole('MANAGER'), exportTeamSalesPDF);

// --- Executive-Only Routes ---
// These routes are explicitly protected and require the 'EXECUTIVE' role.
router.get('/my-sales/csv', protect, requireRole('EXECUTIVE'), exportMySalesCSV);
router.get('/my-sales/pdf', protect, requireRole('EXECUTIVE'), exportMySalesPDF);

export default router;