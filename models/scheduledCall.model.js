const mongoose = require("mongoose");

const ScheduledCallSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    callDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },

    callType: {
      type: String,
      enum: ["video", "audio"],
      required: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    channelId: {
      type: String,
    },

    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User", // coach or admin
    //   required: true,
    // },
  },
  {
    timestamps: true,
  }
);

ScheduledCallSchema.index({ coachId: 1, startAt: 1 });
ScheduledCallSchema.index({ userId: 1, startAt: 1 });

const ScheduledCallModel = mongoose.model("ScheduledCall", ScheduledCallSchema);
module.exports = ScheduledCallModel;
