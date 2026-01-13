const CallLogModel = require("../models/call-log.model");
const BaseService = require("./base");
const AgoraToken = require("agora-token");
const { v4: uuidv4 } = require("uuid");
const { sendPushNotification } = require("./firebase.service");
const UserModel = require("../models/user.model");
const validateData = require("../util/validate");
const { getIO } = require("../config/socket");
const ChatRoomModel = require("../models/chatModel");
const ScheduledCallModel = require("../models/scheduledCall.model");
const RtcTokenBuilder = AgoraToken.RtcTokenBuilder;
class CallLogService extends BaseService {
  async initiateCall(req) {
    try {
      const post = req.body;
      const userId = req.user.id;

      const validateRule = {
        // sessionId: "string|required",
        callType: "string|required",
        receiverId: "string|required",
        // callerId: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { receiverId, callType } = post;
      const sessionId = uuidv4();

      const receiver = await UserModel.findById(receiverId);
      const user = await UserModel.findById(userId);

      if (!user) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      if (!receiver) {
        return BaseService.sendFailedResponse({ error: "Receiver not found" });
      }
      const receiverDeviceToken = receiver.deviceToken;

      if (!receiverDeviceToken) {
        return BaseService.sendFailedResponse({
          error: "Receiver cannot be reached at the moment",
        });
      }

      const callLog = new CallLogModel({
        callerId: userId,
        receiverId,
        callType,
        status: "incoming",
        sessionId,
        startTime: new Date(),
      });

      let userAgoraToken = null;
      let receiverAgoraToken = null;

      const userUid = 1;
      const receiverUid = 2;

      const getUserAgoraToken = await this.getAgoraToken({
        channelName: sessionId,
        uid: userUid,
      });
      const getReceiverAgoraToken = await this.getAgoraToken({
        channelName: sessionId,
        uid: receiverUid,
      });

      if (!getUserAgoraToken.success) {
        return BaseService.sendFailedResponse({
          error: "Could not generate call token",
        });
      }
      if (!getReceiverAgoraToken.success) {
        return BaseService.sendFailedResponse({
          error: "Could not generate call token",
        });
      }
      userAgoraToken =
        getUserAgoraToken.data && getUserAgoraToken.data.message
          ? getUserAgoraToken.data.message
          : null;
      receiverAgoraToken =
        getReceiverAgoraToken.data && getReceiverAgoraToken.data.message
          ? getReceiverAgoraToken.data.message
          : null;
      const userJwtToken = await user.generateAccessToken(process.env.ACCESS_TOKEN_SECRET, '10m');
      const receiverJwtToken = await receiver.generateAccessToken(process.env.ACCESS_TOKEN_SECRET, '10m');

      const callObject = {
        callId: callLog._id,
        channelId: sessionId,
        token: userAgoraToken,
        agoraUid: userUid,
        caller: {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
        },
        receiver: {
          userId: receiver._id,
          firstName: receiver.firstName,
          lastName: receiver.lastName,
          image: receiver.image,
        },
        callType,
        callStatus: "outgoing",
        notificationType: "call",
        jwtToken: userJwtToken
      };

      const receiverData = {
        ...callObject,
        callStatus: "incoming",
        token: receiverAgoraToken,
        agoraUid: receiverUid,
        jwtToken: receiverJwtToken
      };

      // const sendPushNotification = async ({ deviceToken, topic, title, body, data = {} }) => {
      sendPushNotification({
        deviceToken: receiverDeviceToken,
        title: "Incoming Call",
        body: `You have an incoming ${callType} call`,
        data: receiverData,
        notificationType: "call",
      });
      await callLog.save();

      return BaseService.sendSuccessResponse({ message: callObject });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async endCall(req) {
    try {
      const post = req.body;
      const userId = req.user.id;

      const validateRule = {
        sessionId: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { sessionId } = post;

      const callLog = await CallLogModel.findOne({ sessionId });
      if (!callLog)
        return BaseService.sendFailedResponse({ error: "Call not found" });

      const endTime = new Date();
      callLog.endTime = endTime;
      callLog.status = "ended";
      callLog.duration = Math.floor((endTime - callLog.startTime) / 1000);

      await callLog.save();

      return BaseService.sendSuccessResponse({ message: "Call ended" });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async missCall(req) {
    try {
      const post = req.body;
      const userId = req.user.id;

      const validateRule = {
        sessionId: "string|required",
        receiverId: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { receiverId, sessionId } = post;

      const callLog = new CallLogModel({
        callerId: userId,
        receiverId,
        callType: "video",
        status: "missed",
        sessionId,
      });

      await callLog.save();

      return BaseService.sendSuccessResponse({
        message: "You missed this call",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async recievedCall(req) {
    try {
      const post = req.body;

      const validateRule = {
        sessionId: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { sessionId } = post;

      const callLog = await CallLogModel.findOne({ sessionId });
      if (!callLog) return res.status(404).json({ message: "Call not found" });

      callLog.status = "received";
      callLog.startTime = new Date(); // update start time to when receiver answered
      await callLog.save();

      return BaseService.sendSuccessResponse({
        message: "Call received",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async rejectCall(req) {
    try {
      const post = req.body;
      const userId = req.user.id;

      const validateRule = {
        sessionId: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { sessionId } = post;

      const callLog = await CallLogModel.findOne({ sessionId });
      if (!callLog) return res.status(404).json({ message: "Call not found" });

      callLog.status = "rejected";
      callLog.endTime = new Date();
      callLog.duration = 0; // no duration since call was rejected

      await callLog.save();

      return BaseService.sendSuccessResponse({
        message: "Call rejected",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async updateCallStatus(req, res) {
    try {
      const post = req.body;
      const userId = req.user.id;

      // 1️⃣ Validate incoming data
      const validateRule = {
        sessionId: "string|required",
        status: "string|required|in:ringing,received,missed,ended,rejected",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
        "in.in":
          ":attribute must be one of ringing, received, declined, missed, ended, rejected.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { sessionId, status } = post;

      // 2️⃣ Find the call log
      const callLog = await CallLogModel.findOne({ sessionId })
        .populate("callerId", "firstName lastName email image _id")
        .populate("receiverId", "firstName lastName email image _id");

      if (!callLog) return res.status(404).json({ message: "Call not found" });

      const chat = await ChatRoomModel.findOne({
        participants: { $all: [callLog.callerId, callLog.receiverId] },
      });

      if (!chat) {
        return BaseService.sendFailedResponse({
          error: "Chat does not exists between this coach and user",
        });
      }

      // 3️⃣ Update status and related fields dynamically
      callLog.status = status;

      // 4️⃣ Handle additional fields based on the new status
      switch (status) {
        case "ringing":
          callLog.startTime = new Date();
          callLog.endTime = null;
          callLog.duration = 0;
          break;

        case "received":
          callLog.answerTime = new Date();
          break;

        case "ended":
          callLog.endTime = new Date();
          if (callLog.answerTime) {
            callLog.duration = Math.floor(
              (callLog.endTime - callLog.answerTime) / 1000
            ); // duration in seconds
          }
          break;

        case "missed":
        case "declined":
        case "rejected":
          callLog.endTime = new Date();
          callLog.duration = 0;
          break;
      }

      // 5️⃣ Save and respond
      await callLog.save();

      getIO().to(chat._id.toString()).emit("callStatusUpdated", callLog);
      // getIO().to(callLog.callerId.toString()).emit("callStatusUpdated", callLog);

      return BaseService.sendSuccessResponse({
        message: `Call status updated to ${status}`,
        data: callLog,
      });
    } catch (error) {
      console.error("Error updating call status:", error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getUserCallLogs(req) {
    try {
      const userId = req.user.id;
      const callType = req.query.callType;
      const filter = {
        $or: [{ callerId: userId }, { receiverId: userId }],
        status: { $in: ["missed", "received", "incoming"] },
      };
      if (callType) {
        filter.callType = callType;
      }

      const logs = await CallLogModel.find(filter)
        .sort({ createdAt: -1 })
        .populate("callerId", "firstName lastName email image _id")
        .populate("receiverId", "firstName lastName email image _id");

      return BaseService.sendSuccessResponse({ message: logs });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getUserMissedCalls(req) {
    try {
      const userId = req.user.id;
      const callType = req.query.callType;
      const filter = {
        $or: [{ callerId: userId }, { receiverId: userId }],
        status: "missed",
      };

      if (callType) {
        filter.callType = callType;
      }

      const logs = await CallLogModel.find(filter)
        .sort({ createdAt: -1 })
        .populate("callerId", "firstName lastName email image _id")
        .populate("receiverId", "firstName lastName email image _id");

      return BaseService.sendSuccessResponse({ message: logs });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async markCallAsRead(req) {
    try {
      const select = req.query.select;
      const id = req.query.callId;

      const userId = req.user.id;

      if (!id) {
        await CallLogModel.updateMany(
          {
            $or: [{ callerId: userId }, { receiverId: userId }],
            isRead: false,
          },
          { isRead: true }
        );

      } else {
        if (!id) {
          return BaseService.sendFailedResponse({
            error: "Please provide a call id",
          });
        }

        const call = await CallLogModel.findOne({
          _id: id,
          $or: [{ callerId: userId }, { receiverId: userId }],
        });

        if (!call) {
          return BaseService.sendFailedResponse({ error: "Call not found" });
        }

        call.isRead = true;
        await call.save();
      }

      return BaseService.sendSuccessResponse({
        message: "Call marked as read",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async scheduleCall(req) {
    try {
      const post = req.body;

      const validateRule = {
        coachId: "string|required",
        userId: "string|required",
        callType: "string|required:in:audio,video",
        callDate: "date|required",
        startTime: "string|required",
        endTime: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
        "date.date": ":attribute must be a valid date.",
      };
      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }
      const { coachId, userId, callType, callDate, startTime, endTime } = post;

      const receiver = await UserModel.findById(userId);
      const sender = await UserModel.findById(coachId);

      // const receiverDeviceToken = receiver.deviceToken;

      // if (!receiverDeviceToken) {
      //   return BaseService.sendFailedResponse({
      //     error: "Receiver cannot be reached at the moment",
      //   });
      // }

      // const receiverData = {
      //   ...callObject,
      //   callStatus: "incoming",
      //   token: receiverAgoraToken,
      //   agoraUid: receiverUid,
      //   jwtToken: receiverJwtToken
      // };

      const scheduleCallData = {
        coachId,
        userId,
        callType,
        callDate,
        startTime,
        endTime,
        ...post
      }

      const scheduledCall = await ScheduledCallModel.create(scheduleCallData);

      // sendPushNotification({
      //   deviceToken: receiverDeviceToken,
      //   title: "Incoming Scheduled call",
      //   body: `${sender.firstName} scheduled an ${callType} call with you`,
      //   data: receiverData,
      //   notificationType: "call",
      // });
    
      return BaseService.sendSuccessResponse({
        message: scheduledCall,
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  // async getAgoraToken(req) {
  async getAgoraToken({ channelName, uid }) {
    try {
      const appID = process.env.AGORA_APP_ID;
      const appCertificate = process.env.AGORA_APP_CERTIFICATE;
      // const channelName = req.query.channel;

      if (!channelName) {
        return BaseService.sendFailedResponse({
          error: "Channel name is required",
        });
      }

      const RtcRole = {
        ROLE_PUBLISHER: 1,
        ROLE_SUBSCRIBER: 2,
      };
      // const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 3600; // 1 hour
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
      const tokenExpirationInSecond = 3600 * 24; // 1 hour in seconds

      const token = RtcTokenBuilder.buildTokenWithUid(
        appID,
        appCertificate,
        channelName,
        uid,
        RtcRole.ROLE_PUBLISHER,
        tokenExpirationInSecond,
        privilegeExpiredTs
      );

      return BaseService.sendSuccessResponse({ message: token });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
}

module.exports = CallLogService;
