const mongoose = require("mongoose");

const CoachGuidanceSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    coachId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status:{
        type: String,
        enum: ["pending", "done", "seen"],
        default: "pending",
      },
      planType:{
        type: String,
        enum: ["diet", "workout"],
        default: "diet",
      }
  },
  { timestamps: true }
);

const CoachGuidanceModel = mongoose.model("CoachGuidance", CoachGuidanceSchema);
module.exports = CoachGuidanceModel;
