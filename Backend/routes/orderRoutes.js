
import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Measurement from "../models/Measurement.js";

const router = express.Router();

// GET - All orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name mobile customerId")
      .populate("items.measurement")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
  console.error("FETCH ORDERS ERROR:", error);

  res.status(500).json({
    success: false,
    message: error.message,
  });
}
});

// POST - Create order
router.post("/", async (req, res) => {
  try {
    const {
      customerId,
      items,
      deliveryDate,
      notes,
    } = req.body;

    if (!customerId || !Array.isArray(items) || items.length === 0 || !deliveryDate) {
      return res.status(400).json({
        success: false,
        message: "Customer, garments and delivery date are required",
      });
    }

    const customer = await Customer.findOne({ customerId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const delivery = new Date(deliveryDate);

    if (Number.isNaN(delivery.getTime()) || delivery <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Delivery date must be in the future",
      });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!mongoose.isValidObjectId(item.measurement)) {
        return res.status(400).json({
          success: false,
          message: "Invalid measurement selected",
        });
      }

      const measurement = await Measurement.findOne({
        _id: item.measurement,
        customer: customer._id,
      });

      if (!measurement) {
        return res.status(400).json({
          success: false,
          message: "Selected measurement does not belong to this customer",
        });
      }

      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);

      if (!Number.isInteger(quantity) || quantity < 1 ||
          !Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid quantity or price",
        });
      }

      const amount = quantity * unitPrice;
      totalAmount += amount;

      validatedItems.push({
        measurement: measurement._id,
        garmentType: measurement.garmentType,
        quantity,
        unitPrice,
        amount,
        notes: item.notes || "",
      });
    }

    const orderNumber = `ORD-${Date.now()}`;

    const order = await Order.create({
      orderNumber,
      customer: customer._id,
      customerId: customer.customerId,
      items: validatedItems,
      orderDate: new Date(),
      deliveryDate: delivery,
      totalAmount,
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order:", error);
    res.status(500).json({
      success: false,
      message: "Unable to create order",
    });
  }
});

// PUT - Update order
router.put("/:id", async (req, res) => {
  try {
    const { items, deliveryDate, status, notes } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one garment is required",
        });
      }

      let totalAmount = 0;
      const updatedItems = [];

      for (const item of items) {
        if (!mongoose.isValidObjectId(item.measurement)) {
          return res.status(400).json({
            success: false,
            message: "Invalid measurement selected",
          });
        }

        const measurement = await Measurement.findOne({
          _id: item.measurement,
          customer: order.customer,
        });

        if (!measurement) {
          return res.status(400).json({
            success: false,
            message: "Invalid customer measurement",
          });
        }

        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);

        if (!Number.isInteger(quantity) || quantity < 1 ||
            !Number.isFinite(unitPrice) || unitPrice < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid quantity or price",
          });
        }

        const amount = quantity * unitPrice;
        totalAmount += amount;

        updatedItems.push({
          measurement: measurement._id,
          garmentType: measurement.garmentType,
          quantity,
          unitPrice,
          amount,
          notes: item.notes || "",
        });
      }

      order.items = updatedItems;
      order.totalAmount = totalAmount;
    }

    if (deliveryDate !== undefined) {
      const delivery = new Date(deliveryDate);

      if (Number.isNaN(delivery.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid delivery date",
        });
      }

      order.deliveryDate = delivery;
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "Pending",
        "In Progress",
        "Ready",
        "Delivered",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      order.status = status;
    }

    if (notes !== undefined) {
      order.notes = notes;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update order",
    });
  }
});

// DELETE - Delete order
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete order",
    });
  }
});

export default router;
