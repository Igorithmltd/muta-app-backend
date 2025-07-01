// models/Post.ts
const mongoose = require("mongoose");

const DietCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);


const DietCategoryModel = mongoose.model("DietCategory", DietCategorySchema);
module.exports = DietCategoryModel;
