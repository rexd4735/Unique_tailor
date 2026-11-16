
import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    customerId: {
      type: String,
      required: true,
      index: true,
    },

    gender: {
      type: String,
      enum: ["Men", "Women"],
      required: true,
    },

    garmentType: {
      type: String,
      required: true,
    },

    measurements: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Measurement = mongoose.model(
  "Measurement",
  measurementSchema
);

export default Measurement;
