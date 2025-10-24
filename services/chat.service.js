const BaseService = require("./base");
const { empty } = require("../util");
const validateData = require("../util/validate");
const ChatRoomModel = require("../models/chatModel");
const MessageModel = require("../models/message.model");
const mongoose = require("mongoose");

class UserService extends BaseService {
  async createMessage(req) {
    const post = req.body;
    const userId = req.user.id;

    const validateRule = {
      roomId: "string|required",
      message: "string|required",
    };

    const validateMessage = {
      required: ":attribute is required",
      string: ":attribute is a string",
    };

    const validateResult = validateData(post, validateRule, validateMessage);

    if (!validateResult.success) {
      return BaseService.sendFailedResponse({ error: validateResult.data });
    }

    const { message, roomId, receiverId } = post;

    const newMessage = await MessageModel.create({
      senderId: userId,
      ...(receiverId && { receiverId }),
      readBy: [userId],
      message: message,
      roomId: roomId,
    });

    return BaseService.sendSuccessResponse({
      message: newMessage,
    });
  }
  async createPrivateChat(req) {
    const post = req.body;
    const userId = req.user.id;

    const validateRule = {
      coachId: "string|required",
    };

    const validateMessage = {
      required: ":attribute is required",
      string: ":attribute is a string",
    };

    const validateResult = validateData(post, validateRule, validateMessage);

    if (!validateResult.success) {
      return BaseService.sendFailedResponse({ error: validateResult.data });
    }
    const { coachId } = req.body;

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
    try {
      
      const userId = req.user.id;
  
      const chats = await ChatRoomModel.find({ participants: userId, type: 'private' }).populate(
        "participants"
      );

      return BaseService.sendSuccessResponse({ message: chats });
    } catch (error) {
      return BaseService.sendFailedResponse({error: error.message})
    }
  }
  async getChatMessages(req) {
    const { id } = req.params;
    const userId = req.user.id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return BaseService.sendFailedResponse({ error: "Invalid chat room ID" });
    }

    const afterTime = req.query.afterTime
      ? new Date(req.query.afterTime)
      : null;
    const beforeTime = req.query.beforeTime
      ? new Date(req.query.beforeTime)
      : null;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    // Build the query filter dynamically
    const filter = { roomId: id };

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
      .populate("senderId", "firstName lastName email image")
      .populate("receiverId", "firstName lastName email image")
      .populate("likes")
      .populate("readBy", "firstName lastName email image");

    const totalMessages = await MessageModel.countDocuments(filter);
    const totalPages = Math.ceil(totalMessages / limit);

    const enrichedMessages = messages.map((msg) => {
      const msgObj = msg.toObject();

      msgObj.isLikedByMe = msg.likes.some(
        (likedUser) => likedUser._id.toString() === userId.toString()
      );

      // msgObj.isReadByMe = msg.readBy.some(
      //   (reader) => reader._id.toString() === userId.toString()
      // );

      return msgObj;
    });

    return BaseService.sendSuccessResponse({
      message: enrichedMessages,
      pagination: {
        page,
        limit,
        totalPages,
        totalMessages,
      },
    });
  }
  async generalChat(req) {
    const generalChat = await ChatRoomModel.findOne({
      name: "general",
    }).populate("participants");
    if (!generalChat) {
      return BaseService.sendFailedResponse({
        error: "General chat room not found",
      });
    }

    return BaseService.sendSuccessResponse({
      message: generalChat,
    });
  }
  async searchMessage(req) {
    try {
      const { roomId, keyword } = req.query;
      const userId = req.user.id
      if (!roomId) {
        return BaseService.sendFailedResponse({ error: "roomId is required" });
      }

      if (!keyword) {
        return BaseService.sendSuccessResponse({ message: [] });
      }

      const messages = await MessageModel.find({
        roomId: roomId,
        message: { $regex: keyword, $options: "i" }, // contains keyword anywhere
      })
        .sort({ createdAt: -1 })
        .populate("senderId", "firstName lastName email image")
        .populate("receiverId", "firstName lastName email image")
        .populate("likes")
        .populate("readBy", "firstName lastName email image");


      const enrichedMessages = messages.map((msg) => {
        const msgObj = msg.toObject();

        msgObj.isLikedByMe = msg.likes.some(
          (likedUser) => likedUser._id.toString() === userId.toString()
        );

        // msgObj.isReadByMe = msg.readBy.some(
        //   (reader) => reader._id.toString() === userId.toString()
        // );

        return msgObj;
      });

      return BaseService.sendSuccessResponse({
        message: enrichedMessages,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({ error: error.message });
    }
  }
  async likeMessage(req) {
    try {
      const userId = req.user.id; // assuming you have auth middleware
    const { id: messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return BaseService.sendFailedResponse({ error: "Invalid message ID" });
    }
    const message = await MessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const hasLiked = message.likes.some(
      (likeUserId) => likeUserId.toString() === userId.toString()
    );

    if (hasLiked) {
      // Unlike
      message.likes = message.likes.filter(
        (likeUserId) => likeUserId.toString() !== userId.toString()
      );
    } else {
      // Like
      message.likes.push(userId);
    }

    await message.save();

      return BaseService.sendSuccessResponse({
        message: `Message ${hasLiked ? "unliked" : "liked"} successfully`,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({ error: error.message });
    }
  }
  async unreadUserMessages(req) {
    try {
      

      return BaseService.sendSuccessResponse({
        message: "",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({ error: error.message });
    }
  }
}

/*
points:
- 
 */

module.exports = UserService;
