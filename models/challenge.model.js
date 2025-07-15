const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    goal: { type: String, required: true },
    duration: { type: Number, required: true },
    // streak: { type: Number, default: 0 },
    status: { type: String, required: true, enum: ["completed", "in-progress"], default: "in-progress" },
    weeklyCount: { type: Number },
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
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);


ChallengeSchema.pre("save", function (next) {
  if(this.type === "weekly" && !this.endDate) {
    const today = new Date(this.startDate || Date.now());
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6); // Adds 6 days
    this.endDate = endDate;
  }
  if(this.type === 'weekly' && !this.weeklyCount) {
    this.weeklyCount = getWeekNumber(this.startDate || Date.now());
  }
  next();
});


function getWeekNumber(date = new Date()) {
  // Copy date so don't modify original
  const d = new Date(date);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  // Get first day of year
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNumber;
}

const ChallengeModel = mongoose.model("Challenge", ChallengeSchema);
module.exports = ChallengeModel;
