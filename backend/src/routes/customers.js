import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All customer routes require authentication
router.use(authenticate);

// GET routes
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);

// POST routes
router.post('/', createCustomer);

// PUT routes
router.put('/:id', updateCustomer);

// DELETE routes (admin only)
router.delete('/:id', isAdmin, deleteCustomer);

export default router;
