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
const { RtcRole } = require("../util/constants");
const RtcTokenBuilder = AgoraToken.RtcTokenBuilder;


const appID = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;
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
      const userJwtToken = await user.generateAccessToken(
        process.env.ACCESS_TOKEN_SECRET,
        "10m"
      );
      const receiverJwtToken = await receiver.generateAccessToken(
        process.env.ACCESS_TOKEN_SECRET,
        "10m"
      );

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
        jwtToken: userJwtToken,
      };

      const receiverData = {
        ...callObject,
        callStatus: "incoming",
        token: receiverAgoraToken,
        agoraUid: receiverUid,
        jwtToken: receiverJwtToken,
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
      BaseService.sendFailedResponse({ error: this.server_error_message });
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
      BaseService.sendFailedResponse({ error: this.server_error_message });
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
      BaseService.sendFailedResponse({ error: this.server_error_message });
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
      BaseService.sendFailedResponse({ error: this.server_error_message });
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
      BaseService.sendFailedResponse({ error: this.server_error_message });
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
      BaseService.sendFailedResponse({ error: this.server_error_message });
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
      BaseService.sendFailedResponse({ error: this.server_error_message });
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
      BaseService.sendFailedResponse({ error: this.server_error_message });
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
      BaseService.sendFailedResponse({ error: this.server_error_message });
    }
  }
  async scheduleCall(req) {
    try {
      const post = req.body;
      const coachId = req.user.id

      const validateRule = {
        userId: "string|required",
        callType: "string|required:in:audio,video",
        callDate: "date|required",
        startTime: "string|required",
        endTime: "string|required",
        description: "string|required",
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
      const { userId, callType, callDate, startTime, endTime } = post;

      const receiver = await UserModel.findById(userId);
      const sender = await UserModel.findById(coachId);
      const sessionId = uuidv4();


      const receiverDeviceToken = receiver.deviceToken;

      if (!receiverDeviceToken) {
        return BaseService.sendFailedResponse({
          error: "Receiver cannot be reached at the moment",
        });
      }

      const scheduleCallData = {
        coachId,
        userId,
        callType,
        callDate,
        startTime,
        endTime,
        channelId: sessionId,
        ...post,
      };

      const callConflict = await ScheduledCallModel.findOne({
        coachId,
        status: "scheduled",
        $or: [{ startAt: { $lt: startTime }, endAt: { $gt: endTime } }],
      });

      if (callConflict) {
        return BaseService.sendFailedResponse({
          error:
            "You have another call scheduled during this time. Please choose a different time slot.",
        });
      }


  //   duration: { type: Number }, // in seconds
  //   sessionId: { type: String }, // Agora/Twilio session id
  //   recordingUrl: { type: String },
      const call = await CallLogModel.create({
        receiverId: userId,
        callerId: coachId,
        callType,
        sessionId,
      })
      
      const scheduledCall = await ScheduledCallModel.create(scheduleCallData);

      const callObject = {
        callId: call._id,
        channelId: sessionId,
        // token: userAgoraToken,
        // agoraUid: userUid,
        caller: {
          userId: sender._id,
          firstName: sender.firstName,
          lastName: sender.lastName,
          image: sender.image,
        },
        receiver: {
          userId: receiver._id,
          firstName: receiver.firstName,
          lastName: receiver.lastName,
          image: receiver.image,
        },
        callType,
        callStatus: "scheduled",
        notificationType: "call",
        // jwtToken: userJwtToken,
      };

      const receiverData = {
        call: callObject,
        // token: receiverAgoraToken,
        // agoraUid: receiverUid,
        // jwtToken: receiverJwtToken,
      };

      sendPushNotification({
        deviceToken: receiverDeviceToken,
        title: "Incoming Scheduled call",
        body: `${sender.firstName} scheduled an ${callType} call with you`,
        data: receiverData,
        notificationType: "scheduledCall",
      });

      const response = {
        ...scheduledCall.toObject(),
        call
      }
      return BaseService.sendSuccessResponse({
        message: response,
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse({ error: this.server_error_message });
    }
  }
  async getScheduledCalls(req) {
    try {
      const userId = req.user.id;

      const scheduledCalls = await ScheduledCallModel.find({
        $or: [{ coachId: userId }, { userId: userId }],
        status: { $in: ["scheduled", "completed"] },
      });

      return BaseService.sendSuccessResponse({
        message: scheduledCalls,
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse({ error: this.server_error_message });
    }
  }
  async getScheduledCall(req) {
    try {
      const userId = req.user.id;
      const callId = req.params.id;

      const scheduledCall = await ScheduledCallModel.findOne({
        $or: [{ coachId: userId }, { userId: userId }],
        _id: callId,
        status: { $in: ["scheduled", "completed"] },
      });

      return BaseService.sendSuccessResponse({
        message: scheduledCall,
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse({ error: this.server_error_message });
    }
  }
  async deleteScheduledCall(req) {
    try {
      const userId = req.user.id;
      const callId = req.params.id;

      const scheduledCall = await ScheduledCallModel.findOneAndDelete({
        $or: [{ coachId: userId }, { userId: userId }],
        _id: callId,
      });

      return BaseService.sendSuccessResponse({
        message: "Call schedule deleted",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse({ error: this.server_error_message });
    }
  }
  async modifyScheduleCall(req) {
    try {
      const userId = req.user.id;
      const callId = req.params.id;

      const scheduledCall = await ScheduledCallModel.findByIdAndUpdate(
        {
          $or: [{ coachId: userId }, { userId: userId }],
          _id: callId,
        },
        {
          ...req.body,
        },
        { new: true }
      );

      return BaseService.sendSuccessResponse({
        message: "Call schedule updated successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse({ error: this.server_error_message });
    }
  }
  // async getAgoraToken(req) {
  async getAgoraToken({ channelName, uid }) {
    try {
      // const channelName = req.query.channel;

      if (!channelName) {
        return BaseService.sendFailedResponse({
          error: "Channel name is required",
        });
      }
      
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
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }

  async generateAgoraToken(req) {
    try {
      const post = req.body;
      const userId = req.user.id

      const validateRule = {
        callId: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const {callId} = post

      const call = await CallLogModel.findById(callId);
      const user = await UserModel.findById(userId);

      if(!call){
        return BaseService.sendFailedResponse({error: "Call not found"})
      }
      if(!user){
        return BaseService.sendFailedResponse({error: "User not found"})
      }


      let userUid = null;

      const userType = req.user.userType;

      if(userType === 'coach'){
        userUid = 1
      }else if(userType === 'user'){
        userUid = 2
      }

      const sessionId = call.sessionId;

      const getAgoraToken = await this.getAgoraToken({
          channelName: sessionId,
          uid: userUid,
        });

      if (!getAgoraToken.success) {
        return BaseService.sendFailedResponse({
          error: "Could not generate call token",
        });
      }

      const token = getAgoraToken.data && getAgoraToken.data.message ? getAgoraToken.data.message : null;
      const userJwtToken = await user.generateAccessToken(
        process.env.ACCESS_TOKEN_SECRET,
        "10m"
      );

      const callObject = {
        callId: call._id,
        channelId: sessionId,
        token: token,
        agoraUid: userUid,
        user: {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
        },
        callType: call.callType,
        jwtToken: userJwtToken,
      };

      if(!call.startTime){
        call.startTime = new Date();
      }else if(call.startTime){
        call.status = 'received';
      }


      return BaseService.sendSuccessResponse({ message: callObject });

    } catch (error) {
      console.log("Error", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
}

module.exports = CallLogService;
