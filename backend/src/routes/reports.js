import express from 'express';
import {
  getDashboardStats,
  getSalesReport,
  getProfitReport,
  getInventoryReport
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All report routes require authentication
router.use(authenticate);

// GET routes
router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesReport);
router.get('/profit', getProfitReport);
router.get('/inventory', getInventoryReport);

export default router;
