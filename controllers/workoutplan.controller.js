const WorkoutplanService = require("../services/workoutplan.service");
const  BaseController = require("./base");

class WorkoutplanController extends BaseController{
    async createWorkoutplan(req, res){
        const workoutplanService = new WorkoutplanService()
        const createWorkoutPlan = await workoutplanService.createWorkoutplan(req)
        if(!createWorkoutPlan.success){
            return BaseController.sendFailedResponse(res, createWorkoutPlan.data)
        }
        return BaseController.sendSuccessResponse(res, createWorkoutPlan.data)
    }
    async getWorkoutPlans(req, res){
        const workoutplanService = new WorkoutplanService()
        const getWorkoutPlans = await workoutplanService.getWorkoutplans(req)
        if(!getWorkoutPlans.success){
            return BaseController.sendFailedResponse(res, getWorkoutPlans.data)
        }
        return BaseController.sendSuccessResponse(res, getWorkoutPlans.data)
    }
    async getWorkoutPlan(req, res){
        const workoutplanService = new WorkoutplanService()
        const getWorkoutPlan = await workoutplanService.getWorkoutplan(req)
        if(!getWorkoutPlan.success){
            return BaseController.sendFailedResponse(res, getWorkoutPlan.data)
        }
        return BaseController.sendSuccessResponse(res, getWorkoutPlan.data)
    }
    async updateWorkoutPlan(req, res){
        const workoutplanService = new WorkoutplanService()
        const updateWorkoutPlan = await workoutplanService.updateWorkoutplan(req)
        if(!updateWorkoutPlan.success){
            return BaseController.sendFailedResponse(res, updateWorkoutPlan.data)
        }
        return BaseController.sendSuccessResponse(res, updateWorkoutPlan.data)
    }
    async deleteWorkoutPlan(req, res){
        const workoutplanService = new WorkoutplanService()
        const deleteWorkoutPlan = await workoutplanService.deleteWorkoutplan(req)
        if(!deleteWorkoutPlan.success){
            return BaseController.sendFailedResponse(res, deleteWorkoutPlan.data)
        }
        return BaseController.sendSuccessResponse(res, deleteWorkoutPlan.data)
    }
    async joinWorkoutPlan(req, res){
        const workoutplanService = new WorkoutplanService()
        const joinWorkoutPlan = await workoutplanService.joinWorkoutplan(req)
        if(!joinWorkoutPlan.success){
            return BaseController.sendFailedResponse(res, joinWorkoutPlan.data)
        }
        return BaseController.sendSuccessResponse(res, joinWorkoutPlan.data)
    }
    async getWorkoutPlanAction(req, res){
        const workoutplanService = new WorkoutplanService()
        const getWorkoutPlanAction = await workoutplanService.getWorkoutplanAction(req)
        if(!getWorkoutPlanAction.success){
            return BaseController.sendFailedResponse(res, getWorkoutPlanAction.data)
        }
        return BaseController.sendSuccessResponse(res, getWorkoutPlanAction.data)
    }
    async markWorkoutPlanTask(req, res){
        const workoutplanService = new WorkoutplanService()
        const markWorkoutPlanTask = await workoutplanService.markWorkoutplanTask(req)
        if(!markWorkoutPlanTask.success){
            return BaseController.sendFailedResponse(res, markWorkoutPlanTask.data)
        }
        return BaseController.sendSuccessResponse(res, markWorkoutPlanTask.data)
    }
    async resetWorkoutplanAction(req, res){
        const workoutplanService = new WorkoutplanService()
        const resetWorkoutplanAction = await workoutplanService.resetWorkoutplanAction(req)
        if(!resetWorkoutplanAction.success){
            return BaseController.sendFailedResponse(res, resetWorkoutplanAction.data)
        }
        return BaseController.sendSuccessResponse(res, resetWorkoutplanAction.data)
    }
    async recommendedWorkoutplans(req, res){
        const workoutplanService = new WorkoutplanService()
        const recommendedWorkoutplans = await workoutplanService.recommendedWorkoutplans(req)
        if(!recommendedWorkoutplans.success){
            return BaseController.sendFailedResponse(res, recommendedWorkoutplans.data)
        }
        return BaseController.sendSuccessResponse(res, recommendedWorkoutplans.data)
    }
    async activeWorkoutplans(req, res){
        const workoutplanService = new WorkoutplanService()
        const activeWorkoutplans = await workoutplanService.activeWorkoutplans(req)
        if(!activeWorkoutplans.success){
            return BaseController.sendFailedResponse(res, activeWorkoutplans.data)
        }
        return BaseController.sendSuccessResponse(res, activeWorkoutplans.data)
    }
    async getCompletedWorkoutPlans(req, res){
        const workoutplanService = new WorkoutplanService()
        const getCompletedWorkoutPlanss = await workoutplanService.getCompletedWorkoutPlans(req)
        if(!getCompletedWorkoutPlanss.success){
            return BaseController.sendFailedResponse(res, getCompletedWorkoutPlanss.data)
        }
        return BaseController.sendSuccessResponse(res, getCompletedWorkoutPlanss.data)
    }
    async popularWorkoutPlans(req, res){
        const workoutplanService = new WorkoutplanService()
        const popularWorkoutPlans = await workoutplanService.popularWorkoutPlans(req)
        if(!popularWorkoutPlans.success){
            return BaseController.sendFailedResponse(res, popularWorkoutPlans.data)
        }
        return BaseController.sendSuccessResponse(res, popularWorkoutPlans.data)
    }
    async rateWorkoutplan(req, res){
        const workoutplanService = new WorkoutplanService()
        const rateWorkoutplan = await workoutplanService.rateWorkoutplan(req)
        if(!rateWorkoutplan.success){
            return BaseController.sendFailedResponse(res, rateWorkoutplan.data)
        }
        return BaseController.sendSuccessResponse(res, rateWorkoutplan.data)
    }
    async getWorkoutplanByCategory(req, res){
        const workoutplanService = new WorkoutplanService()
        const getWorkoutplanByCategory = await workoutplanService.getWorkoutplanByCategory(req)
        if(!getWorkoutplanByCategory.success){
            return BaseController.sendFailedResponse(res, getWorkoutplanByCategory.data)
        }
        return BaseController.sendSuccessResponse(res, getWorkoutplanByCategory.data)
    }
    async searchWorkoutplanByTitle(req, res){
        const workoutplanService = new WorkoutplanService()
        const searchWorkoutplanByTitle = await workoutplanService.searchWorkoutplanByTitle(req)
        if(!searchWorkoutplanByTitle.success){
            return BaseController.sendFailedResponse(res, searchWorkoutplanByTitle.data)
        }
        return BaseController.sendSuccessResponse(res, searchWorkoutplanByTitle.data)
    }
}

module.exports = WorkoutplanController