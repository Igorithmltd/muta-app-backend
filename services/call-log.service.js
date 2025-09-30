const CallLogModel = require("../models/call-log.model");
const BaseService = require("./base");
import { RtcTokenBuilder, RtcRole } from "agora-access-token";
class CallLogService extends BaseService {
  async initiateCall(req) {
    try {
      const post = req.body;
      const userId = req.user.id;

      const validateRule = {
        sessionId: "string|required",
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

      const { callerId, receiverId, callType, sessionId } = post;

      const callLog = new CallLogModel({
        callerId: userId,
        receiverId,
        callType,
        status: "initiated",
        sessionId,
        startTime: new Date(),
      });

      await callLog.save();

      // Optionally: Emit socket event to receiver
      // io.to(receiverId).emit("incoming_call", callLog);

      return BaseService.sendSuccessResponse({ message: callLog });
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
  async getAgoraToken(req) {
    try {
      const appID = process.env.AGORA_APP_ID;
      const appCertificate = process.env.AGORA_APP_CERTIFICATE;
      const channelName = req.query.channel;

      if (!channelName) {
        return BaseService.sendFailedResponse({ error: "Channel name is required" });
      }

      const uid = 0; // auto assign UID
      const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 3600; // 1 hour
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const token = RtcTokenBuilder.buildTokenWithUid(
        appID,
        appCertificate,
        channelName,
        uid,
        role,
        privilegeExpiredTs
      );


      return BaseService.sendSuccessResponse({ message: token });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
}

module.exports = CallLogService;
