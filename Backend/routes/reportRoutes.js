
import express from 'express';
import Order from '../models/Order.js';
import Bill from '../models/Bill.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer')
      .sort({ createdAt: -1 });

    const bills = await Bill.find()
      .populate('customer')
      .populate('order')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
      bills
    });

  } catch (error) {
    console.error('Reports Error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
});

export default router;
