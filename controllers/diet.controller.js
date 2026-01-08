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
    async joinDiet(req, res){
        const dietService = new DietService()
        const joinDiet = await dietService.joinDiet(req)
        if(!joinDiet.success){
            return BaseController.sendFailedResponse(res, joinDiet.data)
        }
        return BaseController.sendSuccessResponse(res, joinDiet.data)
    }
    async markDietTask(req, res){
        const dietService = new DietService()
        const markDietTask = await dietService.markDietTask(req)
        if(!markDietTask.success){
            return BaseController.sendFailedResponse(res, markDietTask.data)
        }
        return BaseController.sendSuccessResponse(res, markDietTask.data)
    }
    async getDietAction(req, res){
        const dietService = new DietService()
        const getDietAction = await dietService.getDietAction(req)
        if(!getDietAction.success){
            return BaseController.sendFailedResponse(res, getDietAction.data)
        }
        return BaseController.sendSuccessResponse(res, getDietAction.data)
    }
    async resetDietAction(req, res){
        const dietService = new DietService()
        const resetDietAction = await dietService.resetDietAction(req)
        if(!resetDietAction.success){
            return BaseController.sendFailedResponse(res, resetDietAction.data)
        }
        return BaseController.sendSuccessResponse(res, resetDietAction.data)
    }
    async recommendedDiets(req, res){
        const dietService = new DietService()
        const recommendedDiets = await dietService.recommendedDiets(req)
        if(!recommendedDiets.success){
            return BaseController.sendFailedResponse(res, recommendedDiets.data)
        }
        return BaseController.sendSuccessResponse(res, recommendedDiets.data)
    }
    async popularDietPlans(req, res){
        const dietService = new DietService()
        const popularDietPlans = await dietService.popularDietPlans(req)
        if(!popularDietPlans.success){
            return BaseController.sendFailedResponse(res, popularDietPlans.data)
        }
        return BaseController.sendSuccessResponse(res, popularDietPlans.data)
    }
    async activeDiets(req, res){
        const dietService = new DietService()
        const activeDiets = await dietService.activeDiets(req)
        if(!activeDiets.success){
            return BaseController.sendFailedResponse(res, activeDiets.data)
        }
        return BaseController.sendSuccessResponse(res, activeDiets.data)
    }
    async getDietCategories(req, res){
        const dietService = new DietService()
        const getDietCategories = await dietService.getDietCategories(req)
        if(!getDietCategories.success){
            return BaseController.sendFailedResponse(res, getDietCategories.data)
        }
        return BaseController.sendSuccessResponse(res, getDietCategories.data)
    }
    async searchDietByTitle(req, res){
        const dietService = new DietService()
        const searchDietByTitle = await dietService.searchDietByTitle(req)
        if(!searchDietByTitle.success){
            return BaseController.sendFailedResponse(res, searchDietByTitle.data)
        }
        return BaseController.sendSuccessResponse(res, searchDietByTitle.data)
    }
    async getDietByCategory(req, res){
        const dietService = new DietService()
        const getDietByCategory = await dietService.getDietByCategory(req)
        if(!getDietByCategory.success){
            return BaseController.sendFailedResponse(res, getDietByCategory.data)
        }
        return BaseController.sendSuccessResponse(res, getDietByCategory.data)
    }
    async getCompletedPlans(req, res){
        const dietService = new DietService()
        const getCompletedPlans = await dietService.getCompletedPlans(req)
        if(!getCompletedPlans.success){
            return BaseController.sendFailedResponse(res, getCompletedPlans.data)
        }
        return BaseController.sendSuccessResponse(res, getCompletedPlans.data)
    }
    async getTotalCompletedPlans(req, res){
        const dietService = new DietService()
        const getTotalCompletedPlans = await dietService.getTotalCompletedPlans(req)
        if(!getTotalCompletedPlans.success){
            return BaseController.sendFailedResponse(res, getTotalCompletedPlans.data)
        }
        return BaseController.sendSuccessResponse(res, getTotalCompletedPlans.data)
    }
    async getDietMeals(req, res){
        const dietService = new DietService()
        const getDietMeals = await dietService.getDietMeals(req)
        if(!getDietMeals.success){
            return BaseController.sendFailedResponse(res, getDietMeals.data)
        }
        return BaseController.sendSuccessResponse(res, getDietMeals.data)
    }
    async rateDietPlan(req, res){
        const dietService = new DietService()
        const rateDietPlan = await dietService.rateDietPlan(req)
        if(!rateDietPlan.success){
            return BaseController.sendFailedResponse(res, rateDietPlan.data)
        }
        return BaseController.sendSuccessResponse(res, rateDietPlan.data)
    }
    async getCoachRecommendDiet(req, res){
        const dietService = new DietService()
        const getCoachRecommendDiet = await dietService.getCoachRecommendDiet(req)
        if(!getCoachRecommendDiet.success){
            return BaseController.sendFailedResponse(res, getCoachRecommendDiet.data)
        }
        return BaseController.sendSuccessResponse(res, getCoachRecommendDiet.data)
    }
    async coachRecommendDiet(req, res){
        const dietService = new DietService()
        const coachRecommendDiet = await dietService.coachRecommendDiet(req)
        if(!coachRecommendDiet.success){
            return BaseController.sendFailedResponse(res, coachRecommendDiet.data)
        }
        return BaseController.sendSuccessResponse(res, coachRecommendDiet.data)
    }
}

module.exports = DietController;