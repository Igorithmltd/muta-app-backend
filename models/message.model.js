const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    roomId: { type: String },
    message: { type: String, required: true },
    type: { type: String, enum: ["private", "group"], required: true },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model("Message", MessageSchema);
module.exports = MessageModel;
