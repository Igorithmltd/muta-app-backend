const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      // enum: ["basic", "monthly", "quarterly", "yearly"],
      // default: "basic",
    },
    reference: String, // Paystack reference
    status: {
      type: String,
      enum: ["active", "expired", "pending"],
      default: "pending",
    },
    startDate: Date,
    expiryDate: Date,
    recurring: { type: Boolean, default: false },
    paystackSubscriptionId: { type: String },
  },
  { timestamps: true }
);

const SubscriptionModel = mongoose.model("Subscription", SubscriptionSchema);
module.exports = SubscriptionModel;
