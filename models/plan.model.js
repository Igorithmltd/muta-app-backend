const mongoose = require("mongoose");

// const PlanCategorySchema = new mongoose.Schema({
//   duration: {
//     type: String,
//     required: true,
//     enum: ["monthly", "yearly"],
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: 0,
//   },
//   features: {
//     type: [String],
//     default: [],
//   },
// }, { _id: false }); // no separate _id for subdocs if you want

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
        features: {
          type: [String],
          default: [],
        },
        paystackSubscriptionId: { type: String },
      },
    ],
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
