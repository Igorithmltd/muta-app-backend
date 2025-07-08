const ChallengeModel = require("../models/challenge.model");
const ChallengeActionModel = require("../models/challengeAction.model");
const WorkoutPlanModel = require("../models/workoutPlan.model");
const WorkoutPlanActionModel = require("../models/workoutPlanAction.model");
const validateData = require("../util/validate");
const BaseService = require("./base");

class WorkoutplanService extends BaseService {
  async createWorkoutplan(req) {
    try {
      const post = req.body;

      const validateRule = {
        title: "string|required",
        description: "string|required",
        duration: "integer|required",
        category: "string|required",
        calories: "integer|required",
        level: "string|required|in:begineer,intermediate,advanced",
        recommended: "string|required|in:YES,NO",
        roundsCount: "integer|required",
        rounds: "array|required",
        "rounds.*.title": "string|required",
        "rounds.*.duration": "integer|required",
        "rounds.*.set": "integer|required",
        "rounds.*.reps": "integer|required",
        "rounds.*.restBetweenSet": "integer|required",
        "rounds.*.instruction": "string|required",
        "rounds.*.animation": "string|required",
        "rounds.*.commonMistakesToAvoid": "array|required",
        "rounds.*.breathingTips": "array|required",
        "rounds.*.focusArea": "array|required",
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
      const existingWorkoutplan = await WorkoutPlanModel.findOne({
        title: post.title,
      });
      if (existingWorkoutplan) {
        return BaseService.sendFailedResponse({
          error: "Challenge with this title already exists",
        });
      }

      // const newWorkoutplan = {
      //   title: post.title,
      //   goal: post.goal,
      //   duration: post.duration,
      //   type: post.type,
      //   difficulty: post.difficulty,
      //   tasks: post.tasks,
      //   image: {
      //     imageUrl: post.image.imageUrl,
      //     publicId: post.image.publicId,
      //   },
      // };

      // if (post.type == "weekly" && post.end_date) {
      //   const today = new Date();
      //   const daysToAdd = 6;

      //   const endDate = new Date(today);
      //   endDate.setDate(today.getDate() + daysToAdd);
      //   console.log({endDate})
      //   newChallenge.endDate = endDate;
      // }
      // return console.log('newChallenge')

      // Create a new challenge
      const workoutplan = new WorkoutPlanModel(post);
      // Save the workoutplan to the database
      const savedWorkoutplan = await workoutplan.save();

      return BaseService.sendSuccessResponse({
        message: "Workout plan created successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getWorkoutplans(req) {
    try {
      const type = req.query.type || "";
      const filter = type ? { type } : {};

      const workoutplans = await WorkoutPlanModel.find(filter).sort({
        createdAt: -1,
      });
      return BaseService.sendSuccessResponse({ message: workoutplans });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getWorkoutplan(req) {
    try {
      const workoutplanId = req.params.id;

      const workoutplan = await WorkoutPlanModel.findById(workoutplanId);
      if (!workoutplan) {
        return BaseService.sendFailedResponse({
          error: "Workout plan not found",
        });
      }

      return BaseService.sendSuccessResponse({ message: workoutplan });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async updateWorkoutplan(req) {
    try {
      const workoutplanId = req.params.id;

      const workoutplan = await WorkoutPlanModel.findById(workoutplanId);
      if (!challenge) {
        return BaseService.sendFailedResponse({
          error: "Workout plan not found",
        });
      }

      const workoutplanExists = await WorkoutPlanModel.findOne({
        title: req.body.title,
        _id: { $ne: workoutplanId }, // Exclude the current workoutid
      });
      if (workoutplanExists) {
        return BaseService.sendFailedResponse({
          error: "Workout plan with this title already exists",
        });
      }

      const workoutplanUpdate = await ChallengeModel.findByIdAndUpdate(
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
      if (!workoutplanUpdate) {
        return BaseService.sendFailedResponse({
          error: "Failed to update workout plan",
        });
      }
      return BaseService.sendSuccessResponse({
        message: "Workout plan updated successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async deleteWorkoutplan(req) {
    try {
      const workoutplanId = req.params.id;

      const workoutplan = await WorkoutPlanModel.findById(workoutplanId);
      if (!workoutplan) {
        return BaseService.sendFailedResponse({
          error: "Challenge not found",
        });
      }

      const deleteWorkoutplan = await WorkoutPlanModel.findByIdAndDelete(
        workoutplanId
      );
      return BaseService.sendSuccessResponse({
        message: "Workout plan deleted successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async joinWorkoutplan(req) {
    const userId = req.user.id;
    const post = req.body;

    const validateRule = {
      workoutplanId: "string|required",
    };

    const validateMessage = {
      required: ":attribute is required",
    };

    const validateResult = validateData(post, validateRule, validateMessage);

    if (!validateResult.success) {
      return BaseService.sendFailedResponse({ error: validateResult.data });
    }

    const workoutplan = await WorkoutPlanModel.findById(post.workoutplanId);
    if (!workoutplan) {
      return BaseService.sendFailedResponse({
        error: "Workout plan not found",
      });
    }

    const joinedWorkoutplan = await WorkoutPlanModel.findOne({
      userId,
      challengeId: post.challengeId,
    });
    if (joinedWorkoutplan) {
      return BaseService.sendSuccessResponse({
        message: "You have already joined this Workout plan",
      });
    }

    const newWorkoutplan = new WorkoutPlanActionModel({
      userId,
      workoutPlanId: post.workoutPlanId,
      rounds: workoutplan.rounds
    });

    (await newWorkoutplan.save()).populate("workoutPlanId");

    return BaseService.sendSuccessResponse({
      message: "Workout plan joined successfully",
      challenge: newWorkoutplan,
    });
  }
  async markWorkoutplanTask(req) {
    const userId = req.user.id;
    const post = req.body;

    const validateRule = {
      workoutplanRoundId: "string|required",
      workoutplanId: "string|required",
    };

    const validateMessage = {
      required: ":attribute is required",
    };

    const validateResult = validateData(post, validateRule, validateMessage);

    if (!validateResult.success) {
      return BaseService.sendFailedResponse({ error: validateResult.data });
    }

    const workoutplan = await WorkoutPlanModel.findById(post.workoutplanId);
    if (!workoutplan) {
      return BaseService.sendFailedResponse({
        error: "Challenge not found",
      });
    }
    const workoutplanAction = await WorkoutPlanActionModel.findOne({
      userId,
      challengeId: post.challengeId,
    }).populate("workoutPlanId");

    if (!workoutplanAction) {
      return BaseService.sendFailedResponse({
        error: "You have not joined this workout plan",
      });
    }

    const workoutRoundTask = workoutplanAction.rounds.find(
      (round) => round._id.toString() === post.workoutplanRoundId.toString()
    );

    if (!workoutRoundTask) {
      return BaseService.sendFailedResponse({
        error: "Challenge task not found",
      });
    }
 
    if (workoutplanAction.status === "completed") {
      return BaseService.sendSuccessResponse({
        message: "You have already completed this challenge",
      });
    }
    if (workoutRoundTask.status === "completed") {
      return BaseService.sendSuccessResponse({
        message: "You have already completed this task",
      });
    }
    // if (challengeAction.streak >= challengeAction.tasks.length) {
    //   return BaseService.sendSuccessResponse({
    //     message: "You are all done",
    //   });
    // }
    workoutplanAction.streak += 1;
    workoutRoundTask.status = "completed";
    if (workoutplanAction.streak >= workoutplanAction.tasks.length) {
      challengeAction.status = "completed";
    }
    await workoutplanAction.save();

    return BaseService.sendSuccessResponse({
      message: "Round marked as completed"
    });
  }
  async getWorkoutplanAction(req) {
    try {
      const workoutplanActionId = req.params.id;

      const workoutplanAction = await WorkoutPlanActionModel.findById(workoutplanActionId).populate("workoutPlanId");
      if (!workoutplanAction) {
        return BaseService.sendFailedResponse({
          error: "Workout plan action not found",
        });
      }

      return BaseService.sendSuccessResponse({ message: workoutplanAction });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async resetWorkoutplanAction(req) {
    try {
      const userId = req.user.id;
      const { workoutplanId } = req.body;

      // Validate input
      const validateRule = {
        workoutplanId: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
      };

      const validateResult = validateData(
        { workoutplanId },
        validateRule,
        validateMessage
      );

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      // Fetch the diet action
      const workoutplanAction = await WorkoutPlanActionModel.findOne({
        userId,
        workoutplanId,
      });

      if (!workoutplanAction) {
        return BaseService.sendFailedResponse({
          error: "You have not joined this challenge",
        });
      }

      // Reset progress, status, and all daily task statuses
      workoutplanAction.streak = 0;
      workoutplanAction.status = "in-progress";

      workoutplanAction.rounds = workoutplanAction.rounds.map(
        (task) => ({
          ...task.toObject(),
          status: "in-progress",
        })
      );

      await workoutplanAction.save();

      return BaseService.sendSuccessResponse({
        message: "Workout plan progress reset successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async recommendedWorkoutplans(req) {
    try {
      const recommendedWorkoutplans = await WorkoutPlanModel.find({
        recommended: "YES",
        // status: "active",
      })
        .populate("category")
        .sort({ createdAt: -1 });
      if (empty(recommendedWorkoutplans)) {
        return BaseService.sendFailedResponse({
          error: "No recommended workout plan found",
        });
      }
      return BaseService.sendSuccessResponse({
        message: recommendedWorkoutplans,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async activeWorkoutplans() {
    try {
      const activeWorkoutplans = await WorkoutPlanModel.find({
        // recommended: "YES",
        status: "active",
      })
        .populate("category")
        .sort({ createdAt: -1 });
      if (empty(activeWorkoutplans)) {
        return BaseService.sendFailedResponse({
          error: "No active plan found",
        });
      }
      return BaseService.sendSuccessResponse({
        message: activeWorkoutplans,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
}

module.exports = WorkoutplanService;
