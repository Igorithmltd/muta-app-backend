const DietService = require("../services/diet.service");
const BaseController = require("./base");


class DietController extends BaseController {
    async createDiet(req, res){
        const dietService = new DietService()
        const createDiet = await dietService.createDiet(req)
        if(!createDiet.success){
            return BaseController.sendFailedResponse(res, createDiet.data)
        }
        return BaseController.sendSuccessResponse(res, createDiet.data)
    }
    async getAllDiets(req, res){
        const dietService = new DietService()
        const getAllDiets = await dietService.getAllDiets(req)
        if(!getAllDiets.success){
            return BaseController.sendFailedResponse(res, getAllDiets.data)
        }
        return BaseController.sendSuccessResponse(res, getAllDiets.data)
    }
    async getDiet(req, res){
        const dietService = new DietService()
        const getDiet = await dietService.getDiet(req)
        if(!getDiet.success){
            return BaseController.sendFailedResponse(res, getDiet.data)
        }
        return BaseController.sendSuccessResponse(res, getDiet.data)
    }
    async updateDiet(req, res){
        const dietService = new DietService()
        const updateDiet = await dietService.updateDiet(req)
        if(!updateDiet.success){
            return BaseController.sendFailedResponse(res, updateDiet.data)
        }
        return BaseController.sendSuccessResponse(res, updateDiet.data)
    }
    async deleteDiet(req, res){
        const dietService = new DietService()
        const deleteDiet = await dietService.deleteDiet(req)
        if(!deleteDiet.success){
            return BaseController.sendFailedResponse(res, deleteDiet.data)
        }
        return BaseController.sendSuccessResponse(res, deleteDiet.data)
    }
}

module.exports = DietController;