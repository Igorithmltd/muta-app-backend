const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    name: String,
  },
  { timestamps: true }
);

const ChatRoomModel = mongoose.model("ChatRoom", ChatRoomSchema);
module.exports = ChatRoomModel;
