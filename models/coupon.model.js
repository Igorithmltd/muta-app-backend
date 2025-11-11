const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    giftedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    usedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    planId: {
        type: String,
        required: true,
    },
    code: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    authorizationCode: { type: String, required: true },
    customerCode: { type: String, required: true },
    subscriptionCode: { type: String, default: null },
  },
  { timestamps: true }
);

const CouponModel = mongoose.model("Coupon", CouponSchema);
module.exports = CouponModel;
