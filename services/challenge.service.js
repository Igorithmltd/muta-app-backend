const ChallengeModel = require("../models/challenge.model");
const ChallengeActionModel = require("../models/challengeAction.model");
const UserModel = require("../models/user.model");
const { empty } = require("../util");
const { getCurrentWeekNumber } = require("../util/helper");
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
        console.log({ endDate });
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
      tasks: challenge.tasks,
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

    // Load challenge
    const challenge = await ChallengeModel.findById(post.challengeId);
    if (!challenge) {
      return BaseService.sendFailedResponse({
        error: "Challenge not found",
      });
    }

    // Load user's challenge action
    const challengeAction = await ChallengeActionModel.findOne({
      userId,
      challengeId: post.challengeId,
    }).populate("challengeId");

    if (!challengeAction) {
      return BaseService.sendFailedResponse({
        error: "You have not joined this challenge",
      });
    }

    // Find the task to mark
    const challengeTask = challengeAction.tasks.find(
      (task) => task._id.toString() === post.challengeTaskId
    );

    if (!challengeTask) {
      return BaseService.sendFailedResponse({
        error: "Challenge task not found",
      });
    }

    // If challenge already completed, return
    if (challengeAction.status === "completed") {
      return BaseService.sendSuccessResponse({
        message: "You have already completed this challenge",
      });
    }

    // If task already completed, return
    if (challengeTask.status === "completed") {
      return BaseService.sendSuccessResponse({
        message: "You have already completed this task",
      });
    }

    // Mark the task as completed
    challengeTask.status = "completed";

    // Check if all tasks are now completed
    const allTasksCompleted = challengeAction.tasks.every(
      (task) => task.status === "completed"
    );

    // If all tasks completed, mark challenge action as completed
    if (allTasksCompleted) {
      challengeAction.status = "completed";
      // You may want to increment streak here, but we'll handle that in user streak logic below
    }

    await challengeAction.save();

    // Now update/reset user streaks based on challenge type and completion status
    const user = await UserModel.findById(userId);
    if (!user) {
      return BaseService.sendFailedResponse({ error: "User not found" });
    }

    const todayStr = new Date().toDateString();
    const currentWeek = getCurrentWeekNumber();

    if (challenge.type === "daily") {
      // If user missed any task for today, reset streak; else increment if first completion today
      const missedTask = challengeAction.tasks.some(
        (task) => task.status !== "completed"
      );

      if (missedTask) {
        user.dailyStreak = 0;
        user.lastDailyStreakDate = null;
      } else {
        if (
          !user.lastDailyStreakDate ||
          new Date(user.lastDailyStreakDate).toDateString() !== todayStr
        ) {
          user.dailyStreak = (user.dailyStreak || 0) + 1;
          user.lastDailyStreakDate = new Date();
        }
      }
    }

    if (challenge.type === "weekly") {
      // Fetch all daily challenges for this user in current week
      const dailyChallengesThisWeek = await this.getUserDailyChallengesForWeek(
        userId,
        currentWeek
      );

      // Check if any daily challenge has incomplete tasks
      const missedDayExists = dailyChallengesThisWeek.some((dc) =>
        dc.tasks.some((task) => task.status !== "completed")
      );

      if (missedDayExists) {
        // Reset weekly streak
        user.weeklyStreak = 0;
        user.lastWeeklyStreakWeek = null;
      } else {
        // All daily challenges complete for the week, increment streak if not done this week
        if (user.lastWeeklyStreakWeek !== currentWeek) {
          user.weeklyStreak = (user.weeklyStreak || 0) + 1;
          user.lastWeeklyStreakWeek = currentWeek;
        }
      }
    }

    await user.save();

    return BaseService.sendSuccessResponse({
      message: "Task marked as completed",
    });
  }
  async getChallengeAction(req) {
    try {
      const challengeId = req.params.id;
    const userId = req.user.id;

    // Find the challenge action with populated challenge details
    const challengeAction = await ChallengeActionModel.findOne({
      challengeId,
      userId,
    }).populate("challengeId");

    if (!challengeAction) {
      return BaseService.sendFailedResponse({
        error: "Challenge action not found",
      });
    }

    // Fetch the user to get streak counts
    const user = await UserModel.findById(userId);

    if (!user) {
      return BaseService.sendFailedResponse({
        error: "User not found",
      });
    }

    // Prepare response with streak info added
    const responseData = {
      challengeAction,
      dailyStreak: user.dailyStreak || 0,
      weeklyStreak: user.weeklyStreak || 0,
    };

    return BaseService.sendSuccessResponse({ message: responseData });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getDailyChallenge(req) {
    try {
      const userId = req.user.id;

    const dailyChallenge = await ChallengeModel.findOne({
      type: "daily",
    }).sort({ _id: -1 });

    if (!dailyChallenge) {
      return BaseService.sendFailedResponse({
        error: "Challenge not found",
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return BaseService.sendFailedResponse({
        error: "User not found",
      });
    }

    return BaseService.sendSuccessResponse({
      message: {
        dailyChallenge,
        dailyStreak: user.dailyStreak || 0,
        weeklyStreak: user.weeklyStreak || 0,
      },
    });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getWeeklyChallenge(req) {
    try {
      const userId = req.user.id;

    const weeklyChallenge = await ChallengeModel.findOne({
      type: "weekly",
    }).sort({ _id: -1 });

    if (!weeklyChallenge) {
      return BaseService.sendFailedResponse({
        error: "Challenge not found",
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return BaseService.sendFailedResponse({
        error: "User not found",
      });
    }

    return BaseService.sendSuccessResponse({
      message: {
        weeklyChallenge,
        dailyStreak: user.dailyStreak || 0,
        weeklyStreak: user.weeklyStreak || 0,
      },
    });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async resetChallengeAction(req) {
    try {
      const userId = req.user.id;
      const { challengeId } = req.body;

      // Validate input
      const validateRule = {
        challengeId: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
      };

      const validateResult = validateData(
        { challengeId },
        validateRule,
        validateMessage
      );

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      // Fetch the diet action
      const challengeAction = await ChallengeActionModel.findOne({
        userId,
        challengeId,
      });

      if (!challengeAction) {
        return BaseService.sendFailedResponse({
          error: "You have not joined this challenge",
        });
      }

      // Reset progress, status, and all daily task statuses
      // challengeAction.streak = 0;
      challengeAction.status = "in-progress";

      challengeAction.tasks = challengeAction.tasks.map((task) => ({
        ...task.toObject(),
        status: "in-progress",
      }));

      await challengeAction.save();

      return BaseService.sendSuccessResponse({
        message: "Challenge progress reset successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }

  async getUserDailyChallengesForWeek(userId, weekNumber) {
    const dailyChallengeActions = await ChallengeActionModel.find({
      userId,
    }).populate("challengeId");
  
    return dailyChallengeActions.filter(ca => {
      if (!ca.challengeId) return false;
      if (ca.challengeId.type !== "daily") return false;
  
      const startWeek = getCurrentWeekNumber(ca.challengeId.startDate);
      const endWeek = getCurrentWeekNumber(ca.challengeId.endDate || ca.challengeId.startDate);
  
      return weekNumber >= startWeek && weekNumber <= endWeek;
    });
  }
}

module.exports = ChallengeService;
