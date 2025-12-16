const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    indexes: [{ unique: true, fields: ["blocker", "blocked"] }],
  }
);

const BlockUserModel = mongoose.model("BlockUser", ReportSchema);
module.exports = BlockUserModel;
