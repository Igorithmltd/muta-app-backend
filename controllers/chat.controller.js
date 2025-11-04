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
    async createMessage(req, res){
        const chatService = new ChatService()
        const createMessage = await chatService.createMessage(req)
        if(!createMessage.success){
            return BaseController.sendFailedResponse(res, createMessage.data)
        }
        return BaseController.sendSuccessResponse(res, createMessage.data)
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
    async likeMessage(req, res){
        const chatService = new ChatService()
        const likeMessage = await chatService.likeMessage(req)
        if(!likeMessage.success){
            return BaseController.sendFailedResponse(res, likeMessage.data)
        }
        return BaseController.sendSuccessResponse(res, likeMessage.data)
    }
    async flagMessage(req, res){
        const chatService = new ChatService()
        const flagMessage = await chatService.flagMessage(req)
        if(!flagMessage.success){
            return BaseController.sendFailedResponse(res, flagMessage.data)
        }
        return BaseController.sendSuccessResponse(res, flagMessage.data)
    }
    async unreadUserMessages(req, res){
        const chatService = new ChatService()
        const unreadUserMessages = await chatService.unreadUserMessages(req)
        if(!unreadUserMessages.success){
            return BaseController.sendFailedResponse(res, unreadUserMessages.data)
        }
        return BaseController.sendSuccessResponse(res, unreadUserMessages.data)
    }
}

module.exports = ChatController