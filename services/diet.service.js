const { default: mongoose } = require("mongoose");
const DietModel = require("../models/diet.model");
const DietActionModel = require("../models/dietAction.model");
const DietCategoryModel = require("../models/dietCategory.model");
const { empty } = require("../util");
const validateData = require("../util/validate");
const BaseService = require("./base");
const moment = require("moment");

class DietServicee extends BaseService {
  async createDiet(req) {
    try {
      const post = req.body;

      const validateRule = {
        title: "string|required",
        description: "string|required",
        category: "string|required",
        calories: "integer|required",
        tags: "array|required",
        duration: "integer|required",
        "tags.*": "string|required",
        dailyMealBreakdown: "array|required",
        "dailyMealBreakdown.*.dayLabel": "string|required",
        "dailyMealBreakdown.*.meals": "array|required",
        "dailyMealBreakdown.*.meals.*.mealTitle": "string|required",
        "dailyMealBreakdown.*.meals.*.mealType":
          "string|required|in:breakfast,lunch,dinner,snack",
        "dailyMealBreakdown.*.meals.*.carbs": "integer|required",
        "dailyMealBreakdown.*.meals.*.protein": "integer|required",
        "dailyMealBreakdown.*.meals.*.fats": "integer|required",
        "dailyMealBreakdown.*.meals.*.calories": "integer|required",
        "dailyMealBreakdown.*.meals.*.recommendedTime": "string|required",
        "dailyMealBreakdown.*.meals.*.missedBy": "string|required",
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

      // Check if diet title already exists
      const existingDiet = await DietModel.findOne({ title: post.title });
      if (existingDiet) {
        return BaseService.sendFailedResponse({
          error: "Diet with this title already exists",
        });
      }
      // if (post.duration !== post.dailyMealBreakdown.length) {
      //   return BaseService.sendFailedResponse({
      //     error:
      //       "Duration must exactly match the number of days in dailyMealBreakdown",
      //   });
      // }

      // Add day field dynamically
      // const today = moment();
      // const breakdownWithDays = post.dailyMealBreakdown.map((item, index) => {
      //   const dayDate = today.clone().add(index, "days").format("MMMM D");
      //   return {
      //     ...item,
      //     day: dayDate,
      //   };
      // });

      // Create the diet
      const diet = new DietModel({
        ...post,
        // dailyMealBreakdown: breakdownWithDays,
      });
      console.log({diet})

      const savedDiet = await diet.save();

      return BaseService.sendSuccessResponse({
        message: "Diet created successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getAllDiets(req) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Fetch diets and total count in parallel
      const [allDiet, totalCount] = await Promise.all([
        DietModel.find({})
          .populate("category")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(), // Use lean() to allow direct object manipulation
        DietModel.countDocuments(),
      ]);

      // Enrich each diet with user count and ratings
      const enrichedDiets = await Promise.all(
        allDiet.map(async (diet) => {
          const usersOnDietCount = await DietActionModel.countDocuments({
            dietId: diet._id,
          });
          const numberOfRatings =
            diet.totalRatings || (diet.ratings ? diet.ratings.length : 0);

          return {
            ...diet,
            usersOnDietCount,
            numberOfRatings,
          };
        })
      );

      const totalPages = Math.ceil(totalCount / limit);

      return BaseService.sendSuccessResponse({
        message: "Diets fetched successfully.",
        data: {
          diets: enrichedDiets,
          pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            pageSize: limit,
          },
        },
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "An error occurred while fetching diets.",
      });
    }
  }
  async getDiet(req) {
    try {
      const dietId = req.params.id;

      // Find the diet by ID
      const diet = await DietModel.findById(dietId);
      if (!diet) {
        return BaseService.sendFailedResponse({ error: "Diet not found" });
      }

      // Count how many users have joined this diet (dietActions)
      const usersOnDietCount = await DietActionModel.countDocuments({ dietId });

      // Number of ratings can come from totalRatings or length of ratings array
      const numberOfRatings =
        diet.totalRatings || (diet.ratings ? diet.ratings.length : 0);

      return BaseService.sendSuccessResponse({
        message: {
          ...diet.toObject(),
          usersOnDietCount,
          numberOfRatings,
        },
      });
    } catch (error) {
      console.error("Error fetching diet:", error);
      return BaseService.sendFailedResponse({
        error: "An error occurred while fetching diet.",
      });
    }
  }
  async updateDiet(req) {
    try {
      const dietId = req.params.id;
      const post = req.body;

      const diet = await DietModel.findById(dietId);
      if (!diet) {
        return BaseService.sendFailedResponse({ error: "Diet not found" });
      }
      const existingDiet = await DietModel.findOne({
        title: post.title,
        _id: { $ne: dietId },
      });
      if (existingDiet) {
        return BaseService.sendFailedResponse({
          error: "Diet with this title already exists",
        });
      }
      const updatedDiet = await DietModel.findByIdAndUpdate(dietId, post, {
        new: true,
        runValidators: true,
      });
      if (!updatedDiet) {
        return BaseService.sendFailedResponse({
          error: "Failed to update diet",
        });
      }
      return BaseService.sendSuccessResponse({
        message: "Diet updated successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "An error occurred while updating diet.",
      });
    }
  }
  async deleteDiet(req) {
    try {
      const dietId = req.params.id;

      const diet = await DietModel.findById(dietId);
      if (!diet) {
        return BaseService.sendFailedResponse({ error: "Diet not found" });
      }

      const deleteDiet = await DietModel.findByIdAndDelete(dietId);
      return BaseService.sendSuccessResponse({
        message: "Diet deleted successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "An error occurred while deleting diets.",
      });
    }
  }
  async joinDiet(req) {
    try {
      const userId = req.user.id;
      const post = req.body;

      const validateRule = {
        dietId: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const diet = await DietModel.findById(post.dietId).populate('category');
      if (!diet) {
        return BaseService.sendFailedResponse({
          error: "Diet not found",
        });
      }

      const alreadyJoined = await DietActionModel.findOne({
        userId,
        dietId: post.dietId,
      }).populate({ path: 'dietId', populate: { path: 'category' } });

      if (alreadyJoined && alreadyJoined.status === "in-progress") {
        return BaseService.sendSuccessResponse({
          message: "You have already joined this diet plan",
        });
      }

      // Calculate start and end dates
      const now = moment().utc();
      const cutoffHour = 12; // 12 PM noon

      const startDate =
        now.hour() >= cutoffHour
          ? now.add(1, "day").startOf("day")
          : now.startOf("day");
      const endDate = startDate.clone().add(diet.duration - 1, "days");

      // Add day and dayDate fields to dailyMealBreakdown based on user startDate
      const breakdownWithDays = diet.dailyMealBreakdown.map((item, index) => {
        const dayDate = startDate
          .clone()
          .add(index, "days")
          .format("YYYY-MM-DD");
        return {
          ...(item.toObject?.() ?? item),
          day: `Day ${index + 1}`,
          dayDate, // <-- here
        };
      });

      if(alreadyJoined){
        alreadyJoined.startDate = startDate.toDate();
        alreadyJoined.endDate = endDate.toDate();
        alreadyJoined.dailyMealBreakdown = breakdownWithDays;
        alreadyJoined.status = "in-progress";
        alreadyJoined.progress = 0;
        await alreadyJoined.save();
        return BaseService.sendSuccessResponse({
          message: "Diet re-joined successfully",
          diet: alreadyJoined,
        })
      }else{
        const newUserDiet = new DietActionModel({
          userId,
          dietId: post.dietId,
          startDate: startDate.toDate(),
          endDate: endDate.toDate(),
          dailyMealBreakdown: breakdownWithDays,
        });
  
        await newUserDiet.save();
        await newUserDiet.populate({
          path: "dietId",
          populate: {
            path: "category",
          },
        });
  
        return BaseService.sendSuccessResponse({
          message: "Diet joined successfully",
          diet: newUserDiet,
        });
      }

    } catch (error) {
      console.error("Error joining diet:", error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async markDietTask(req) {
    try {
      const userId = req.user.id;
      const post = req.body;

      const validateRule = {
        dietTaskId: "string|required",
        dietId: "string|required",
        status: "string|required|in:completed,missed",
      };

      const validateMessage = {
        required: ":attribute is required",
        in: "Invalid :attribute. Must be one of: completed, missed",
      };

      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const diet = await DietModel.findById(post.dietId);
      if (!diet) {
        return BaseService.sendFailedResponse({ error: "Diet not found" });
      }

      const dietAction = await DietActionModel.findOne({
        userId,
        dietId: post.dietId,
      }).populate("dietId");

      if (!dietAction) {
        return BaseService.sendFailedResponse({
          error: "You have not joined this diet",
        });
      }

      // Find the day object containing the meal task
      const dayObj = dietAction.dailyMealBreakdown.find((day) =>
        day.meals.some(
          (meal) => meal._id.toString() === post.dietTaskId.toString()
        )
      );

      if (!dayObj) {
        return BaseService.sendFailedResponse({ error: "Diet task not found" });
      }

      // Find the specific meal task
      const foundTask = dayObj.meals.find(
        (meal) => meal._id.toString() === post.dietTaskId.toString()
      );

      if (!foundTask) {
        return BaseService.sendFailedResponse({ error: "Diet task not found" });
      }

      if (dietAction.status === "completed") {
        return BaseService.sendSuccessResponse({
          message: "You have already completed this diet",
        });
      }

      if (foundTask.status === "completed" || foundTask.status === "missed") {
        return BaseService.sendSuccessResponse({
          message: `You have already marked this task as ${foundTask.status}`,
        });
      }

      const moment = require("moment");

      // Assume each day object has a dayDate field in 'YYYY-MM-DD' format
      if (!dayObj.dayDate) {
        return BaseService.sendFailedResponse({
          error: "Day date missing for the diet task",
        });
      }

      const taskDayDate = moment(dayObj.dayDate, "YYYY-MM-DD").startOf("day");
      const today = moment().startOf("day");

      // Prevent marking tasks for future days
      if (taskDayDate.isAfter(today)) {
        return BaseService.sendFailedResponse({
          error: "You cannot mark a task for a future day.",
        });
      }

      let taskStatus = post.status;

      // If task is for today, check missedBy time
      if (taskDayDate.isSame(today)) {
        const currentTime = moment();
        const missedByTime = moment(foundTask.missedBy, "HH:mm:ss");

        if (currentTime.isAfter(missedByTime)) {
          taskStatus = "missed"; // Automatically mark as missed if time passed
        }
      }

      // For past days, you may choose to auto mark missed or allow marking as completed
      // Here, we allow marking as requested (either completed or missed)

      foundTask.status = taskStatus;

      // Recalculate progress
      let totalTasks = 0;
      let completedTasks = 0;
      let allMarked = true;

      for (const day of dietAction.dailyMealBreakdown) {
        for (const meal of day.meals) {
          totalTasks += 1;
          if (meal.status === "completed") {
            completedTasks += 1;
          }
          if (!["completed", "missed"].includes(meal.status)) {
            allMarked = false;
          }
        }
      }

      const progress =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
      dietAction.progress = progress;

      const endDate = moment(dietAction.endDate).startOf("day");

      // Mark dietAction as completed if all tasks are marked or endDate passed
      if (allMarked || today.isSameOrAfter(endDate)) {
        dietAction.status = "completed";
      }

      await dietAction.save();

      return BaseService.sendSuccessResponse({
        message:
          taskStatus === "missed"
            ? "Task automatically marked as missed (time expired)"
            : "Task marked as completed",
      });
    } catch (error) {
      console.error("Error marking task:", error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getDietAction(req) {
    try {
      const dietId = req.params.id;
      const userId = req.user.id;

      const dietAction = await DietActionModel.findOne({
        dietId: dietId,
        userId: userId,
      }).populate("dietId");
      if (!dietAction) {
        return BaseService.sendFailedResponse({
          error: "Diet action not found",
          statusCode: 404,
        });
      }

      return BaseService.sendSuccessResponse({ message: dietAction });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async resetDietAction(req) {
    try {
      const userId = req.user.id;
      const { dietId } = req.body;
  
      // Validate input
      const validateRule = {
        dietId: "string|required",
      };
  
      const validateMessage = {
        required: ":attribute is required",
      };
  
      const validateResult = validateData({ dietId }, validateRule, validateMessage);
  
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }
  
      // Fetch the diet action
      const dietAction = await DietActionModel.findOne({ userId, dietId });
  
      if (!dietAction) {
        return BaseService.sendFailedResponse({
          error: "You have not joined this diet",
        });
      }
  
      // Reset progress, status, and all daily meal statuses
      dietAction.progress = 0;
      dietAction.status = "not-started";
  
      dietAction.dailyMealBreakdown = dietAction.dailyMealBreakdown.map((day) => {
        const updatedMeals = day.meals.map((meal) => ({
          ...meal.toObject(),
          status: "not-started",
        }));
  
        return {
          ...day.toObject(),
          meals: updatedMeals,
        };
      });
  
      await dietAction.save();
  
      return BaseService.sendSuccessResponse({
        message: "Diet progress reset successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }  
  async recommendedDiets(req) {
    try {
      const recommendedDiets = await DietModel.find({
        recommended: "YES",
      })
        .populate("category")
        .sort({ createdAt: -1 })
        .lean();

      if (!recommendedDiets.length) {
        return BaseService.sendSuccessResponse({message: []});
      }

      const enrichedDiets = await Promise.all(
        recommendedDiets.map(async (diet) => {
          const usersOnDietCount = await DietActionModel.countDocuments({
            dietId: diet._id,
          });
          const numberOfRatings =
            diet.totalRatings || (diet.ratings ? diet.ratings.length : 0);

          return {
            ...diet,
            usersOnDietCount,
            numberOfRatings,
          };
        })
      );

      return BaseService.sendSuccessResponse({
        message: enrichedDiets,
      });
    } catch (error) {
      console.error("Error in recommendedDiets:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async activeDiets() {
    try {
      const activeDiets = await DietActionModel.find({
        status: "in-progress",
      })
        .populate({ path: "dietId", populate: { path: "category" } })
        .sort({ createdAt: -1 })
        .lean();
  
      if (!activeDiets.length) {
        return BaseService.sendSuccessResponse({message: []});
      }
  
      const enrichedDiets = await Promise.all(
        activeDiets.map(async (diet) => {
          const usersOnDietCount = await DietActionModel.countDocuments({
            dietId: diet._id,
          });
  
          const numberOfRatings =
            diet.totalRatings || (diet.ratings ? diet.ratings.length : 0);
  
          // 🧮 Calculate daysPassed
          const startDate = new Date(diet.startDate);
          const now = new Date();
          const diffTime = Math.max(now - startDate, 0); // Avoid negative in case of future startDate
          const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
          return {
            ...diet,
            usersOnDietCount,
            numberOfRatings,
            daysPassed,
          };
        })
      );
  
      return BaseService.sendSuccessResponse({
        message: enrichedDiets,
      });
    } catch (error) {
      console.error("Error in activeDiets:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async getDietCategories() {
    try {
      const dietCategories = await DietCategoryModel.find({}).sort({
        createdAt: -1,
      });
      if (empty(dietCategories)) {
        return BaseService.sendSuccessResponse({
          message: [],
        });
      }
      return BaseService.sendSuccessResponse({
        message: dietCategories,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async popularDietPlans() {
    try {
      const result = await DietActionModel.aggregate([
        {
          $group: {
            _id: "$dietId",
            uniqueUsers: { $addToSet: "$userId" }, // distinct users
          },
        },
        {
          $project: {
            dietId: "$_id",
            userCount: { $size: "$uniqueUsers" },
          },
        },
        {
          $sort: { userCount: -1 },
        },
        {
          $limit: 5,
        },
        {
          $lookup: {
            from: "diets", // collection name (usually lowercase plural of model name)
            localField: "dietId",
            foreignField: "_id",
            as: "diet",
          },
        },
        {
          $unwind: "$diet",
        },
        {
          $project: {
            _id: 0,
            dietId: 1,
            userCount: 1,
            // Include fields from the diet document
            title: "$diet.title",
            description: "$diet.description",
            image: "$diet.image",
            category: "$diet.category",
            calories: "$diet.calories",
            duration: "$diet.duration",
            level: "$diet.level",
            recommended: "$diet.recommended",
            meals: "$diet.meals",
            averageRating: "$diet.averageRating",
            totalRatings: "$diet.totalRatings",
            createdAt: "$diet.createdAt",
            updatedAt: "$diet.updatedAt",
          },
        },
      ]);
  
      return BaseService.sendSuccessResponse({ message: result });
    } catch (error) {
      console.error("Error fetching popular diet plans:", error);
      return BaseService.sendFailedResponse({
        error: "Failed to fetch popular diet plans",
      });
    }
  }  
  async searchDietByTitle(req) {
    try {
      const { title } = req.query;

      if (!title) {
        return BaseService.sendFailedResponse({
          error: "Title query parameter is required",
        });
      }

      const diets = await DietModel.find({
        title: { $regex: title, $options: "i" },
      })
        .populate("category")
        .lean();

      const enrichedDiets = await Promise.all(
        diets.map(async (diet) => {
          const usersOnDietCount = await DietActionModel.countDocuments({
            dietId: diet._id,
          });
          const numberOfRatings =
            diet.totalRatings || diet.ratings?.length || 0;
          return {
            ...diet,
            usersOnDietCount,
            numberOfRatings,
          };
        })
      );

      return BaseService.sendSuccessResponse({
        message: enrichedDiets,
      });
    } catch (error) {
      console.error("Error in searchDietByTitle:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async getDietByCategory(req) {
    try {
      const { id } = req.params;
      if(!mongoose.isValidObjectId(id)){
        return BaseService.sendFailedResponse({error: 'Provide a valid id'})
      }
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if (!id) {
        return BaseService.sendFailedResponse({
          error: "Category ID is required",
        });
      }

      const [diets, totalCount] = await Promise.all([
        DietModel.find({ category: id })
          .populate("category")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        DietModel.countDocuments({ category: id }),
      ]);

      const enrichedDiets = await Promise.all(
        diets.map(async (diet) => {
          const usersOnDietCount = await DietActionModel.countDocuments({
            dietId: diet._id,
          });
          const numberOfRatings =
            diet.totalRatings || diet.ratings?.length || 0;
          return {
            ...diet,
            usersOnDietCount,
            numberOfRatings,
          };
        })
      );

      const totalPages = Math.ceil(totalCount / limit);

      return BaseService.sendSuccessResponse({
        message: "Diets fetched successfully.",
        data: {
          diets: enrichedDiets,
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
  async getCompletedPlans(req) {
    try {
      const userId = req.user.id;
      const today = moment().startOf("day").toDate();

      // Get plans that are either marked as completed OR have expired
      const completedPlans = await DietActionModel.find({
        userId,
        $or: [{ status: "completed" }, { endDate: { $lte: today } }],
      }).populate("dietId");

      return BaseService.sendSuccessResponse({
        message: "Completed diet plans fetched successfully",
        plans: completedPlans,
      });
    } catch (error) {
      console.error("Error fetching completed plans:", error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getTotalCompletedPlans(req) {
    try {
      const userId = req.user.id;
      const today = moment().startOf("day").toDate();

      // Get plans that are either marked as completed OR have expired
      const completedPlans = await DietActionModel.find({
         status: "completed"})
         .populate("dietId");

      return BaseService.sendSuccessResponse({
        message: "Completed diet plans fetched successfully",
        completedPlans: completedPlans,
      });
    } catch (error) {
      console.error("Error fetching completed plans:", error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getDietMeals(req) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const dietAction = await DietActionModel.findOne({
        userId,
        dietId: id,
      });

      if (!dietAction) {
        return BaseService.sendFailedResponse({
          error: "Diet action not found for this user",
        });
      }

      const todayDate = moment().format("YYYY-MM-DD");

      const todayMealDay = dietAction.dailyMealBreakdown.find(
        (day) => moment(day.day).format("YYYY-MM-DD") === todayDate
      );

      if (!todayMealDay) {
        return BaseService.sendFailedResponse({
          error: "No meals scheduled for today",
        });
      }

      return BaseService.sendSuccessResponse({
        message: todayMealDay.meals,
      });
    } catch (error) {
      console.error("Error fetching today's meals:", error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async rateDietPlan(req) {
    try {
      const userId = req.user.id;
      const { dietId, rating, review } = req.body;

      if (!mongoose.Types.ObjectId.isValid(dietId)) {
        return BaseService.sendFailedResponse({ error: "Invalid dietId" });
      }

      if (!rating || rating < 1 || rating > 5) {
        return BaseService.sendFailedResponse({
          error: "Rating must be between 1 and 5",
        });
      }

      const diet = await DietModel.findById(dietId);
      if (!diet) {
        return BaseService.sendFailedResponse({ error: "Diet not found" });
      }

      // Check if user already rated
      const existing = diet.ratings.find(
        (r) => r.userId.toString() === userId.toString()
      );
      if (existing) {
        return BaseService.sendFailedResponse({
          error: "You have already rated this plan",
        });
      }

      // Add rating
      diet.ratings.push({ userId, rating, review });

      // Recalculate average
      const totalRatings = diet.ratings.length;
      const averageRating = (
        diet.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      ).toFixed(2);

      diet.averageRating = Number(averageRating);
      diet.totalRatings = totalRatings;

      await diet.save();

      return BaseService.sendSuccessResponse({
        message: "Diet rated successfully",
      });
    } catch (error) {
      console.error("Error fetching completed plans:", error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
}

module.exports = DietServicee;
