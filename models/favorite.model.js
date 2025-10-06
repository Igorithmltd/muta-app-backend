// models/Post.ts
const mongoose = require("mongoose");

const FavoriteProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    product: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const FavoriteProductModel = mongoose.model(
  "FavoriteProduct",
  FavoriteProductSchema
);
module.exports = FavoriteProductModel;
