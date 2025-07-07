const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    groupName: { type: String, required: true },
  },
  { timestamps: true }
);

const GroupModel = mongoose.model("Group", GroupSchema);
module.exports = GroupModel;
