const mongoose = require("mongoose");

const DietSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      required: true,
      default: "active",
    },
    recommended: { type: String, enum: ["YES", "NO"], default: "NO" },
    image: {
      imageUrl: { type: String },
      publicId: { type: String },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DietCategory",
      required: true,
    },
    calories: { type: Number, required: true, default: 0 },
    tags: { type: [String], required: true },
    duration: { type: Number, required: true },
    dailyMealBreakdown: [
      {
        breakfastTitle: { type: String, required: true },
        crabs: { type: Number, required: true },
        protein: { type: Number, required: true },
        fats: { type: Number, required: true },
        calories: { type: Number, required: true },
        recommendedTime: { type: String, required: true },
        missedBy: { type: String, required: true },
        mealType: {
          type: String,
          required: true,
          enum: ["breakfast", "lunch", "dinner"],
        },
        // day: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const DietModel = mongoose.model("Diet", DietSchema);
module.exports = DietModel;
