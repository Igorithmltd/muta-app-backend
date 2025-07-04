
const mongoose = require("mongoose");

const ChallengeActionSchema = new mongoose.Schema(
  {
    challengeId: {type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    streak: { type: Number, default: 0 },
    status: { type: String, required: true, enum: ["completed", "in-progress"], default: "in-progress" },
    tasks: [
      {
        buttonLabel: { type: String, required: true },
        title: { type: String, required: true },
        status: { type: String, required: true, enum: ["completed", "in-progress"], default: "in-progress" },
      }
    ],
  },
  { timestamps: true }
);


const ChallengeActionModel = mongoose.model("ChallengeAction", ChallengeActionSchema);
module.exports = ChallengeActionModel;
