const mongoose = require("mongoose");

const CallLogSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    callType: { type: String, enum: ["audio", "video"], required: true },
    status: {
      type: String,
      enum: ["incoming", "missed", "received", "rejected", "ended", "ringing"],
      default: "incoming",
      required: true,
    },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number }, // in seconds
    platform: { type: String, enum: ["mobile", "web"], default: "mobile" },
    sessionId: { type: String }, // Agora/Twilio session id
    recordingUrl: { type: String },
    isRead: { type: Boolean, default: false },
    // createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const CallLogModel = mongoose.model("CallLog", CallLogSchema);
module.exports = CallLogModel;
