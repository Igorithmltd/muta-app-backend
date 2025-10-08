const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    categories: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        duration: {
          type: String,
          enum: ["monthly", "yearly"],
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        paystackSubscriptionId: { type: String },
      },
    ],
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // paystackSubscriptionId: { type: String },
  },
  { timestamps: true }
);

const PlanModel = mongoose.model("Plan", PlanSchema);
module.exports = PlanModel;
