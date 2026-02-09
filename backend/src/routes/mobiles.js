import express from 'express';
import {
  getAllMobiles,
  getMobileById,
  getMobileByIMEI,
  createMobile,
  updateMobile,
  deleteMobile,
  getBrands
} from '../controllers/mobileController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All mobile routes require authentication
router.use(authenticate);

// GET routes
router.get('/', getAllMobiles);
router.get('/brands/list', getBrands);
router.get('/imei/:imei', getMobileByIMEI);
router.get('/:id', getMobileById);

// POST routes
router.post('/', createMobile);

// PUT routes
router.put('/:id', updateMobile);

// DELETE routes (admin only)
router.delete('/:id', isAdmin, deleteMobile);

export default router;
