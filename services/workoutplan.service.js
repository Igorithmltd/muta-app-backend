const { default: mongoose } = require("mongoose");
const ChallengeModel = require("../models/challenge.model");
const NotificationModel = require("../models/notification.model");
const WorkoutPlanModel = require("../models/workoutPlan.model");
const WorkoutPlanActionModel = require("../models/workoutPlanAction.model");
const validateData = require("../util/validate");
const BaseService = require("./base");
const { sendPushNotification } = require("./firebase.service");
const UserModel = require("../models/user.model");

class WorkoutplanService extends BaseService {
  static formatDate(date) {
    return date.toLocaleString("en-US", { month: "short", day: "numeric" });
  }
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
        // "planRounds.*.dayLabel": "string|required",
        // "planRounds.*.dayDate": "string|required",
        "planRounds.*.rounds": "array|required",
        "planRounds.*.rounds.*.title": "string|required",
        // "planRounds.*.rounds.*.duration": "integer|required",//observe
        "planRounds.*.rounds.*.set": "integer",
        "planRounds.*.rounds.*.workoutExerciseType":
          "string|required|in:time,set-reps",
        // "planRounds.*.rounds.*.reps": "integer", //observe
        "planRounds.*.rounds.*.restBetweenSet": "integer|required",
        "planRounds.*.rounds.*.instruction": "string|required",
        "planRounds.*.rounds.*.image": "string|required",
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

      for (const day of post.planRounds) {
        for (const round of day.rounds) {
          if (round.workoutExerciseType === "set-reps") {
            if (round.set == null || round.reps == null) {
              return BaseService.sendFailedResponse({
                error:
                  "Rounds with 'set-reps' type must include 'set' and 'reps'.",
              });
            }
            delete round.duration;
          } else if (round.workoutExerciseType === "time") {
            if (!round.duration) {
              return BaseService.sendFailedResponse({
                error: "Rounds with 'time' type must include 'duration'.",
              });
            }
            delete round.set;
            delete round.reps;
          } else {
            return BaseService.sendFailedResponse({
              error: "Invalid workoutExerciseType value in one of the rounds.",
            });
          }
        }
      }

