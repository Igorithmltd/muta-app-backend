
const mongoose = require("mongoose");

const WorkoutPlanActionSchema = new mongoose.Schema(
  {
    workoutPlanId: {type: mongoose.Schema.Types.ObjectId, ref: "WorkoutPlan", required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    streak: { type: Number, default: 0 },
    status: { type: String, required: true, enum: ["completed", "in-progress"], default: "in-progress" },
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
        status: { type: String, required: true, enum: ["completed", "in-progress"], default: "in-progress" },
      },
    ],
  },
  { timestamps: true }
);


const WorkoutPlanActionModel = mongoose.model("WorkoutPlanAction", WorkoutPlanActionSchema);
module.exports = WorkoutPlanActionModel;
