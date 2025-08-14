// models/SleepEntry.js
const mongoose = require("mongoose");

const SleepEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    unique: false, // we’ll enforce one-per-user-per-day manually
  },
  hours: {
    type: Number,
    required: true,
    min: 0,
    max: 24,
  },
});

SleepEntrySchema.index({ userId: 1, date: 1 }, { unique: true });
const SleepEntryModel = mongoose.model("SleepEntry", SleepEntrySchema);

module.exports = SleepEntryModel;
