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

    // Add day fields to the dailyMealBreakdown
    const today = moment();
    const breakdownWithDays = diet.dailyMealBreakdown.map((item, index) => ({
      ...(item.toObject?.() ?? item), // handle Mongoose subdoc if necessary
      day: today.clone().add(index, "days").format("MMMM D"),
    }));

    const newUserDiet = new DietActionModel({
      userId,
      dietId: post.dietId,
      dailyMealBreakdown: breakdownWithDays,
    });

    await newUserDiet.save();
    await newUserDiet.populate("dietId");

    return BaseService.sendSuccessResponse({
      message: "Diet joined successfully",
      diet: newUserDiet,
    });
  }
  async markDietTask(req) {
    try {
      const userId = req.user.id;
      const post = req.body;

      const validateRule = {
        dietTaskId: "string|required",
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
        return BaseService.sendFailedResponse({
          error: "Diet task not found",
        });
      }

      if (dietAction.status === "completed") {
        return BaseService.sendSuccessResponse({
          message: "You have already completed this diet",
        });
      }

      if (dietTask.status === "completed") {
        return BaseService.sendSuccessResponse({
          message: "You have already completed this task",
        });
      }

      // ✅ Mark the task as completed
      dietTask.status = "completed";

      // ✅ Recalculate progress
      const totalTasks = dietAction.dailyMealBreakdown.length;
      const completedTasks = dietAction.dailyMealBreakdown.filter(
        (task) => task.status === "completed"
      ).length;

      const progress =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
      dietAction.progress = progress;

      // ✅ Optionally update status if all tasks completed
      if (completedTasks >= totalTasks) {
        dietAction.status = "completed";
      }

      await dietAction.save();

      return BaseService.sendSuccessResponse({
        message: "Task marked as completed",
      });
    } catch (error) {
      console.log(error, "the error");
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
        return res
          .status(400)
          .json({ message: "Title query parameter is required" });
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

      if (!id) {
        return res.status(400).json({ message: "Category ID is required" });
      }

      const diets = await DietModel.find({ category: id }).populate(
        "category"
      );

      return BaseService.sendSuccessResponse({
        message: diets,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
}

module.exports = DietServicee;
