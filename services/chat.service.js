const BaseService = require("./base");
const { empty } = require("../util");
const validateData = require("../util/validate");
const ChatRoomModel = require("../models/chatModel");
const MessageModel = require("../models/message.model");

class UserService extends BaseService {
  async createPrivateChat(req) {
    const { userId, coachId } = req.body;

    let chat = await ChatRoomModel.findOne({
      type: "private",
      participants: { $all: [userId, coachId] },
    });

    if (!chat) {
      chat = await ChatRoomModel.create({
        type: "private",
        participants: [userId, coachId],
      });
    }

    return BaseService.sendSuccessResponse({ message: chat });
  }
  async getMyChats(req) {
    const userId = req.user.id;

    const chats = await ChatRoomModel.find({ participants: userId }).populate(
      "participants"
    );
    return BaseService.sendSuccessResponse({ message: chats });
  }
  async getChatMessages(req) {
    const { id } = req.params;

  const messages = await MessageModel.find({ room: id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("sender");

    // await ChatRoomModel.create({
    //     type: "group",
    //     name: "general",
    //     participants: [], // Or all users
    //   });
      

    return BaseService.sendSuccessResponse({ message: messages });
  }
}

module.exports = UserService;
