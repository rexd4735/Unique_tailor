
import express from 'express';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected Dashboard Statistics API
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Fetch all dashboard statistics together
    const [
      totalCustomers,
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders
    ] = await Promise.all([
      Customer.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'In Progress' }),
      Order.countDocuments({ status: 'Completed' })
    ]);

    // Send dashboard data
    return res.status(200).json({
      success: true,
      message: 'Dashboard data fetched successfully',

      stats: {
        totalCustomers,
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch dashboard data'
    });
  }
});

export default router;
