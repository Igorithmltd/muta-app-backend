const ChallengeService = require("../services/challenge.service");
const  BaseController = require("./base");

class ChallengeController extends BaseController{
    async createChallenge(req, res){
        const challengeService = new ChallengeService()
        const createChallenge = await challengeService.createChallenge(req)
        if(!createChallenge.success){
            return BaseController.sendFailedResponse(res, createChallenge.data)
        }
        return BaseController.sendSuccessResponse(res, createChallenge.data)
    }
    async getChallenges(req, res){
        const challengeService = new ChallengeService()
        const getChallenges = await challengeService.getChallenges(req)
        if(!getChallenges.success){
            return BaseController.sendFailedResponse(res, getChallenges.data)
        }
        return BaseController.sendSuccessResponse(res, getChallenges.data)
    }
    async getChallenge(req, res){
        const challengeService = new ChallengeService()
        const getChallenge = await challengeService.getChallenge(req)
        if(!getChallenge.success){
            return BaseController.sendFailedResponse(res, getChallenge.data)
        }
        return BaseController.sendSuccessResponse(res, getChallenge.data)
    }
    async updateChallenge(req, res){
        const challengeService = new ChallengeService()
        const updateChallenge = await challengeService.updateChallenge(req)
        if(!updateChallenge.success){
            return BaseController.sendFailedResponse(res, updateChallenge.data)
        }
        return BaseController.sendSuccessResponse(res, updateChallenge.data)
    }
    async deleteChallenge(req, res){
        const challengeService = new ChallengeService()
        const deleteChallenge = await challengeService.deleteChallenge(req)
        if(!deleteChallenge.success){
            return BaseController.sendFailedResponse(res, deleteChallenge.data)
        }
        return BaseController.sendSuccessResponse(res, deleteChallenge.data)
    }
    async joinChallenge(req, res){
        const challengeService = new ChallengeService()
        const joinChallenge = await challengeService.joinChallenge(req)
        if(!joinChallenge.success){
            return BaseController.sendFailedResponse(res, joinChallenge.data)
        }
        return BaseController.sendSuccessResponse(res, joinChallenge.data)
    }
    async getChallengeAction(req, res){
        const challengeService = new ChallengeService()
        const getChallengeAction = await challengeService.getChallengeAction(req)
        if(!getChallengeAction.success){
            return BaseController.sendFailedResponse(res, getChallengeAction.data)
        }
        return BaseController.sendSuccessResponse(res, getChallengeAction.data)
    }
    async markChallengeTask(req, res){
        const challengeService = new ChallengeService()
        const markChallengeTask = await challengeService.markChallengeTask(req)
        if(!markChallengeTask.success){
            return BaseController.sendFailedResponse(res, markChallengeTask.data)
        }
        return BaseController.sendSuccessResponse(res, markChallengeTask.data)
    }
}

module.exports = ChallengeController