// models/Post.ts
const mongoose = require("mongoose");

const NuggetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    shares: {type: Number, default: 0},
    likes: {type: Number, default: 0},
    downloads: {type: Number, default: 0},
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sharedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downloadedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // scheduledFor: { type: Date, required: false },
    // expiresAt: { type: Date, required: false },
  },
  { timestamps: true }
);


// NuggetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const NuggetModel = mongoose.model("Nugget", NuggetSchema);
module.exports = NuggetModel;
