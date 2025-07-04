// models/Post.ts
const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema(
  {
    // userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    title: { type: String, required: true, unique: true },
    goal: { type: String, required: true },
    duration: { type: Number, required: true },
    durationUnit: { type: String, required: true, enum: ["minute", "hour"], default: "minute" },
    type: { type: String, required: true, enum: ["daily", "weekly"], default: "daily" },
    difficulty: { type: String, required: true, enum: ["begineer", "intermediate", "advanced"], default: "begineer" },
    tasks: [
      {
        buttonLabel: {type: String, required: true},
        title: { type: String, required: true },
        status: { type: String, required: true, enum: ["completed", "in-progress"], default: "in-progress" },
      }
    ],
    startDate: {type: Date, default: Date.now},
    endDate: {type: Date},
  },
  { timestamps: true }
);


const ChallengeModel = mongoose.model("Challenge", ChallengeSchema);
module.exports = ChallengeModel;
