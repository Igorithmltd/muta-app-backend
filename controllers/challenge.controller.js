const UtilService = require("../services/util.service");
const { sendMail } = require("../util/emailService");
const  BaseController = require("./base");

class ChallengeController extends BaseController{
    async createChallenge(req, res){
        const utilService = new UtilService()
        const multipleFileUpload = await utilService.createChallenge(req)
        if(!multipleFileUpload.success){
            return BaseController.sendFailedResponse(res, multipleFileUpload.data)
        }
        return BaseController.sendSuccessResponse(res, multipleFileUpload.data)
    }
}

module.exports = ChallengeController