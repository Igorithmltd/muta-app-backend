// models/Post.ts
const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema(
  {
    // userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    title: { type: String, required: true, unique: true },
    goal: { type: String, required: true },
    duration: { type: String, required: true },
    durationUnit: { type: String, required: true, enum: ["minute", "hour"], default: "minute" },
    type: { type: String, required: true, enum: ["daily", "weekly"], default: "daily" },
    difficulty: { type: String, required: true },
    // streak: { type: Number, default: 0 },
  },
  { timestamps: true }
);


const ChallengeModel = mongoose.model("Challenge", ChallengeSchema);
module.exports = ChallengeModel;
