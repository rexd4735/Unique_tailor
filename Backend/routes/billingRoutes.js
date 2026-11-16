
import express from 'express';
import {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill
} from '../controllers/billController.js';

const router = express.Router();        

// Create Bill
router.post('/', createBill);

// Get All Bills + Search
router.get('/', getBills);

// Get Single Bill
router.get('/:id', getBillById);

// Update Bill / Payment
router.put('/:id', updateBill);

// Delete Bill
router.delete('/:id', deleteBill);

export default router;
