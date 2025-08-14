// models/WaterEntry.js
const mongoose = require("mongoose");

const WaterEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  litres: {
    type: Number,
    required: true,
    min: 0,
  },
});

WaterEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

const WaterEntryModel = mongoose.model("WaterEntry", WaterEntrySchema);
module.exports = WaterEntryModel;
