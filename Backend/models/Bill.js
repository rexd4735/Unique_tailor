
import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true
    },

    invoiceNumber: {
      type: String,
      unique: true,
      trim: true
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    advanceAmount: {
      type: Number,
      default: 0
    },

    paidAmount: {
      type: Number,
      default: 0
    },

    balanceAmount: {
      type: Number,
      required: true,
      min: 0
    },

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid'],
      default: 'Pending'
    },

    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Card', 'Bank Transfer'],
      default: 'Cash'
    },

    billDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const Bill = mongoose.model('Bill', billSchema);

export default Bill;
