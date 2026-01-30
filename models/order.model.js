// models/Order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        color: {
            type: String,
          },
          size: {
            type: String,
        },
      },
    ],
    shippingAddress: {
      fullName: String,
      phoneNumber: String,
      address: String,
      region: String,
      city: String,
      deliveryNote: String,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentReference: String,
    paymentDate: Date,
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["paystack", "on-delivery"],
      default: "paystack",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    review: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: { type: String },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      createdAt: {
        type: Date,
      },
    },
    deliveryPrice: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", OrderSchema);
module.exports = OrderModel
