const ChatService = require("../services/chat.service");
const  BaseController = require("./base");

class ChatController extends BaseController{
    async createPrivateChat(req, res){
        const chatService = new ChatService()
        const createPrivateChat = await chatService.createPrivateChat(req)
        if(!createPrivateChat.success){
            return BaseController.sendFailedResponse(res, createPrivateChat.data)
        }
        return BaseController.sendSuccessResponse(res, createPrivateChat.data)
    }
    async getMyChats(req, res){
        const chatService = new ChatService()
        const getMyChats = await chatService.getMyChats(req)
        if(!getMyChats.success){
            return BaseController.sendFailedResponse(res, getMyChats.data)
        }
        return BaseController.sendSuccessResponse(res, getMyChats.data)
    }
    async getChatMessages(req, res){
        const chatService = new ChatService()
        const getChatMessages = await chatService.getChatMessages(req)
        if(!getChatMessages.success){
            return BaseController.sendFailedResponse(res, getChatMessages.data)
        }
        return BaseController.sendSuccessResponse(res, getChatMessages.data)
    }
    async generalChat(req, res){
        const chatService = new ChatService()
        const generalChat = await chatService.generalChat(req)
        if(!generalChat.success){
            return BaseController.sendFailedResponse(res, generalChat.data)
        }
        return BaseController.sendSuccessResponse(res, generalChat.data)
    }
    async searchMessage(req, res){
        const chatService = new ChatService()
        const searchMessage = await chatService.searchMessage(req)
        if(!searchMessage.success){
            return BaseController.sendFailedResponse(res, searchMessage.data)
        }
        return BaseController.sendSuccessResponse(res, searchMessage.data)
    }
}

module.exports = ChatController