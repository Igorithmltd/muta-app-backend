const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ['streak', 'weight', 'challenge', 'system'], // add more types as needed
      default: 'system',
    },
    // timestamp: { type: Date, default: Date.now },
    isRead: {type: Boolean, default: false},
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model("Notification", NotificationSchema);
module.exports = NotificationModel;
