const mongoose = require("mongoose");

const CouponBalanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const CouponBalanceModel = mongoose.model(
  "CouponBalance",
  CouponBalanceSchema
);

module.exports = CouponBalanceModel;