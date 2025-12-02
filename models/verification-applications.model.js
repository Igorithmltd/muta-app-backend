const mongoose = require("mongoose");

const VerificationApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    governmentIssuedId: {
      imageUrl: { type: String },
      publicId: { type: String },
    },
    coachCertificate: {
      imageUrl: { type: String },
      publicId: { type: String },
    },
    submittedAt: Date,
    reviewedAt: Date,
  },
  { timestamps: true }
);

const VerificationApplicationModel = mongoose.model(
  "VerificationApplication",
  VerificationApplicationSchema
);
module.exports = VerificationApplicationModel;
