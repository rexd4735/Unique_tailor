
import Bill from '../models/Bill.js';
import Order from '../models/Order.js';

// Generate Invoice Number
const generateInvoiceNumber = () => {
  return `INV-${Date.now()}`;
};

// Calculate Payment Status
const getPaymentStatus = (paid, total) => {
  if (paid >= total) return 'Paid';
  if (paid > 0) return 'Partial';
  return 'Pending';
};

// Create Bill
export const createBill = async (req, res) => {
  try {
    const { order, advanceAmount = 0, paymentMethod = 'Cash' } = req.body;

    const existingBill = await Bill.findOne({ order });

    if (existingBill) {
      return res.status(400).json({
        message: 'Bill already exists for this order'
      });
    }

    const orderData = await Order.findById(order);

    if (!orderData) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    const totalAmount = Number(orderData.totalAmount);
    const advance = Number(advanceAmount);

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount < 0 ||
      !Number.isFinite(advance) ||
      advance < 0 ||
      advance > totalAmount
    ) {
      return res.status(400).json({
        message: 'Invalid bill amount or advance payment'
      });
    }

    const bill = await Bill.create({
      customer: orderData.customer,
      order,
      invoiceNumber: generateInvoiceNumber(),
      totalAmount,
      advanceAmount: advance,
      paidAmount: advance,
      balanceAmount: totalAmount - advance,
      paymentStatus: getPaymentStatus(advance, totalAmount),
      paymentMethod
    });

    const populatedBill = await Bill.findById(bill._id)
      .populate('customer')
      .populate('order');

    res.status(201).json({
      message: 'Bill created successfully',
      bill: populatedBill
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get All Bills + Search
export const getBills = async (req, res) => {
  try {
    const { search } = req.query;

    let bills = await Bill.find()
      .populate('customer')
      .populate('order')
      .sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();

      bills = bills.filter((bill) =>
        bill.invoiceNumber?.toLowerCase().includes(term) ||
        bill.customer?.name?.toLowerCase().includes(term) ||
        bill.customer?.mobile?.includes(search)
      );
    }

    res.status(200).json({
      count: bills.length,
      bills
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Single Bill
export const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('customer')
      .populate('order');

    if (!bill) {
      return res.status(404).json({
        message: 'Bill not found'
      });
    }

    res.status(200).json({ bill });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update Bill / Record Payment
export const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        message: 'Bill not found'
      });
    }

    const { paidAmount, paymentMethod } = req.body;

    if (paidAmount !== undefined) {
      const paid = Number(paidAmount);

      if (
        !Number.isFinite(paid) ||
        paid < 0 ||
        paid > bill.totalAmount
      ) {
        return res.status(400).json({
          message: 'Invalid paid amount'
        });
      }

      bill.paidAmount = paid;
      bill.balanceAmount = bill.totalAmount - paid;
      bill.paymentStatus = getPaymentStatus(
        paid,
        bill.totalAmount
      );
    }

    if (paymentMethod !== undefined) {
      const methods = ['Cash', 'UPI', 'Card', 'Bank Transfer'];

      if (!methods.includes(paymentMethod)) {
        return res.status(400).json({
          message: 'Invalid payment method'
        });
      }

      bill.paymentMethod = paymentMethod;
    }

    await bill.save();

    const updatedBill = await Bill.findById(bill._id)
      .populate('customer')
      .populate('order');

    res.status(200).json({
      message: 'Bill updated successfully',
      bill: updatedBill
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete Bill
export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);

    if (!bill) {
      return res.status(404).json({
        message: 'Bill not found'
      });
    }

    res.status(200).json({
      message: 'Bill deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
