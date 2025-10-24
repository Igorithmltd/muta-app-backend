
const mongoose = require("mongoose");

const DietActionSchema = new mongoose.Schema(
  {
    dietId: {type: mongoose.Schema.Types.ObjectId, ref: "Diet", required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    progress: {type: Number, required: true, default: 0},
    status: { type: String, required: true, enum: ["completed", "in-progress", "not-started"], default: "in-progress" },
    dailyMealBreakdown: [
      {
        dayLabel: { type: String, required: true }, // e.g. "Day 1", "Day 2", or "Monday"
        dayDate: { type: String, required: true }, // e.g. "2023-10-01"
        meals: [
          {
            mealTitle: { type: String, required: true },
            carbs: { type: Number, required: true },
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
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }, 
  },
  { timestamps: true }
);


const DietActionModel = mongoose.model("DietAction", DietActionSchema);
module.exports = DietActionModel;
