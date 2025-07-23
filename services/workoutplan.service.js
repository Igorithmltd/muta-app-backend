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
        level: "string|required|in:beginner,intermediate,advanced",
        recommended: "string|required|in:YES,NO",
        roundsCount: "integer|required",
        planRounds: "array|required",
        "planRounds.*.dayLabel": "string|required",
        "planRounds.*.dayDate": "string|required",
        "planRounds.*.rounds": "array|required",
        "planRounds.*.rounds.*.title": "string|required",
        "planRounds.*.rounds.*.duration": "integer|required",
        "planRounds.*.rounds.*.set": "integer|required",
        "planRounds.*.rounds.*.reps": "integer|required",
        "planRounds.*.rounds.*.restBetweenSet": "integer|required",
        "planRounds.*.rounds.*.instruction": "string|required",
        "planRounds.*.rounds.*.animation": "string|required",
        "planRounds.*.rounds.*.commonMistakesToAvoid": "array|required",
        "planRounds.*.rounds.*.breathingTips": "array|required",
        "planRounds.*.rounds.*.focusArea": "array|required",
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
  
    const joinedWorkoutplan = await WorkoutPlanActionModel.findOne({
      userId,
      workoutPlanId: post.workoutplanId,
    });
  
    if (joinedWorkoutplan) {
      return BaseService.sendSuccessResponse({
        message: "You have already joined this Workout plan",
      });
    }
  
    // Helper to format date strings like "Jul 23"
    function formatDate(date) {
      return date.toLocaleString("en-US", { month: "short", day: "numeric" });
    }
  
    // Generate planRounds with dayLabel and dayDate based on roundsCount or planRounds length
    const planRounds = [];
  
    // Use workoutplan.roundsCount or workoutplan.planRounds.length (if exists)
    const daysCount = workoutplan.roundsCount || workoutplan.planRounds?.length || 3;
  
    const today = new Date();
  
    for (let i = 0; i < daysCount; i++) {
      const dayLabel = `Day ${i + 1}`;
      const dayDate = formatDate(new Date(today.getTime() + i * 24 * 60 * 60 * 1000));
  
      // Filter rounds for this day from workoutplan.planRounds if exists, else fallback to workoutplan.rounds
      const roundsForDay = (workoutplan.planRounds && workoutplan.planRounds[i]?.rounds) || workoutplan.rounds || [];
  
      // Map rounds adding default status
      const rounds = roundsForDay.map(round => ({
        title: round.title,
        duration: round.duration,
        set: round.set,
        animation: round.animation,
        reps: round.reps,
        restBetweenSet: round.restBetweenSet,
        instruction: round.instruction,
        commonMistakesToAvoid: round.commonMistakesToAvoid || [],
        breathingTips: round.breathingTips || [],
        focusArea: round.focusArea || [],
        status: "in-progress",
      }));
  
      planRounds.push({
        dayLabel,
        dayDate,
        rounds,
      });
    }
  
    // Create new WorkoutPlanAction document
    const newWorkoutplanAction = new WorkoutPlanActionModel({
      userId,
      workoutPlanId: post.workoutplanId,
      planRounds,
    });
  
    await newWorkoutplanAction.save();
  
    await newWorkoutplanAction.populate("workoutPlanId");
  
    return BaseService.sendSuccessResponse({
      message: "Workout plan joined successfully",
      workoutPlanAction: newWorkoutplanAction,
    });
  }  
  async markWorkoutplanTask(req) {
    const userId = req.user.id;
    const post = req.body;
  
    const validateRule = {
      workoutplanRoundId: "string|required",  // this will now refer to the round _id inside planRounds.rounds
      workoutplanId: "string|required",
    };
  
    const validateMessage = {
      required: ":attribute is required",
    };
  
    const validateResult = validateData(post, validateRule, validateMessage);
  
    if (!validateResult.success) {
      return BaseService.sendFailedResponse({ error: validateResult.data });
    }
  
    // Verify workout plan exists
    const workoutplan = await WorkoutPlanModel.findById(post.workoutplanId);
    if (!workoutplan) {
      return BaseService.sendFailedResponse({
        error: "Workout plan not found",
      });
    }
  
    // Find user's workout plan action
    const workoutplanAction = await WorkoutPlanActionModel.findOne({
      userId,
      workoutPlanId: post.workoutplanId,
    });
  
    if (!workoutplanAction) {
      return BaseService.sendFailedResponse({
        error: "You have not joined this workout plan",
      });
    }
  
    // Find the round inside nested planRounds.rounds by workoutplanRoundId
    let foundRound = null;
    for (const day of workoutplanAction.planRounds) {
      foundRound = day.rounds.find(
        (round) => round._id.toString() === post.workoutplanRoundId.toString()
      );
      if (foundRound) break;
    }
  
    if (!foundRound) {
      return BaseService.sendFailedResponse({
        error: "Workout round not found",
      });
    }
  
    if (foundRound.status === "completed") {
      return BaseService.sendSuccessResponse({
        message: "You have already completed this round",
      });
    }
  
    if (workoutplanAction.status === "completed") {
      return BaseService.sendSuccessResponse({
        message: "You have already completed this workout plan",
      });
    }
  
    // Mark round as completed
    foundRound.status = "completed";
  
    // Increment streak
    workoutplanAction.streak += 1;
  
    // Check if all rounds are completed (iterate all planRounds.rounds)
    const allRounds = workoutplanAction.planRounds.flatMap(day => day.rounds);
    const completedRoundsCount = allRounds.filter(r => r.status === "completed").length;
  
    if (completedRoundsCount === allRounds.length) {
      workoutplanAction.status = "completed";
    }
  
    await workoutplanAction.save();
  
    return BaseService.sendSuccessResponse({
      message: "Workout round marked as completed",
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
