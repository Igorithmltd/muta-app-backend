const CallLogService = require("../services/call-log.service");
const  BaseController = require("./base");

class CallLogController extends BaseController{
    async initiateCall(req, res){
        const callLogService = new CallLogService()
        const initiateCall = await callLogService.initiateCall(req)
        if(!initiateCall.success){
            return BaseController.sendFailedResponse(res, initiateCall.data)
        }
        return BaseController.sendSuccessResponse(res, initiateCall.data)
    }
    async getUserCallLogs(req, res){
        const callLogService = new CallLogService()
        const getUserCallLogs = await callLogService.getUserCallLogs(req)
        if(!getUserCallLogs.success){
            return BaseController.sendFailedResponse(res, getUserCallLogs.data)
        }
        return BaseController.sendSuccessResponse(res, getUserCallLogs.data)
    }
    async endCall(req, res){
        const callLogService = new CallLogService()
        const endCall = await callLogService.endCall(req)
        if(!endCall.success){
            return BaseController.sendFailedResponse(res, endCall.data)
        }
        return BaseController.sendSuccessResponse(res, endCall.data)
    }
    async missCall(req, res){
        const callLogService = new CallLogService()
        const missCall = await callLogService.missCall(req)
        if(!missCall.success){
            return BaseController.sendFailedResponse(res, missCall.data)
        }
        return BaseController.sendSuccessResponse(res, missCall.data)
    }
    async rejectCall(req, res){
        const callLogService = new CallLogService()
        const rejectCall = await callLogService.rejectCall(req)
        if(!rejectCall.success){
            return BaseController.sendFailedResponse(res, rejectCall.data)
        }
        return BaseController.sendSuccessResponse(res, rejectCall.data)
    }
    async recievedCall(req, res){
        const callLogService = new CallLogService()
        const recievedCall = await callLogService.recievedCall(req)
        if(!recievedCall.success){
            return BaseController.sendFailedResponse(res, recievedCall.data)
        }
        return BaseController.sendSuccessResponse(res, recievedCall.data)
    }
    async updateCallStatus(req, res){
        const callLogService = new CallLogService()
        const updateCallStatus = await callLogService.updateCallStatus(req)
        if(!updateCallStatus.success){
            return BaseController.sendFailedResponse(res, updateCallStatus.data)
        }
        return BaseController.sendSuccessResponse(res, updateCallStatus.data)
    }
    async getAgoraToken(req, res){
        const callLogService = new CallLogService()
        const getAgoraToken = await callLogService.getAgoraToken(req)
        if(!getAgoraToken.success){
            return BaseController.sendFailedResponse(res, getAgoraToken.data)
        }
        return BaseController.sendSuccessResponse(res, getAgoraToken.data)
    }
}

module.exports = CallLogController