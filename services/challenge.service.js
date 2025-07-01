const ChallengeModel = require("../models/challenge.model");
const { empty } = require("../util");
const validateData = require("../util/validate");
const BaseService = require("./base");

class ChallengeService extends BaseService {
  async createChallenge(req) {
    try {
      const post = req.body;

      const validateRule = {
        title: "string|required",
        goal: "string|required",
        duration: "integer|required",
        type: "string|required|in:daily,weekly",
        difficulty: "string|required|in:begineer,intermediate,advanced",
        tasks: "array|required",
        "tasks.*.buttonLabel": "string|required",
        "tasks.*.title": "string|required",
        image: "object|required",
        "image.imageUrl": "string|required",
        "image.publicId": "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "email.email": "Please provide a valid :attribute.",
        in: "Please provide a valid :attribute.",
        array: ":attribute must be an array.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      // Check if the challenge already exists
      const existingChallenge = await ChallengeModel.findOne({
        title: post.title,
      });
      if (existingChallenge) {
        return BaseService.sendFailedResponse({
          error: "Challenge with this title already exists",
        });
      }
      // Create a new challenge
      const challenge = new ChallengeModel({
        title: post.title,
        goal: post.goal,
        duration: post.duration,
        durationUnit: post.durationUnit || "minute",
        type: post.type,
        difficulty: post.difficulty,
        tasks: post.tasks,
        image: {
          imageUrl: post.image.imageUrl,
          publicId: post.image.publicId,
        },
      });
      // Save the challenge to the database
      const savedChallenge = await challenge.save();

      return BaseService.sendSuccessResponse({
        message: "Challenge created successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getChallenges(req) {
    try {
      const type = req.query.type || "";
      const filter = type ? { type } : {};

      const challenges = await ChallengeModel.find(filter).sort({
        createdAt: -1,
      });
      return BaseService.sendSuccessResponse({ message: challenges });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getChallenge(req) {
    try {
      const challengeId = req.params.id;

      const challenge = await ChallengeModel.findById(challengeId);
      if (!challenge) {
        return BaseService.sendFailedResponse({
          error: "Challenge not found",
        });
      }

      return BaseService.sendSuccessResponse({ message: challenge });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async updateChallenge(req) {
    try {
      const challengeId = req.params.id;

      const challenge = await ChallengeModel.findById(challengeId);
      if (!challenge) {
        return BaseService.sendFailedResponse({
          error: "Challenge not found",
        });
      }

      const challengeExists = await ChallengeModel.findOne({
        title: req.body.title,
        _id: { $ne: challengeId }, // Exclude the current challenge
      });
      if (challengeExists) {
        return BaseService.sendFailedResponse({
          error: "Challenge with this title already exists",
        });
      }

      const updatedChallenge = await ChallengeModel.findByIdAndUpdate(
        challengeId,
        {
          $set: {
            title: req.body.title || challenge.title,
            goal: req.body.goal || challenge.goal,
            duration: req.body.duration || challenge.duration,
            durationUnit: req.body.durationUnit || challenge.durationUnit,
            type: req.body.type || challenge.type,
            difficulty: req.body.difficulty || challenge.difficulty,
            tasks: req.body.tasks || challenge.tasks,
            image: {
              imageUrl: req.body.image.imageUrl || challenge.image.imageUrl,
              publicId: req.body.image.publicId || challenge.image.publicId,
            },
          },
        },
        { new: true }
      );
      if (!updatedChallenge) {
        return BaseService.sendFailedResponse({
          error: "Failed to update challenge",
        });
      }
      return BaseService.sendSuccessResponse({
        message: "Challenge updated successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async deleteChallenge(req) {
    try {
      const challengeId = req.params.id;

      const challenge = await ChallengeModel.findById(challengeId);
      if (!challenge) {
        return BaseService.sendFailedResponse({
          error: "Challenge not found",
        });
      }

      const deleteChallenge = await ChallengeModel.findByIdAndDelete(
        challengeId
      );
      return BaseService.sendSuccessResponse({
        message: "Challenge deleted successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
}

module.exports = ChallengeService;
