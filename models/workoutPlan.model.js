// models/Post.ts
const mongoose = require("mongoose");

const WorkoutPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
      default: "active",
    },
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
    roundsCount: { type: Number, required: true },
    duration: { type: Number, required: true },
    level: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
      default: "begineer",
    },
    recommended: { type: String, enum: ["YES", "NO"], default: "NO" },
    planRounds: [
      {
        // dayLabel: { type: String, required: true },
        // dayDate: { type: String, required: true }, // e.g. "Jan 14"
        rounds: [
          {
            title: { type: String, required: true },
            duration: { type: Number, required: true },
            set: { type: Number, required: true },
            animation: { type: String, required: true },
            reps: { type: Number, required: true },
            restBetweenSet: { type: Number, required: true },
            instruction: { type: String, required: true },
            commonMistakesToAvoid: [String],
            breathingTips: [String],
            focusArea: [String],
            status: {
              type: String,
              required: true,
              enum: ["completed", "in-progress"],
              default: "in-progress",
            },
          },
        ],
      },
    ],
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: { type: Number, min: 1, max: 5, required: true },
        review: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const WorkoutPlanModel = mongoose.model("WorkoutPlan", WorkoutPlanSchema);
module.exports = WorkoutPlanModel;
