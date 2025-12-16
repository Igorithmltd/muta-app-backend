
const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reported: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["pending", "reviewed", "action_taken"], default: "pending" },
},
{timestamps: true,});

const ReportUserModel = mongoose.model("ReportUser", ReportSchema);
module.exports = ReportUserModel
