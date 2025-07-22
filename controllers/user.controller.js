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
    async googleSignup(req, res){
        const userService = new UserService()
        const googleSignup = await userService.googleSignup(req, res)
        if(!googleSignup.success){
            return BaseController.sendFailedResponse(res, googleSignup.data)
        }
        return BaseController.sendSuccessResponse(res, googleSignup.data)
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
    async completeOnboarding(req, res){
        const userService = new UserService()
        const completeOnboarding = await userService.completeOnboarding(req, res)
        if(!completeOnboarding.success){
            return BaseController.sendFailedResponse(res, completeOnboarding.data)
        }
        return BaseController.sendSuccessResponse(res, completeOnboarding.data)
    }
    async profileImageUpload(req, res){
        const userService = new UserService()
        const profileImageUpload = await userService.profileImageUpload(req)
        if(!profileImageUpload.success){
            return BaseController.sendFailedResponse(res, profileImageUpload.data)
        }
        return BaseController.sendSuccessResponse(res, profileImageUpload.data)
    }
    async getDailyNugget(req, res){
        const userService = new UserService()
        const getDailyNugget = await userService.getDailyNugget(req)
        if(!getDailyNugget.success){
            return BaseController.sendFailedResponse(res, getDailyNugget.data)
        }
        return BaseController.sendSuccessResponse(res, getDailyNugget.data)
    }
    async editNugget(req, res){
        const userService = new UserService()
        const editNugget = await userService.editNugget(req)
        if(!editNugget.success){
            return BaseController.sendFailedResponse(res, editNugget.data)
        }
        return BaseController.sendSuccessResponse(res, editNugget.data)
    }
    async likeUnLikeNugget(req, res){
        const userService = new UserService()
        const likeUnLikeNugget = await userService.likeUnLikeNugget(req)
        if(!likeUnLikeNugget.success){
            return BaseController.sendFailedResponse(res, likeUnLikeNugget.data)
        }
        return BaseController.sendSuccessResponse(res, likeUnLikeNugget.data)
    }
    async increaseNuggetDownloadCount(req, res){
        const userService = new UserService()
        const increaseNuggetDownloadCount = await userService.increaseNuggetDownloadCount(req)
        if(!increaseNuggetDownloadCount.success){
            return BaseController.sendFailedResponse(res, increaseNuggetDownloadCount.data)
        }
        return BaseController.sendSuccessResponse(res, increaseNuggetDownloadCount.data)
    }
    async increaseNuggetShareCount(req, res){
        const userService = new UserService()
        const increaseNuggetShareCount = await userService.increaseNuggetShareCount(req)
        if(!increaseNuggetShareCount.success){
            return BaseController.sendFailedResponse(res, increaseNuggetShareCount.data)
        }
        return BaseController.sendSuccessResponse(res, increaseNuggetShareCount.data)
    }
    async adminDashboardStat(req, res){
        const userService = new UserService()
        const adminDashboardStat = await userService.adminDashboardStat(req)
        if(!adminDashboardStat.success){
            return BaseController.sendFailedResponse(res, adminDashboardStat.data)
        }
        return BaseController.sendSuccessResponse(res, adminDashboardStat.data)
    }
    async applyCoachVerificationBadge(req, res){
        const userService = new UserService()
        const applyCoachVerificationBadge = await userService.applyCoachVerificationBadge(req)
        if(!applyCoachVerificationBadge.success){
            return BaseController.sendFailedResponse(res, applyCoachVerificationBadge.data)
        }
        return BaseController.sendSuccessResponse(res, applyCoachVerificationBadge.data)
    }
    async logUserWeight(req, res){
        const userService = new UserService()
        const logUserWeight = await userService.logUserWeight(req)
        if(!logUserWeight.success){
            return BaseController.sendFailedResponse(res, logUserWeight.data)
        }
        return BaseController.sendSuccessResponse(res, logUserWeight.data)
    }
    async getCoachApplications(req, res){
        const userService = new UserService()
        const getCoachApplications = await userService.getCoachApplications(req)
        if(!getCoachApplications.success){
            return BaseController.sendFailedResponse(res, getCoachApplications.data)
        }
        return BaseController.sendSuccessResponse(res, getCoachApplications.data)
    }
    async approveCoach(req, res){
        const userService = new UserService()
        const approveCoach = await userService.approveCoach(req)
        if(!approveCoach.success){
            return BaseController.sendFailedResponse(res, approveCoach.data)
        }
        return BaseController.sendSuccessResponse(res, approveCoach.data)
    }
    async rejectCoach(req, res){
        const userService = new UserService()
        const rejectCoach = await userService.rejectCoach(req)
        if(!rejectCoach.success){
            return BaseController.sendFailedResponse(res, rejectCoach.data)
        }
        return BaseController.sendSuccessResponse(res, rejectCoach.data)
    }
}

module.exports = UserController