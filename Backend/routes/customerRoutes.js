
import express from "express";
import Customer from "../models/Customer.js";

const router = express.Router();

// GET - Fetch all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch customers",
    });
  }
});

// POST - Add new customer
router.post("/", async (req, res) => {
  try {
    const { name, mobile, email, address } = req.body;

    if (!name?.trim() || !mobile?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and mobile number are required",
      });
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number",
      });
    }

    const existingCustomer = await Customer.findOne({
      mobile: mobile.trim(),
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already exists",
      });
    }

    const customer = await Customer.create({
      customerId: `CUS-${Date.now()}`,
      name: name.trim(),
      mobile: mobile.trim(),
      email: email?.trim() || "",
      address: address?.trim() || "",
    });

    res.status(201).json({
      success: true,
      message: "Customer added successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to add customer",
    });
  }
});

// PUT - Update customer
router.put("/:id", async (req, res) => {
  try {
    const { name, mobile, email, address } = req.body;

    if (!name?.trim() || !mobile?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and mobile number are required",
      });
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number",
      });
    }

    const duplicate = await Customer.findOne({
      mobile: mobile.trim(),
      _id: { $ne: req.params.id },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already exists",
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        mobile: mobile.trim(),
        email: email?.trim() || "",
        address: address?.trim() || "",
      },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update customer",
    });
  }
});

// DELETE - Remove customer
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete customer",
    });
  }
});

export default router;
