// models/Post.ts
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: Number, required: true },
    stock: { type: Number, required: true },
    description: { type: String, required: true },
    image: {
      imageUrl: { type: String },
      publicId: { type: String },
    },
    rating: { type: Number, default: 0 }, // average rating
    numReviews: { type: Number, default: 0 },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          // required: true,
        },
        comment: { type: String },
        rating: {
          type: Number,
          // required: true,
          min: 1,
          max: 5,
        },
        createdAt: {
          type: Date,
          // default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;
