
const mongoose = require("mongoose");

const WorkoutPlanActionSchema = new mongoose.Schema(
  {
    workoutPlanId: {type: mongoose.Schema.Types.ObjectId, ref: "WorkoutPlan", required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    // streak: { type: Number, default: 0 },
    status: { type: String, required: true, enum: ["completed", "in-progress", "not-started"], default: "in-progress" },
    planRounds: [
      {
        dayLabel: { type: String, required: true },
        dayDate: { type: String, required: true }, // e.g. "Jan 14"
        rounds: [
          {
            title: { type: String, required: true },
            duration: { type: Number },
            set: { type: Number },
            animation: { type: String, required: true },
            reps: { type: Number },
            youtubeLink: {type: String},
            restBetweenSet: { type: Number, required: true },
            workoutExerciseType: {type: String, required: true, enum: ["time", "set-reps"]},
            instruction: { type: String, required: true },
            commonMistakesToAvoid: [String],
            breathingTips: [String],
            focusArea: [{value: String, impact: String}],
            status: {
              type: String,
              required: true,
              enum: ["completed", "in-progress", "not-started"],
              default: "in-progress",
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);


const WorkoutPlanActionModel = mongoose.model("WorkoutPlanAction", WorkoutPlanActionSchema);
module.exports = WorkoutPlanActionModel;
