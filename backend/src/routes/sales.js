import express from 'express';
import {
  getAllSales,
  getSaleById,
  createSale,
  deleteSale
} from '../controllers/saleController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All sale routes require authentication
router.use(authenticate);

// GET routes
router.get('/', getAllSales);
router.get('/:id', getSaleById);

// POST routes
router.post('/', createSale);

// DELETE routes (admin only)
router.delete('/:id', isAdmin, deleteSale);

export default router;
