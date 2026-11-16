
import express from "express";
import mongoose from "mongoose";
import Measurement from "../models/Measurement.js";
import Customer from "../models/Customer.js";

const router = express.Router();

// GET - Fetch all measurements
router.get("/", async (req, res) => {
  try {
    const measurements = await Measurement.find()
      .populate("customer", "name mobile customerId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      measurements,
    });
  } catch (error) {
    console.error("Fetch measurements:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch measurements",
    });
  }
});

// POST - Add measurement
router.post("/", async (req, res) => {
  try {
    const {
      customerId,
      gender,
      garmentType,
      measurements,
      notes,
    } = req.body;

    if (!customerId || !gender || !garmentType || !measurements) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required details",
      });
    }

    if (!["Men", "Women"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender selection",
      });
    }

    const customer = await Customer.findOne({ customerId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer ID not found",
      });
    }

    const newMeasurement = await Measurement.create({
      customer: customer._id,
      customerId: customer.customerId,
      gender,
      garmentType,
      measurements,
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Measurement saved successfully",
      measurement: newMeasurement,
    });
  } catch (error) {
    console.error("Add measurement:", error);
    res.status(500).json({
      success: false,
      message: "Unable to save measurement",
    });
  }
});

// PUT - Update measurement
router.put("/:id", async (req, res) => {
  try {
    const { gender, garmentType, measurements, notes } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid measurement ID",
      });
    }

    const updatedMeasurement = await Measurement.findByIdAndUpdate(
      req.params.id,
      { gender, garmentType, measurements, notes },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedMeasurement) {
      return res.status(404).json({
        success: false,
        message: "Measurement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Measurement updated successfully",
      measurement: updatedMeasurement,
    });
  } catch (error) {
    console.error("Update measurement:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update measurement",
    });
  }
});

// DELETE - Remove measurement
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid measurement ID",
      });
    }

    const deletedMeasurement = await Measurement.findByIdAndDelete(
      req.params.id
    );

    if (!deletedMeasurement) {
      return res.status(404).json({
        success: false,
        message: "Measurement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Measurement deleted successfully",
    });
  } catch (error) {
    console.error("Delete measurement:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete measurement",
    });
  }
});

export default router;
