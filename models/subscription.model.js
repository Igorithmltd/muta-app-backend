const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, required: true }, // New field
    // reference: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "pending", "cancelled", "expired"],
      default: "pending",
    },
    startDate: { type: Date, default: Date.now },
    // expiryDate: { type: Date },
    paystackSubscriptionId: { type: String },
    subscriptionCode: { type: String, default: null },
    paystackAuthorizationToken: { type: String, default: null },
    currentPeriodEnd: { type: Date },
    nextPaymentDate: { type: Date },
    cancelledAt: { type: Date },
    lastPaymentAt: { type: Date },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ user: 1, status: 1 });

SubscriptionSchema.index({
  coachId: 1,
  status: 1,
});

const SubscriptionModel = mongoose.model("Subscription", SubscriptionSchema);
module.exports = SubscriptionModel;
