import express from 'express';
import {
  getAllAccessories,
  getAccessoryById,
  createAccessory,
  updateAccessory,
  deleteAccessory,
  getLowStockAccessories,
  getCategories
} from '../controllers/accessoryController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All accessory routes require authentication
router.use(authenticate);

// GET routes
router.get('/', getAllAccessories);
router.get('/categories/list', getCategories);
router.get('/alerts/low-stock', getLowStockAccessories);
router.get('/:id', getAccessoryById);

// POST routes
router.post('/', createAccessory);

// PUT routes
router.put('/:id', updateAccessory);

// DELETE routes (admin only)
router.delete('/:id', isAdmin, deleteAccessory);

export default router;
