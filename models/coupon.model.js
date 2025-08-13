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
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
      },
    code: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CouponModel = mongoose.model("Coupon", CouponSchema);
module.exports = CouponModel;
