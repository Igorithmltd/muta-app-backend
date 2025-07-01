// models/Post.ts
const mongoose = require("mongoose");

const WorkoutPlanSchema = new mongoose.Schema(
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
    rounds: { type: Number, required: true },
    duration: { type: Number, required: true },
    level: {
      type: String,
      required: true,
      enum: ["begineer", "intermediate", "advanced"],
      default: "begineer",
    },
    dailyMealBreakdown: [
      {
        title: { type: String, required: true },
        duration: { type: Number, required: true },
        set: { type: Number, required: true },
        reps: { type: Number, required: true },
        restBetweenSet: { type: Number, required: true },
        instruction: { type: String, required: true },
        commonMistakesToAvoid: [String],
        breathingTips: [String],
        focusArea: [String],
      },
    ],
  },
  { timestamps: true }
);

const WorkoutPlanModel = mongoose.model("WorkoutPlan", WorkoutPlanSchema);
module.exports = WorkoutPlanModel;
