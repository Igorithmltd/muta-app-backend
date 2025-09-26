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
    const afterTime = req.query.afterTime ? new Date(req.query.afterTime) : null;
    const beforeTime = req.query.beforeTime ? new Date(req.query.beforeTime) : null;
  
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;
  
    // Build the query filter dynamically
    const filter = { room: id };
  
    if (afterTime && beforeTime) {
      filter.createdAt = { $gt: afterTime, $lt: beforeTime };
    } else if (afterTime) {
      filter.createdAt = { $gt: afterTime };
    } else if (beforeTime) {
      filter.createdAt = { $lt: beforeTime };
    }
  
    const messages = await MessageModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender")
      .populate("likes")
      .populate("readBy");
  
    const totalMessages = await MessageModel.countDocuments(filter);
    const totalPages = Math.ceil(totalMessages / limit);
  
    return BaseService.sendSuccessResponse({
      message: messages,
      pagination: {
        page,
        limit,
        totalPages,
        totalMessages,
      },
    });
  }
  
  
}

module.exports = UserService;
