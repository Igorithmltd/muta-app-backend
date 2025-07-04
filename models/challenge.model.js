const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    goal: { type: String, required: true },
    duration: { type: Number, required: true },
    durationUnit: { type: String, required: true, enum: ["minute", "hour"], default: "minute" },
    type: { type: String, required: true, enum: ["daily", "weekly"], default: "daily" },
    difficulty: { type: String, required: true, enum: ["begineer", "intermediate", "advanced"], default: "begineer" },
    tasks: [
      {
        buttonLabel: { type: String, required: true },
        title: { type: String, required: true },
        status: { type: String, required: true, enum: ["completed", "in-progress"], default: "in-progress" },
      }
    ],
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { timestamps: true }
);


ChallengeSchema.pre("save", function (next) {
  if (this.type === "weekly" && !this.endDate) {
    const today = new Date(this.startDate || Date.now());
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6); // Adds 6 days
    this.endDate = endDate;
  }
  next();
});

const ChallengeModel = mongoose.model("Challenge", ChallengeSchema);
module.exports = ChallengeModel;
