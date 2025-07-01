const DietModel = require("../models/diet.model");
const { empty } = require("../util");
const validateData = require("../util/validate");
const BaseService = require("./base");

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

      // Check if the diet already exists
      const existingDiet = await DietModel.findOne({
        title: post.title,
      });
      if (existingDiet) {
        return BaseService.sendFailedResponse({
          error: "Diet with this title already exists",
        });
      }
      // Create a new diet
      const diet = new DietModel({
        title: post.title,
        description: post.description,
        category: post.category,
        duration: post.duration,
        calories: post.calories,
        tags: post.tags,
        difficulty: post.difficulty,
        tasks: post.tasks,
        image: {
          imageUrl: post.image.imageUrl,
          publicId: post.image.publicId,
        },
        dailyMealBreakdown: post.dailyMealBreakdown,
      });
      // Save the diet to the database
      const savedDiet = await diet.save();

      return BaseService.sendSuccessResponse({
        message: "Diet created successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }

  async getAllDiets(req){
    try {
        const allDiet = await DietModel.find({})
            .populate("category")
            .sort({ createdAt: -1 });
        return BaseService.sendSuccessResponse({message: allDiet});
    } catch (error) {
        return BaseService.sendFailedResponse({
          error: "An error occurred while fetching diets.",
        });
    }
  }
  async getDiet(req){
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
  async updateDiet(req){
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
            return BaseService.sendFailedResponse({ error: "Failed to update diet" });
        }
        return BaseService.sendSuccessResponse({ message: 'Diet updated successfully' });
    } catch (error) {
        return BaseService.sendFailedResponse({
          error: "An error occurred while updating diet.",
        });
    }
  }
  async deleteDiet(req){
    try {
        const dietId = req.params.id;

        const diet = await DietModel.findById(dietId);
        if (!diet) {
            return BaseService.sendFailedResponse({ error: "Diet not found" });
        }
        
        const deleteDiet = await DietModel.findByIdAndDelete(dietId);
        return BaseService.sendSuccessResponse({ message: 'Diet deleted successfully' });
    } catch (error) {
        return BaseService.sendFailedResponse({
          error: "An error occurred while deleting diets.",
        });
    }
  }
}

module.exports = DietServicee;
