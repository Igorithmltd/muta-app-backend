// models/Post.ts
const mongoose = require("mongoose");

const ChallengeActionSchema = new mongoose.Schema(
  {
    challengeId: {type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    streak: { type: Number, default: 0 },
  },
  { timestamps: true }
);


const ChallengeActionModel = mongoose.model("ChallengeAction", ChallengeActionSchema);
module.exports = ChallengeActionModel;
