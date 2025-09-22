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
        dayLabel: { type: String, required: true },
        meals: [
          {
            mealTitle: { type: String, required: true },
            crabs: { type: Number, required: true },
            protein: { type: Number, required: true },
            fats: { type: Number, required: true },
            calories: { type: Number, required: true },
            recommendedTime: { type: String, required: true },
            missedBy: { type: String, required: true },
            mealType: {
              type: String,
              required: true,
              enum: ["breakfast", "lunch", "dinner", "snack"],
            },
            status: {
              type: String,
              required: true,
              enum: ["completed", "in-progress", "missed", "not-started"],
              default: "in-progress",
            },
          }
        ]
      }
    ],
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        review: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const DietModel = mongoose.model("Diet", DietSchema);
module.exports = DietModel;
