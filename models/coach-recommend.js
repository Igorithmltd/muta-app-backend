const mongoose = require("mongoose");

const CoachRecommendSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["diet", "workoutplan"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dietId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Diet",
    },
    workoutplanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutPlan",
    },
  },
  { timestamps: true }
);

const CoachRecommendModel = mongoose.model(
  "CoachRecommend",
  CoachRecommendSchema
);
module.exports = CoachRecommendModel;