      // Check if the workoutplan already exists
      const existingWorkoutplan = await WorkoutPlanModel.findOne({
        title: post.title,
      });
      if (existingWorkoutplan) {
        return BaseService.sendFailedResponse({
          error: "Workoutplan with this title already exists",
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
      const workoutplan = new WorkoutPlanModel({...post, durationInDays: post.planRounds.length});
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
      const { title } = req.query; // Destructure title if it's in the query params
      const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit, 10) || 10; // Default to limit 10 if not provided
      const skip = (page - 1) * limit; // Calculate skip based on current page and limit
  
      // Create a filter for title if it's provided in the query params
      const filter = title ? { title: new RegExp(title, "i") } : {}; // "i" makes it case-insensitive
  
      // Fetch workout plans and total count in parallel
      const [workoutPlans, totalCount] = await Promise.all([
        WorkoutPlanModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("category") // Populate category information
          .lean(), // Use lean() to return plain JavaScript objects
        WorkoutPlanModel.countDocuments(filter), // Get the total count of documents that match the filter
      ]);
  
      // Enrich each workout plan with user count and ratings
      const enrichedWorkoutPlans = await Promise.all(
        workoutPlans.map(async (plan) => {
          // Get the user count for each workout plan (assumes there's a related collection like "WorkoutPlanActionModel")
          const usersOnPlanCount = await WorkoutPlanActionModel.countDocuments({
            workoutPlanId: plan._id,
          });
  
          // Get the total ratings count for the workout plan
          const numberOfRatings = plan.totalRatings || (plan.ratings ? plan.ratings.length : 0);
  
          return {
            ...plan,
            usersOnPlanCount, // Add user count information
            numberOfRatings,  // Add ratings information
          };
        })
      );
  
      // Calculate total pages for pagination
      const totalPages = Math.ceil(totalCount / limit);
  
      return BaseService.sendSuccessResponse({
        message: "Workout plans fetched successfully.",
        data: {
          workoutPlans: enrichedWorkoutPlans, // Array of enriched workout plans
          pagination: {
            totalCount,     // Total number of workout plans
            totalPages,     // Total pages available
            currentPage: page,  // Current page
            pageSize: limit,   // Items per page (limit)
          },
        },
      });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse({
        error: "An error occurred while fetching workout plans.",
      });
    }
  }  
  async getWorkoutplan(req) {
    try {
      const workoutplanId = req.params.id;

      const workoutplan = await WorkoutPlanModel.findById(
        workoutplanId
      ).populate("category");
      if (!workoutplan) {
        return BaseService.sendFailedResponse({
          error: "Workout plan not found",
        });
      }

      // Count how many users joined this workout plan
      const userCount = await WorkoutPlanActionModel.countDocuments({
        workoutPlanId: workoutplanId,
      });

      return BaseService.sendSuccessResponse({
        workoutplan,
        userCount,
        totalRatings: workoutplan.totalRatings || 0,
      });
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

    const user = await UserModel.findById(userId);

    const workoutplan = await WorkoutPlanModel.findById(post.workoutplanId);
    if (!workoutplan) {
      return BaseService.sendFailedResponse({
        error: "Workout plan not found",
      });
    }

    const joinedWorkoutplan = await WorkoutPlanActionModel.findOne({
      userId,
      workoutPlanId: post.workoutplanId,
    }).populate({
      path: "workoutPlanId",
      populate: { path: "category" },
    });

    if (joinedWorkoutplan) {
      return BaseService.sendSuccessResponse({
        message: "You have already joined this Workout plan",
        workoutPlanAction: joinedWorkoutplan,
      });
    }

    // Helper to format date strings like "Jul 23"
   

    // Generate planRounds with dayLabel and dayDate based on roundsCount or planRounds length
    const planRounds = [];

    // Use workoutplan.roundsCount or workoutplan.planRounds.length (if exists)
    const daysCount = workoutplan.planRounds?.length || 0;

    const today = new Date();
    const cutoffHour = 20; // 8 PM cutoff

    if (today.getHours() >= cutoffHour) {
      today.setDate(today.getDate() + 1);
      today.setHours(0, 0, 0, 0);
    }

    for (let i = 0; i < daysCount; i++) {
      const dayLabel = `Day ${i + 1}`;
      const dayDate = WorkoutplanService.formatDate(
        new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
      );

      // Filter rounds for this day from workoutplan.planRounds if exists, else fallback to workoutplan.rounds
      const roundsForDay =
        (workoutplan.planRounds && workoutplan.planRounds[i]?.rounds) ||
        workoutplan.rounds ||
        [];

      // Map rounds adding default status
      const rounds = roundsForDay.map((round) => ({
        title: round.title,
        duration: round.duration ? round.duration : null,
        set: round.set ? round.set : null,
        animation: round.animation,
        image: round.image,
        reps: round.reps ? round.reps : null,
        workoutExerciseType: round.workoutExerciseType,
        youtubeLink: round.youtubeLink,
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
    workoutplan.numberOfUsers += 1;
    await workoutplan.save();

    await NotificationModel.create({
      userId,
      title: "You just joined a new workout plan",
      body: `You have to rememeber that consistency is the key. Well done!`,
      createdAt: new Date(),
      type: "streak",
    });
    if (user.deviceToken) {
      await sendPushNotification({
        title: "You just joined a new workout plan",
        body: `You have to rememeber that consistency is the key. Well done!`,
        deviceToken: user.deviceToken,
      });
    }

    await newWorkoutplanAction.populate({
      path: "workoutPlanId",
      populate: { path: "category" },
    });

    return BaseService.sendSuccessResponse({
      message: "Workout plan joined successfully",
      workoutPlanAction: newWorkoutplanAction,
    });
  }
  // async markWorkoutplanTask(req) {
  //   const userId = req.user.id;
  //   const post = req.body;

  //   const validateRule = {
  //     workoutplanRoundId: "string|required", // this will now refer to the round _id inside planRounds.rounds
  //     workoutplanId: "string|required",
  //   };

  //   const validateMessage = {
  //     required: ":attribute is required",
  //   };

  //   const validateResult = validateData(post, validateRule, validateMessage);

  //   if (!validateResult.success) {
  //     return BaseService.sendFailedResponse({ error: validateResult.data });
  //   }
  //   const user = await UserModel.findById(userId);

  //   // Verify workout plan exists
  //   const workoutplan = await WorkoutPlanModel.findById(post.workoutplanId);
  //   if (!workoutplan) {
  //     return BaseService.sendFailedResponse({
  //       error: "Workout plan not found",
  //     });
  //   }

  //   // Find user's workout plan action
  //   const workoutplanAction = await WorkoutPlanActionModel.findOne({
  //     userId,
  //     workoutPlanId: post.workoutplanId,
  //   });

  //   if (!workoutplanAction) {
  //     return BaseService.sendFailedResponse({
  //       error: "You have not joined this workout plan",
  //     });
  //   }

  //   // Find the round inside nested planRounds.rounds by workoutplanRoundId
  //   let foundRound = null;
  //   for (const day of workoutplanAction.planRounds) {
  //     foundRound = day.rounds.find(
  //       (round) => round._id.toString() === post.workoutplanRoundId.toString()
  //     );
  //     if (foundRound) break;
  //   }

  //   if (!foundRound) {
  //     return BaseService.sendFailedResponse({
  //       error: "Workout round not found",
  //     });
  //   }

  //   if (foundRound.status === "completed") {
  //     return BaseService.sendSuccessResponse({
  //       message: "You have already completed this round",
  //     });
  //   }

  //   if (workoutplanAction.status === "completed") {
  //     return BaseService.sendSuccessResponse({
  //       message: "You have already completed this workout plan",
  //     });
  //   }

  //   // Mark round as completed
  //   foundRound.status = "completed";

  //   // Increment streak
  //   // workoutplanAction.streak += 1;

  //   // Check if all rounds are completed (iterate all planRounds.rounds)
  //   const allRounds = workoutplanAction.planRounds.flatMap((day) => day.rounds);
  //   const completedRoundsCount = allRounds.filter(
  //     (r) => r.status === "completed"
  //   ).length;

  //   if (completedRoundsCount === allRounds.length) {
  //     workoutplanAction.status = "completed";
  //   }

  //   await workoutplanAction.save();

  //   const dayNumber = completedRoundsCount; // assuming this is day count for streak
  //   await NotificationModel.create({
  //     userId,
  //     title: "Your workout streak is alive",
  //     body: `You have logged workouts for day ${dayNumber}. Keep it going - Consistency is your secret weapon.`,
  //     createdAt: new Date(),
  //   });
  //   if (user.deviceToken) {
  //     await sendPushNotification({
  //       title: "Your workout streak is alive",
  //       body: `You have logged workouts for day ${dayNumber}. Keep it going - Consistency is your secret weapon.`,
  //       deviceToken: user.deviceToken,
  //     });
  //   }

  //   return BaseService.sendSuccessResponse({
  //     message: "Workout round marked as completed",
  //   });
  // }
  async markWorkoutplanTask(req) {
    const userId = req.user.id;
    const post = req.body;
    const { select } = req.query;
  
    const validateRule = {
      workoutplanRoundId: "string|required", // used as either day._id or round._id
      workoutplanId: "string|required",
    };
  
    const validateMessage = {
      required: ":attribute is required",
    };
  
    const validateResult = validateData(post, validateRule, validateMessage);
  
    if (!validateResult.success) {
      return BaseService.sendFailedResponse({ error: validateResult.data });
    }
  
    const user = await UserModel.findById(userId);
  
    const workoutplan = await WorkoutPlanModel.findById(post.workoutplanId);
    if (!workoutplan) {
      return BaseService.sendFailedResponse({
        error: "Workout plan not found",
      });
    }
  
    const workoutplanAction = await WorkoutPlanActionModel.findOne({
      userId,
      workoutPlanId: post.workoutplanId,
    });
  
    if (!workoutplanAction) {
      return BaseService.sendFailedResponse({
        error: "You have not joined this workout plan",
      });
    }
  
    // ──────────────────────────────────────────────
    // 👉 If select=all, treat workoutplanRoundId as day._id and mark all rounds in that day
    // ──────────────────────────────────────────────
    if (select === "all") {
      const day = workoutplanAction.planRounds.find(
        (d) => d._id.toString() === post.workoutplanRoundId.toString()
      );
  
      if (!day) {
        return BaseService.sendFailedResponse({
          error: "Workout day (parent round) not found",
        });
      }
  
      // Mark all rounds in this day as completed
      for (const round of day.rounds) {
        round.status = "completed";
      }
    } else {
      // ──────────────────────────────────────────────
      // 👉 Default: mark single round only using round._id
      // ──────────────────────────────────────────────
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
  
      foundRound.status = "completed";
    }
  
    // ──────────────────────────────────────────────
    // 👉 Check if all rounds in all days are completed
    // ──────────────────────────────────────────────
    const allRounds = workoutplanAction.planRounds.flatMap((day) => day.rounds);
    const completedRoundsCount = allRounds.filter(
      (r) => r.status === "completed"
    ).length;
  
    if (completedRoundsCount === allRounds.length) {
      workoutplanAction.status = "completed";
    }
  
    await workoutplanAction.save();
  
    const dayNumber = completedRoundsCount;
  
    await NotificationModel.create({
      userId,
      title: "Your workout streak is alive",
      body: `You have logged workouts for day ${dayNumber}. Keep it going - Consistency is your secret weapon.`,
      createdAt: new Date(),
    });
  
    if (user.deviceToken) {
      await sendPushNotification({
        title: "Your workout streak is alive",
        body: `You have logged workouts for day ${dayNumber}. Keep it going - Consistency is your secret weapon.`,
        deviceToken: user.deviceToken,
      });
    }
  
    return BaseService.sendSuccessResponse({
      message:
        select === "all"
          ? "All rounds in selected day marked as completed"
          : "Workout round marked as completed",
    });
  }  
  async getWorkoutplanAction(req) {
    try {
      const workoutplanId = req.params.id;

      const workoutplanAction = await WorkoutPlanActionModel.findOne({
        workoutPlanId: workoutplanId,
        userId: req.user.id,
      }).populate({ path: "workoutPlanId", populate: { path: "category" } });
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
      const { workoutPlanId } = req.body;

      // Validate input
      const validateRule = {
        workoutPlanId: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
      };

      const validateResult = validateData(
        { workoutPlanId },
        validateRule,
        validateMessage
      );

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      // Fetch the diet action
      const workoutplanAction = await WorkoutPlanActionModel.findOne({
        userId,
        workoutPlanId,
      });

      if (!workoutplanAction) {
        return BaseService.sendFailedResponse({
          error: "You have not joined this challenge",
        });
      }

      // Reset progress, status, and all daily task statuses
      // workoutplanAction.streak = 0;
      workoutplanAction.status = "not-started";

      workoutplanAction.planRounds = workoutplanAction.planRounds.map((day) => {
        const updatedRounds = day.rounds.map((round) => ({
          ...round.toObject(),
          status: "not-started",
        }));

        return {
          ...day.toObject(),
          rounds: updatedRounds,
        };
      });

      await workoutplanAction.save();

      return BaseService.sendSuccessResponse({
        message: "Workout plan progress reset successfully",
      });
    } catch (error) {
      console.log(error);
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
      // if (empty(recommendedWorkoutplans)) {
      //   return BaseService.sendFailedResponse({
      //     error: "No recommended workout plan found",
      //   });
      // }
      return BaseService.sendSuccessResponse({
        message: recommendedWorkoutplans || [],
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async getCompletedWorkoutPlans(req) {
    try {
      const userId = req.user.id;

      // Get plans that are either marked as completed OR have expired
      const completedPlans = await WorkoutPlanActionModel.find({
        userId,
        status: "completed",
      }).populate("workoutPlanId");

      return BaseService.sendSuccessResponse({
        message: "Completed workoutplans plans fetched successfully",
        plans: completedPlans,
      });
    } catch (error) {
      console.error("Error fetching completed plans:", error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getTotalCompletedWorkoutPlans(req) {
    try {
      // Get plans that are either marked as completed OR have expired
      const completedPlans = await WorkoutPlanActionModel.find({
        status: "completed",
      }).populate("workoutPlanId");

      return BaseService.sendSuccessResponse({
        message: "Completed workoutplans plans fetched successfully",
        completedPlans: completedPlans,
      });
    } catch (error) {
      console.error("Error fetching completed plans:", error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  // async activeWorkoutplans(req, res) {
  //   try {
  //     const activeWorkoutplans = await WorkoutPlanActionModel.find({
  //       userId: req.user.id,
  //       status: "in-progress",
  //     })
  //       .populate({ path: "workoutPlanId", populate: { path: "category" } })
  //       .sort({ createdAt: -1 });

  //     // Add daysPassed to each workout plan
  //     const plansWithDaysPassed = activeWorkoutplans.map((plan) => {
  //       // Find the earliest dayDate in planRounds
  //       const allDates = plan.planRounds.map(
  //         (round) => new Date(round.dayDate)
  //       );
  //       const startDate = new Date(Math.min(...allDates));
  //       const today = new Date();

  //       // Calculate difference in days
  //       const diffTime = today - startDate;
  //       const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  //       // Convert plan to plain object and attach daysPassed
  //       const planObj = plan.toObject();
  //       planObj.daysPassed = daysPassed >= 0 ? daysPassed : 0;

  //       return planObj;
  //     });

  //     return BaseService.sendSuccessResponse({
  //       message: plansWithDaysPassed,
  //     });
  //   } catch (error) {
  //     return BaseService.sendFailedResponse({
  //       error: this.server_error_message,
  //     });
  //   }
  // }
  async activeWorkoutplans(req, res) {
    try {
      const activeWorkoutplans = await WorkoutPlanActionModel.find({
        userId: req.user.id,
        status: "in-progress",
      })
        .populate({ path: "workoutPlanId", populate: { path: "category" } })
        .sort({ createdAt: -1 });
  
      const plansWithDaysPassed = activeWorkoutplans.map((plan) => {
        // Count how many planRounds (days) are completed:
        // A day is completed only if all rounds in that day have status "completed"
        const completedDaysCount = plan.planRounds.reduce((count, day) => {
          const allRoundsCompleted = day.rounds.every(
            (round) => round.status === "completed"
          );
          return allRoundsCompleted ? count + 1 : count;
        }, 0);
  
        // Convert plan to plain object and attach daysPassed as completed days count
        const planObj = plan.toObject();
        planObj.daysCompleted = completedDaysCount;
  
        return planObj;
      });
  
      return BaseService.sendSuccessResponse({
        message: plansWithDaysPassed,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  
  async popularWorkoutPlans() {
    try {
      const result = await WorkoutPlanActionModel.aggregate([
        {
          // Group by workoutPlanId and count distinct userIds
          $group: {
            _id: "$workoutPlanId",
            uniqueUsers: { $addToSet: "$userId" }, // collect distinct userIds
          },
        },
        {
          $project: {
            workoutPlanId: "$_id",
            userCount: { $size: "$uniqueUsers" }, // count of unique users
          },
        },
        {
          $sort: { userCount: -1 }, // descending order by number of users
        },
        {
          $limit: 5,
        },
        {
          // Lookup to get workout plan details
          $lookup: {
            from: "workoutplans", // the actual collection name (usually plural lowercase)
            localField: "workoutPlanId",
            foreignField: "_id",
            as: "workoutPlan",
          },
        },
        {
          $unwind: "$workoutPlan",
        },
        {
          $lookup: {
            from: "dietcategories", // your actual collection name
            localField: "workoutPlan.category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true, // in case some plans don't have a category
          },
        },
        {
          $project: {
            _id: 0,
            workoutPlanId: 1,
            userCount: 1,
            // Include all fields from workoutPlan
            title: "$workoutPlan.title",
            description: "$workoutPlan.description",
            status: "$workoutPlan.status",
            image: "$workoutPlan.image",
            category: {
              _id: "$category._id",
              name: "$category.title",
              createdAt: "$category.createdAt",
              updatedAt: "$category.updatedAt",
            },
            calories: "$workoutPlan.calories",
            roundsCount: "$workoutPlan.roundsCount",
            duration: "$workoutPlan.duration",
            level: "$workoutPlan.level",
            recommended: "$workoutPlan.recommended",
            planRounds: "$workoutPlan.planRounds",
            ratings: "$workoutPlan.ratings",
            averageRating: "$workoutPlan.averageRating",
            totalRatings: "$workoutPlan.totalRatings",
            createdAt: "$workoutPlan.createdAt",
            updatedAt: "$workoutPlan.updatedAt",
          },
        },
      ]);

      return BaseService.sendSuccessResponse({ message: result || [] });
    } catch (error) {
      console.error("Error fetching popular workout plans:", error);
      throw error;
    }
  }
  async rateWorkoutplan(req) {
    try {
      const userId = req.user.id;
      const workoutplanId = req.params.id;
      const { rating, review } = req.body;

      // Basic validation
      if (!rating || rating < 1 || rating > 5) {
        return BaseService.sendFailedResponse({
          error: "Rating must be an integer between 1 and 5",
        });
      }

      // Find workout plan
      const workoutplan = await WorkoutPlanModel.findById(workoutplanId);
      if (!workoutplan) {
        return BaseService.sendFailedResponse({
          error: "Workout plan not found",
        });
      }

      // Check if user already rated
      const existingRatingIndex = workoutplan.ratings.findIndex(
        (r) => r.userId.toString() === userId.toString()
      );

      if (existingRatingIndex !== -1) {
        // Update existing rating and review
        workoutplan.ratings[existingRatingIndex].rating = rating;
        if (review !== undefined) {
          workoutplan.ratings[existingRatingIndex].review = review;
        }
        workoutplan.ratings[existingRatingIndex].createdAt = new Date();
      } else {
        // Add new rating
        workoutplan.ratings.push({
          userId,
          rating,
          review,
          createdAt: new Date(),
        });
      }

      // Recalculate averageRating and totalRatings
      const totalRatings = workoutplan.ratings.length;
      const sumRatings = workoutplan.ratings.reduce(
        (acc, curr) => acc + curr.rating,
        0
      );
      workoutplan.totalRatings = totalRatings;
      workoutplan.averageRating = totalRatings
        ? (sumRatings / totalRatings).toFixed(2)
        : 0;

      await workoutplan.save();

      return BaseService.sendSuccessResponse({
        message: "Rating submitted successfully",
        averageRating: workoutplan.averageRating,
        totalRatings: workoutplan.totalRatings,
      });
    } catch (error) {
      console.error(error);
      return BaseService.sendFailedResponse({
        error: "Server error while rating workout plan",
      });
    }
  }
  async searchWorkoutplanByTitle(req) {
    try {
      const { title } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if (!title) {
        return BaseService.sendFailedResponse({
          error: "Title query parameter is required",
        });
      }

      const totalCount = await WorkoutPlanModel.countDocuments({
        title: { $regex: title, $options: "i" },
      });

      const workoutplans = await WorkoutPlanModel.find({
        title: { $regex: title, $options: "i" },
      })
        .populate("category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const enrichedWorkoutplans = await Promise.all(
        workoutplans.map(async (workoutplan) => {
          const usersOnWorkoutplanCount =
            await WorkoutPlanActionModel.countDocuments({
              workoutPlanId: workoutplan._id,
            });
          const numberOfRatings =
            workoutplan.totalRatings || workoutplan.ratings?.length || 0;
          return {
            ...workoutplan,
            usersOnWorkoutplanCount,
            numberOfRatings,
          };
        })
      );

      return BaseService.sendSuccessResponse({
        message: enrichedWorkoutplans || [],
      });
    } catch (error) {
      console.error("Error in searchDietByTitle:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async getWorkoutplanByCategory(req) {
    try {
      const { id } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if (!mongoose.isValidObjectId(id)) {
        return BaseService.sendFailedResponse({
          error: "Category ID is required",
        });
      }

      const [workoutplans, totalCount] = await Promise.all([
        WorkoutPlanModel.find({ category: id })
          .populate("category")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        WorkoutPlanModel.countDocuments({ category: id }),
      ]);

      const enrichedWorkoutplans = await Promise.all(
        workoutplans.map(async (workoutplan) => {
          const usersOnWorkoutplanCount =
            await WorkoutPlanActionModel.countDocuments({
              workoutPlanId: workoutplan._id,
            });
          const numberOfRatings =
            workoutplan.totalRatings || workoutplan.ratings?.length || 0;
          return {
            ...workoutplan,
            usersOnWorkoutplanCount,
            numberOfRatings,
          };
        })
      );

      const totalPages = Math.ceil(totalCount / limit);

      return BaseService.sendSuccessResponse({
        message: "Workoutplans fetched successfully.",
        data: {
          workoutplan: enrichedWorkoutplans || [],
          pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            pageSize: limit,
          },
        },
      });
    } catch (error) {
      console.error("Error in getDietByCategory:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
}

module.exports = WorkoutplanService;
