
const mongoose = require("mongoose");

const DietActionSchema = new mongoose.Schema(
  {
    dietId: {type: mongoose.Schema.Types.ObjectId, ref: "Diet", required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    progress: {type: Number, required: true, default: 0},
    status: { type: String, required: true, enum: ["completed", "in-progress"], default: "in-progress" },
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
        status: { type: String, required: true, enum: ["completed", "in-progress"], default: "in-progress" },
        day: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);


const DietActionModel = mongoose.model("DietAction", DietActionSchema);
module.exports = DietActionModel;
