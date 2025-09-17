const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // enum: ["basic", "premium"],
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
    enum: ["monthly", "yearly"],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  features: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  paystackSubscriptionId: { type: String },

}, { timestamps: true });

const PlanModel = mongoose.model("Plan", PlanSchema);
module.exports = PlanModel;
