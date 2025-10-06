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
    async getUserWeightLoss(req, res){
        const userService = new UserService()
        const getUserWeightLoss = await userService.getUserWeightLoss(req)
        if(!getUserWeightLoss.success){
            return BaseController.sendFailedResponse(res, getUserWeightLoss.data)
        }
        return BaseController.sendSuccessResponse(res, getUserWeightLoss.data)
    }
    async logUserWeight(req, res){
        const userService = new UserService()
        const logUserWeight = await userService.logUserWeight(req)
        if(!logUserWeight.success){
            return BaseController.sendFailedResponse(res, logUserWeight.data)
        }
        return BaseController.sendSuccessResponse(res, logUserWeight.data)
    }
    async logUserHeight(req, res){
        const userService = new UserService()
        const logUserHeight = await userService.logUserHeight(req)
        if(!logUserHeight.success){
            return BaseController.sendFailedResponse(res, logUserHeight.data)
        }
        return BaseController.sendSuccessResponse(res, logUserHeight.data)
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
    async changePassword(req, res){
        const userService = new UserService()
        const changePassword = await userService.changePassword(req)
        if(!changePassword.success){
            return BaseController.sendFailedResponse(res, changePassword.data)
        }
        return BaseController.sendSuccessResponse(res, changePassword.data)
    }
    async getAllVerfiedCoach(req, res){
        const userService = new UserService()
        const getAllVerfiedCoach = await userService.getAllVerfiedCoach(req)
        if(!getAllVerfiedCoach.success){
            return BaseController.sendFailedResponse(res, getAllVerfiedCoach.data)
        }
        return BaseController.sendSuccessResponse(res, getAllVerfiedCoach.data)
    }
    async getCoachBySpecialty(req, res){
        const userService = new UserService()
        const getCoachBySpecialty = await userService.getCoachBySpecialty(req)
        if(!getCoachBySpecialty.success){
            return BaseController.sendFailedResponse(res, getCoachBySpecialty.data)
        }
        return BaseController.sendSuccessResponse(res, getCoachBySpecialty.data)
    }
    async subscribePlan(req, res){
        const userService = new UserService()
        const subscribePlan = await userService.subscribeUserToPlan(req)
        if(!subscribePlan.success){
            return BaseController.sendFailedResponse(res, subscribePlan.data)
        }
        return BaseController.sendSuccessResponse(res, subscribePlan.data)
    }
    async redeemCoupon(req, res){
        const userService = new UserService()
        const redeemCoupon = await userService.redeemCoupon(req)
        if(!redeemCoupon.success){
            return BaseController.sendFailedResponse(res, redeemCoupon.data)
        }
        return BaseController.sendSuccessResponse(res, redeemCoupon.data)
    }
    async createPlan(req, res){
        const userService = new UserService()
        const createPlan = await userService.createPlan(req)
        if(!createPlan.success){
            return BaseController.sendFailedResponse(res, createPlan.data)
        }
        return BaseController.sendSuccessResponse(res, createPlan.data)
    }
    async getPlans(req, res){
        const userService = new UserService()
        const getPlans = await userService.getPlans(req)
        if(!getPlans.success){
            return BaseController.sendFailedResponse(res, getPlans.data)
        }
        return BaseController.sendSuccessResponse(res, getPlans.data)
    }
    async getSubscriptionStatus(req, res){
        const userService = new UserService()
        const getSubscriptionStatus = await userService.getSubscriptionStatus(req)
        if(!getSubscriptionStatus.success){
            return BaseController.sendFailedResponse(res, getSubscriptionStatus.data)
        }
        return BaseController.sendSuccessResponse(res, getSubscriptionStatus.data)
    }
    async getPlan(req, res){
        const userService = new UserService()
        const getPlan = await userService.getPlan(req)
        if(!getPlan.success){
            return BaseController.sendFailedResponse(res, getPlan.data)
        }
        return BaseController.sendSuccessResponse(res, getPlan.data)
    }
    async updatePlan(req, res){
        const userService = new UserService()
        const updatePlan = await userService.updatePlan(req)
        if(!updatePlan.success){
            return BaseController.sendFailedResponse(res, updatePlan.data)
        }
        return BaseController.sendSuccessResponse(res, updatePlan.data)
    }
    async deletePlan(req, res){
        const userService = new UserService()
        const deletePlan = await userService.deletePlan(req)
        if(!deletePlan.success){
            return BaseController.sendFailedResponse(res, deletePlan.data)
        }
        return BaseController.sendSuccessResponse(res, deletePlan.data)
    }
    async getWeightImprovementTips(req, res){
        const userService = new UserService()
        const getWeightImprovementTips = await userService.getWeightImprovementTips(req)
        if(!getWeightImprovementTips.success){
            return BaseController.sendFailedResponse(res, getWeightImprovementTips.data)
        }
        return BaseController.sendSuccessResponse(res, getWeightImprovementTips.data)
    }
    async logSleep(req, res){
        const userService = new UserService()
        const logSleep = await userService.logSleep(req)
        if(!logSleep.success){
            return BaseController.sendFailedResponse(res, logSleep.data)
        }
        return BaseController.sendSuccessResponse(res, logSleep.data)
    }
    async logWater(req, res){
        const userService = new UserService()
        const logWater = await userService.logWater(req)
        if(!logWater.success){
            return BaseController.sendFailedResponse(res, logWater.data)
        }
        return BaseController.sendSuccessResponse(res, logWater.data)
    }
    async getSleepLog(req, res){
        const userService = new UserService()
        const getSleepLog = await userService.getSleepLog(req)
        if(!getSleepLog.success){
            return BaseController.sendFailedResponse(res, getSleepLog.data)
        }
        return BaseController.sendSuccessResponse(res, getSleepLog.data)
    }
    async getWaterLog(req, res){
        const userService = new UserService()
        const getWaterLog = await userService.getWaterLog(req)
        if(!getWaterLog.success){
            return BaseController.sendFailedResponse(res, getWaterLog.data)
        }
        return BaseController.sendSuccessResponse(res, getWaterLog.data)
    }
    async getNotifications(req, res){
        const userService = new UserService()
        const getNotifications = await userService.getNotifications(req)
        if(!getNotifications.success){
            return BaseController.sendFailedResponse(res, getNotifications.data)
        }
        return BaseController.sendSuccessResponse(res, getNotifications.data)
    }
    async broadcastNotification(req, res){
        const userService = new UserService()
        const broadcastNotification = await userService.broadcastNotification(req)
        if(!broadcastNotification.success){
            return BaseController.sendFailedResponse(res, broadcastNotification.data)
        }
        return BaseController.sendSuccessResponse(res, broadcastNotification.data)
    }
    async markNotificationAsRead(req, res){
        const userService = new UserService()
        const markNotificationAsRead = await userService.markNotificationAsRead(req)
        if(!markNotificationAsRead.success){
            return BaseController.sendFailedResponse(res, markNotificationAsRead.data)
        }
        return BaseController.sendSuccessResponse(res, markNotificationAsRead.data)
    }
    async markAllNotificationsAsRead(req, res){
        const userService = new UserService()
        const markAllNotificationsAsRead = await userService.markAllNotificationsAsRead(req)
        if(!markAllNotificationsAsRead.success){
            return BaseController.sendFailedResponse(res, markAllNotificationsAsRead.data)
        }
        return BaseController.sendSuccessResponse(res, markAllNotificationsAsRead.data)
    }
    async deleteNotifications(req, res){
        const userService = new UserService()
        const deleteNotifications = await userService.deleteNotifications(req)
        if(!deleteNotifications.success){
            return BaseController.sendFailedResponse(res, deleteNotifications.data)
        }
        return BaseController.sendSuccessResponse(res, deleteNotifications.data)
    }
    async deleteAllNotifications(req, res){
        const userService = new UserService()
        const deleteAllNotifications = await userService.deleteAllNotifications(req)
        if(!deleteAllNotifications.success){
            return BaseController.sendFailedResponse(res, deleteAllNotifications.data)
        }
        return BaseController.sendSuccessResponse(res, deleteAllNotifications.data)
    }
    
    async updateDeviceToken(req, res){
        const userService = new UserService()
        const updateDeviceToken = await userService.updateDeviceToken(req)
        if(!updateDeviceToken.success){
            return BaseController.sendFailedResponse(res, updateDeviceToken.data)
        }
        return BaseController.sendSuccessResponse(res, updateDeviceToken.data)
    }
}

module.exports = UserController