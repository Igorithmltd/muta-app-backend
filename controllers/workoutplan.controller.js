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
}

module.exports = WorkoutplanController