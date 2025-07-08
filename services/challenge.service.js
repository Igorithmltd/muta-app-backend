const ChallengeModel = require("../models/challenge.model");
const ChallengeActionModel = require("../models/challengeAction.model");
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
        "in.difficulty": "Please provide a valid :attribute level.",
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

      const newChallenge = {
        title: post.title,
        goal: post.goal,
        duration: post.duration,
        type: post.type,
        difficulty: post.difficulty,
        tasks: post.tasks,
        image: {
          imageUrl: post.image.imageUrl,
          publicId: post.image.publicId,
        },
      };

      if (post.type == "weekly" && post.end_date) {
        const today = new Date();
        const daysToAdd = 6;

        const endDate = new Date(today);
        endDate.setDate(today.getDate() + daysToAdd);
        console.log({endDate})
        newChallenge.endDate = endDate;
      }
      // return console.log('newChallenge')

      // Create a new challenge
      const challenge = new ChallengeModel(newChallenge);
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
  async joinChallenge(req) {
    const userId = req.user.id;
    const post = req.body;

    const validateRule = {
      challengeId: "string|required",
    };

    const validateMessage = {
      required: ":attribute is required",
    };

    const validateResult = validateData(post, validateRule, validateMessage);

    if (!validateResult.success) {
      return BaseService.sendFailedResponse({ error: validateResult.data });
    }

    const challenge = await ChallengeModel.findById(post.challengeId);
    if (!challenge) {
      return BaseService.sendFailedResponse({
        error: "Challenge not found",
      });
    }

    const joinedChallenge = await ChallengeActionModel.findOne({
      userId,
      challengeId: post.challengeId,
    });
    if (joinedChallenge) {
      return BaseService.sendSuccessResponse({
        message: "You have already joined this challenge",
      });
    }

    const newUserChallenge = new ChallengeActionModel({
      userId,
      challengeId: post.challengeId,
      tasks: challenge.tasks
    });

    (await newUserChallenge.save()).populate("challengeId");

    return BaseService.sendSuccessResponse({
      message: "Challenge joined successfully",
      challenge: newUserChallenge,
    });
  }
  async markChallengeTask(req) {
    const userId = req.user.id;
    const post = req.body;

    const validateRule = {
      challengeTaskId: "string|required",
      challengeId: "string|required",
    };

    const validateMessage = {
      required: ":attribute is required",
    };

    const validateResult = validateData(post, validateRule, validateMessage);

    if (!validateResult.success) {
      return BaseService.sendFailedResponse({ error: validateResult.data });
    }

    const challenge = await ChallengeModel.findById(post.challengeId);
    if (!challenge) {
      return BaseService.sendFailedResponse({
        error: "Challenge not found",
      });
    }
    const challengeAction = await ChallengeActionModel.findOne({
      userId,
      challengeId: post.challengeId,
    }).populate("challengeId");

    if (!challengeAction) {
      return BaseService.sendFailedResponse({
        error: "You have not joined this challenge",
      });
    }

    const challengeTask = challengeAction.tasks.find(
      (task) => task._id.toString() === post.challengeTaskId
    );

    if (!challengeTask) {
      return BaseService.sendFailedResponse({
        error: "Challenge task not found",
      });
    }
 
    if (challengeAction.status === "completed") {
      return BaseService.sendSuccessResponse({
        message: "You have already completed this challenge",
      });
    }
    if (challengeTask.status === "completed") {
      return BaseService.sendSuccessResponse({
        message: "You have already completed this task",
      });
    }
    // if (challengeAction.streak >= challengeAction.tasks.length) {
    //   return BaseService.sendSuccessResponse({
    //     message: "You are all done",
    //   });
    // }
    challengeAction.streak += 1;
    challengeTask.status = "completed";
    if (challengeAction.streak >= challengeAction.tasks.length) {
      challengeAction.status = "completed";
    }
    await challengeAction.save();

    return BaseService.sendSuccessResponse({
      message: "Task marked as completed"
    });
  }

  async getChallengeAction(req) {
    try {
      const challengeId = req.params.id;
      const userId = req.user.id

      const challengeAction = await ChallengeActionModel.findOne({challengeId: challengeId, userId: userId}).populate("challengeId");
      if (!challengeAction) {
        return BaseService.sendFailedResponse({
          error: "Challenge action not found",
        });
      }

      return BaseService.sendSuccessResponse({ message: challengeAction });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getDailyChallenge(req) {
    try {
      const dailyChallenge = await ChallengeModel.findOne({ type: 'daily' }).sort({ _id: -1 });
      if (!dailyChallenge) {
        return BaseService.sendFailedResponse({
          error: "Challenge not found",
        });
      }

      return BaseService.sendSuccessResponse({ message: dailyChallenge });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getWeeklyChallenge(req) {
    try {
      const weeklyChallenge = await ChallengeModel.findOne({ type: 'weekly' }).sort({ _id: -1 });
      if (!weeklyChallenge) {
        return BaseService.sendFailedResponse({
          error: "Challenge not found",
        });
      }
      console.log(weeklyChallenge, "weeklyChallenge")
      return BaseService.sendSuccessResponse({ message: weeklyChallenge });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
}

module.exports = ChallengeService;
