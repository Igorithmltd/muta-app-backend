const UserService = require("../services/user.service");
const  BaseController = require("./base");

class UserController extends BaseController{
    async createUser(req, res){
        const userService = new UserService()
        const createUser = await userService.createUser(req, res)
        if(!createUser.success){
            return BaseController.sendFailedResponse(res, createUser.data)
        }
        return BaseController.sendSuccessResponse(res, createUser.data)
    }
    async loginUser(req, res){
        const userService = new UserService()
        const loginUser = await userService.loginUser(req, res)
        if(!loginUser.success){
            return BaseController.sendFailedResponse(res, loginUser.data)
        }
        return BaseController.sendSuccessResponse(res, loginUser.data)
    }
    async getUser(req, res){
        const userService = new UserService()
        const getUser = await userService.getUser(req, res)
        if(!getUser.success){
            return BaseController.sendFailedResponse(res, getUser.data)
        }
        return BaseController.sendSuccessResponse(res, getUser.data)
    }
    async forgotPassword(req, res){
        const userService = new UserService()
        const forgotPassword = await userService.forgotPassword(req, res)
        if(!forgotPassword.success){
            return BaseController.sendFailedResponse(res, forgotPassword.data)
        }
        return BaseController.sendSuccessResponse(res, forgotPassword.data)
    }
    async resetPassword(req, res){
        const userService = new UserService()
        const resetPassword = await userService.resetPassword(req, res)
        if(!resetPassword.success){
            return BaseController.sendFailedResponse(res, resetPassword.data)
        }
        return BaseController.sendSuccessResponse(res, resetPassword.data)
    }
    async verifyEmail(req, res){
        const userService = new UserService()
        const verifyEmail = await userService.verifyEmail(req, res)
        if(!verifyEmail.success){
            return BaseController.sendFailedResponse(res, verifyEmail.data)
        }
        return BaseController.sendSuccessResponse(res, verifyEmail.data)
    }
    async sendOTP(req, res){
        const userService = new UserService()
        const sendOTP = await userService.sendOTP(req, res)
        if(!sendOTP.success){
            return BaseController.sendFailedResponse(res, sendOTP.data)
        }
        return BaseController.sendSuccessResponse(res, sendOTP.data)
    }
    async verifyOTP(req, res){
        const userService = new UserService()
        const verifyOTP = await userService.verifyOTP(req, res)
        if(!verifyOTP.success){
            return BaseController.sendFailedResponse(res, verifyOTP.data)
        }
        return BaseController.sendSuccessResponse(res, verifyOTP.data)
    }
    async verifyPasswordOTP(req, res){
        const userService = new UserService()
        const verifyPasswordOTP = await userService.verifyPasswordOTP(req, res)
        if(!verifyPasswordOTP.success){
            return BaseController.sendFailedResponse(res, verifyPasswordOTP.data)
        }
        return BaseController.sendSuccessResponse(res, verifyPasswordOTP.data)
    }
    async refreshToken(req, res){
        const userService = new UserService()
        const refreshToken = await userService.refreshToken(req, res)
        if(!refreshToken.success){
            return BaseController.sendFailedResponse(res, refreshToken.data)
        }
        return BaseController.sendSuccessResponse(res, refreshToken.data)
    }
    async updateAccountDetails(req, res){
        const userService = new UserService()
        const updateAccountDetails = await userService.updateAccountDetails(req, res)
        if(!updateAccountDetails.success){
            return BaseController.sendFailedResponse(res, updateAccountDetails.data)
        }
        return BaseController.sendSuccessResponse(res, updateAccountDetails.data)
    }
}

module.exports = UserController