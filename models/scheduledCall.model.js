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

    startAt: {
      type: Date,
      required: true,
    },

    endAt: {
      type: Date,
      required: true,
    },

    callType: {
      type: String,
      enum: ["video", "voice"],
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
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
