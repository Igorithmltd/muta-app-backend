// models/Post.ts
const mongoose = require("mongoose");

const DietSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: {
      imageUrl: { type: String },
      publicId: { type: String },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DietCategory",
      required: true,
    },
    calories: { type: Number, required: true },
    tags: { type: [String], required: true },
    duration: { type: Number, required: true },
    dailyMealBreakdown: [
      {
        breakfastTitle: { type: String, required: true },
        crabs: { type: String, required: true },
        protein: { type: String, required: true },
        fats: { type: String, required: true },
        calories: { type: String, required: true },
        recommendedTime: { type: String, required: true },
        missedBy: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const DietModel = mongoose.model("Diet", DietSchema);
module.exports = DietModel;
