const AdminService = require("../services/admin.service");
const  BaseController = require("./base");

class AdminController extends BaseController{
    async getAllUsers(req, res){
        const adminService = new AdminService()
        const getAllUsers = await adminService.getAllUsers(req)
        if(!getAllUsers.success){
            return BaseController.sendFailedResponse(res, getAllUsers.data)
        }
        return BaseController.sendSuccessResponse(res, getAllUsers.data)
    }
    async getSavings(req, res){
        const adminService = new AdminService()
        const getSavings = await adminService.getSavings(req)
        if(!getSavings.success){
            return BaseController.sendFailedResponse(res, getSavings.data)
        }
        return BaseController.sendSuccessResponse(res, getSavings.data)
    }
    async dashboardStat(req, res){
        const adminService = new AdminService()
        const dashboardStat = await adminService.dashboardStat(req)
        if(!dashboardStat.success){
            return BaseController.sendFailedResponse(res, dashboardStat.data)
        }
        return BaseController.sendSuccessResponse(res, dashboardStat.data)
    }
    // async loginUser(req, res){
    //     const adminService = new AdminService()
    //     const loginUser = await adminService.loginUser(req, res)
        // if(!loginUser.success){
        //     return BaseController.sendFailedResponse(res, loginUser.data)
        // }
        // return BaseController.sendSuccessResponse(res, loginUser.data)
    // }
    // async getUser(req, res){
    //     const adminService = new AdminService()
    //     const getUser = await adminService.getUser(req, res)
    //     if(!getUser.success){
    //         return BaseController.sendFailedResponse(res, getUser.data)
    //     }
    //     return BaseController.sendSuccessResponse(res, getUser.data)
    // }
    // async refreshToken(req, res){
    //     const adminService = new AdminService()
    //     const refreshToken = await adminService.refreshToken(req, res)
    //     if(!refreshToken.success){
    //         return BaseController.sendFailedResponse(res, refreshToken.data)
    //     }
    //     return BaseController.sendSuccessResponse(res, refreshToken.data)
    // }
}

module.exports = AdminController