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
        "dailyMealBreakdown.*.breakfastTitle": "string|required",
        "dailyMealBreakdown.*.mealType":
          "string|required|in:breakfast,lunch,dinner",
        "dailyMealBreakdown.*.crabs": "integer|required",
        "dailyMealBreakdown.*.protein": "integer|required",
        "dailyMealBreakdown.*.fats": "integer|required",
        "dailyMealBreakdown.*.calories": "integer|required",
        "dailyMealBreakdown.*.recommendedTime": "string|required",
        "dailyMealBreakdown.*.missedBy": "string|required",
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

      console.log(
        {
          duration: post.duration,
          dailyMealBreakdown: post.dailyMealBreakdown.length,
        },
        post.duration < post.dailyMealBreakdown,
        "post data"
      );
      if (post.duration > post.dailyMealBreakdown.length) {
        return BaseService.sendFailedResponse({
          error: "Duration cannot be less than the number of daily meals",
        });
      }

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

      const [allDiet, totalCount] = await Promise.all([
        DietModel.find({})
          .populate("category")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        DietModel.countDocuments(),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return BaseService.sendSuccessResponse({
        message: "Diets fetched successfully.",
        data: {
          diets: allDiet,
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

      const diet = await DietModel.findById(dietId);
      if (!diet) {
        return BaseService.sendFailedResponse({ error: "Diet not found" });
      }

      return BaseService.sendSuccessResponse({ message: diet });
    } catch (error) {
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

      const diet = await DietModel.findById(post.dietId);
      if (!diet) {
        return BaseService.sendFailedResponse({
          error: "Diet not found",
        });
      }

      const alreadyJoined = await DietActionModel.findOne({
        userId,
        dietId: post.dietId,
      });

      if (alreadyJoined) {
        return BaseService.sendSuccessResponse({
          message: "You have already joined this diet plan",
        });
      }

      // Calculate start and end dates
      const startDate = moment();
      const endDate = startDate.clone().add(diet.duration - 1, "days");

      // Add day fields to the dailyMealBreakdown (e.g., "Day 1", "Day 2", etc.)
      const breakdownWithDays = diet.dailyMealBreakdown.map((item, index) => ({
        ...(item.toObject?.() ?? item),
        day: `Day ${index + 1}`,
      }));

      const newUserDiet = new DietActionModel({
        userId,
        dietId: post.dietId,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        dailyMealBreakdown: breakdownWithDays,
      });

      await newUserDiet.save();
      await newUserDiet.populate("dietId");

      return BaseService.sendSuccessResponse({
        message: "Diet joined successfully",
        diet: newUserDiet,
      });
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

      const dietTask = dietAction.dailyMealBreakdown.find(
        (task) => task._id.toString() === post.dietTaskId.toString()
      );

      if (!dietTask) {
        return BaseService.sendFailedResponse({ error: "Diet task not found" });
      }

      if (dietAction.status === "completed") {
        return BaseService.sendSuccessResponse({
          message: "You have already completed this diet",
        });
      }

      if (dietTask.status === "completed" || dietTask.status === "missed") {
        return BaseService.sendSuccessResponse({
          message: `You have already marked this task as ${dietTask.status}`,
        });
      }

      const currentTime = moment().format("HH:mm:ss");
      const missedByTime = dietTask.missedBy;

      // ✅ Determine final task status
      let taskStatus = post.status;
      if (
        moment(currentTime, "HH:mm:ss").isAfter(
          moment(missedByTime, "HH:mm:ss")
        )
      ) {
        taskStatus = "missed";
      }

      dietTask.status = taskStatus;

      // ✅ Recalculate progress
      const totalTasks = dietAction.dailyMealBreakdown.length;
      const completedTasks = dietAction.dailyMealBreakdown.filter(
        (task) => task.status === "completed"
      ).length;

      const progress =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
      dietAction.progress = progress;

      const allMarked = dietAction.dailyMealBreakdown.every(
        (task) => task.status === "completed" || task.status === "missed"
      );

      const today = moment().startOf("day");
      const endDate = moment(dietAction.endDate).startOf("day");

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

      const validateResult = validateData(
        { dietId },
        validateRule,
        validateMessage
      );

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      // Fetch the diet action
      const dietAction = await DietActionModel.findOne({
        userId,
        dietId,
      });

      if (!dietAction) {
        return BaseService.sendFailedResponse({
          error: "You have not joined this diet",
        });
      }

      // Reset progress, status, and all daily task statuses
      dietAction.progress = 0;
      dietAction.status = "in-progress";

      dietAction.dailyMealBreakdown = dietAction.dailyMealBreakdown.map(
        (task) => ({
          ...task.toObject(),
          status: "in-progress",
        })
      );

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
        // status: "active",
      })
        .populate("category")
        .sort({ createdAt: -1 });
      if (empty(recommendedDiets)) {
        return BaseService.sendFailedResponse({
          error: "No recommended diets found",
        });
      }
      return BaseService.sendSuccessResponse({
        message: recommendedDiets,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async activeDiets() {
    try {
      const activeDiets = await DietModel.find({
        // recommended: "YES",
        status: "active",
      })
        .populate("category")
        .sort({ createdAt: -1 });
      if (empty(activeDiets)) {
        return BaseService.sendFailedResponse({
          error: "No active diets found",
        });
      }
      return BaseService.sendSuccessResponse({
        message: activeDiets,
      });
    } catch (error) {
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
        return BaseService.sendFailedResponse({
          error: "No diet categories found",
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
  async searchDietByTitle() {
    try {
      const { title } = req.query;

      if (!title) {
        return BaseService.sendFailedResponse({
          error: "Title query parameter is required",
        });
      }
      const diets = await DietModel.find({
        title: { $regex: title, $options: "i" },
      }).populate("category");
      return BaseService.sendSuccessResponse({
        message: diets,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async getDietByCategory() {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if (!id) {
        return BaseService.sendFailedResponse({
          error: "Category ID is required",
        });
      }

      const [allDiet, totalCount] = await Promise.all([
        DietModel.find({ category: id })
          .populate("category")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        DietModel.find({ category: id }).countDocuments(),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return BaseService.sendSuccessResponse({
        message: "Diets fetched successfully.",
        data: {
          diets: allDiet,
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

      return BaseService.sendSuccessResponse({
        message: dietAction.dailyMealBreakdown,
      });
    } catch (error) {
      console.error("Error fetching completed plans:", error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async rateDietMeals(req) {
    try {
      const userId = req.user.id;
      const { dietId, rating, review } = req.body;

      if (!mongoose.Types.ObjectId.isValid(dietId)) {
        return BaseService.sendFailedResponse({error: "Invalid dietId" });
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
        message: "Diet rated successfully"
      });
    } catch (error) {
      console.error("Error fetching completed plans:", error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
}

module.exports = DietServicee;
