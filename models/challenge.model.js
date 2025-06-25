// models/Post.ts
const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    title: { type: String, required: true, unique: true },
    goal: { type: String, required: true },
    duration: { type: String, required: true },
    durationUnit: { type: String, required: true, enum: ["minute", "hour"], default: "minute" },
    difficulty: { type: String, required: true },
    streak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ChallengeSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      // const user = this as IUser;
      const hashPassword = await bcrypt.hash(this.password, 10);
      this.password = hashPassword;
    }
    next();
  } catch (error) {
    return next(error);
  }
});


const ChallengeModel = mongoose.model("Challenge", ChallengeSchema);
module.exports = ChallengeModel;
