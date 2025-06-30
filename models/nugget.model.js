// models/Post.ts
const mongoose = require("mongoose");

const NuggetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    shares: {type: Number, default: 0},
    likes: {type: Number, default: 0},
  },
  { timestamps: true }
);




const NuggetModel = mongoose.model("Nugget", NuggetSchema);
module.exports = NuggetModel;
