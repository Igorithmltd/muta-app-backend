const { empty } = require("../util");
const BaseService = require("./base");

class ChallengeService extends BaseService {
  async createChallenge(req) {
    try {
        const post = req.body;

        const validateRule = {
          email: "email|required",
          password: "string|required",
          userType: "string|required"
        };
  
        const validateMessage = {
          required: ":attribute is required",
          "email.email": "Please provide a valid :attribute.",
        };
  
        const validateResult = validateData(post, validateRule, validateMessage);
  
        if (!validateResult.success) {
          return BaseService.sendFailedResponse({ error: validateResult.data });
        }

      return BaseService.sendSuccessResponse({ message: image });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
}

module.exports = ChallengeService;
