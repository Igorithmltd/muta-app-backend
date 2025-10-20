const CallLogModel = require("../models/call-log.model");
const BaseService = require("./base");
const AgoraToken = require('agora-token')
const { v4: uuidv4 } = require("uuid");
const { sendPushNotification } = require("./firebase.service");
const UserModel = require("../models/user.model");
const validateData = require("../util/validate");
const RtcTokenBuilder = AgoraToken.RtcTokenBuilder
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

      if (!user){
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      if (!receiver){
        return BaseService.sendFailedResponse({ error: "Receiver not found" });
      }
      const receiverDeviceToken = receiver.deviceToken;

      if(!receiverDeviceToken){
        return BaseService.sendFailedResponse({ error: "Receiver cannot be reached at the moment" });
      }

      const callLog = new CallLogModel({
        callerId: userId,
        receiverId,
        callType,
        status: "initiated",
        sessionId,
        startTime: new Date(),
      });

      let userAgoraToken = null
      let receiverAgoraToken = null

      const getUserAgoraToken = await this.getAgoraToken({channelName: sessionId, userId: userId})
      const getReceiverAgoraToken = await this.getAgoraToken({channelName: sessionId, userId: receiverId})

      if(!getUserAgoraToken.success){
        return BaseService.sendFailedResponse({ error: "Could not generate call token" });
      }
      if(!getReceiverAgoraToken.success){
        return BaseService.sendFailedResponse({ error: "Could not generate call token" });
      }
      userAgoraToken = getUserAgoraToken.data && getUserAgoraToken.data.message ? getUserAgoraToken.data.message : null
      receiverAgoraToken = getReceiverAgoraToken.data && getReceiverAgoraToken.data.message ? getReceiverAgoraToken.data.message : null

      // {
      //   callId: <String>,
      //   channelId: <String> // for agora,
      //   token: <String> // token from agora to authenticate the user
      //   caller : {
      //     userId: <String>
      //     firstName: <String>
      //     lastName: <String>
      //     image: <String>
      //   }
      //   receiver : {
      //     userId: <String>
      //     firstName: <String>
      //     lastName: <String>
      //     image: <String>
      //   }
      //   callType: <"audio" | "video">,
      //   callStatus <"incoming" | "outgoing" | "missed" | "declined"
      // }
      const callObject = {
        callId: callLog._id,
        channelId: sessionId,
        token: userAgoraToken,
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
        notificationType: "call"
      }


      // const sendPushNotification = async ({ deviceToken, topic, title, body, data = {} }) => {
      sendPushNotification({
        deviceToken: receiverDeviceToken,
        // topic: `user_${receiverId}`,
        // title: "",
        // body: "",
        title: "Incoming Call",
        body: `You have an incoming ${callType} call`,
        data: {...callObject, callStatus: "incoming", token: receiverAgoraToken },
        notificationType: "call",
      })
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
  async getUserCallLogs(req) {
    try {
      const { id } = req.params;

      const logs = await CallLogModel.find({
        $or: [{ callerId: userId }, { receiverId: userId }],
      }).sort({ createdAt: -1 });

      return BaseService.sendSuccessResponse({ message: logs });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  // async getAgoraToken(req) {
  async getAgoraToken({channelName, userId}) {
    try {
      const appID = process.env.AGORA_APP_ID;
      const appCertificate = process.env.AGORA_APP_CERTIFICATE;
      // const channelName = req.query.channel;

      if (!channelName) {
        return BaseService.sendFailedResponse({ error: "Channel name is required" });
      }

      const uid = uuidv4(); // auto assign UID
      const RtcRole = {
        ROLE_PUBLISHER: 1,
        ROLE_SUBSCRIBER: 2,
      };      
      // const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 3600; // 1 hour
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
      const tokenExpirationInSecond = 3600; // 1 hour in seconds


      const token = RtcTokenBuilder.buildTokenWithUserAccount(
        appID,
        appCertificate,
        channelName,
        userId,
        RtcRole.ROLE_PUBLISHER,
        tokenExpirationInSecond,
        privilegeExpiredTs,
      );

      
      return BaseService.sendSuccessResponse({ message: token });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
}

module.exports = CallLogService;
