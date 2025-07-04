// models/Post.ts
const mongoose = require("mongoose");

const ProductCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const ProductCategoryModel = mongoose.model("ProductCategory", ProductCategorySchema);
module.exports = ProductCategoryModel;
