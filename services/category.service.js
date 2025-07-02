const DietCategoryModel = require("../models/dietCategory.model");
const validateData = require("../util/validate");
const BaseService = require("./base");

class CategoryService extends BaseService {
  async createCategory(req) {
    try {
      const post = req.body;

      const validateRule = {
        title: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const existingCategory = await DietCategoryModel.findOne({
        title: post.title,
      });
      if (existingCategory) {
        return BaseService.sendFailedResponse({
          error: "Category with this title already exists",
        });
      }
      const newCategory = new DietCategoryModel(post);
      await newCategory.save();
      return BaseService.sendSuccessResponse({
        message: "Category created successfully",
      });
    } catch (error) {
      console.error(error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getCategories() {
    try {
      const categories = await DietCategoryModel.find({});
      return BaseService.sendSuccessResponse({ message: categories });
    } catch (error) {
      console.error(error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getCategoryById(req) {
    try {
      const { id } = req.params;
      const category = await DietCategoryModel.findById(id);
      if (!category) {
        return BaseService.sendFailedResponse({ error: "Category not found" });
      }
      return BaseService.sendSuccessResponse({ message: category });
    } catch (error) {
      console.error(error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async updateCategory(req) {
    try {
      const { id } = req.params;
      const post = req.body;

      const category = await DietCategoryModel.findById(id);
      if (!category) {
        return BaseService.sendFailedResponse({ error: "Category not found" });
      }

      const existingCategory = await DietCategoryModel.findOne({
        title: post.title,
        _id: { $ne: id },
      });
      if (existingCategory) {
        return BaseService.sendFailedResponse({
          error: "Category with this title already exists",
        });
      }

      if (post.title) {
        category.title = post.title;
        await category.save();
      }
      return BaseService.sendSuccessResponse({
        message: "Category updated successfully",
      });
    } catch (error) {
      console.error(error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async deleteCategory(req) {
    try {
      const { id } = req.params;
      const category = await DietCategoryModel.findById(id);
      if (!category) {
        return BaseService.sendFailedResponse({ error: "Category not found" });
      }
      await DietCategoryModel.findByIdAndDelete(id);
      return BaseService.sendSuccessResponse({
        message: `Category with ID ${id} deleted successfully`,
      });
    } catch (error) {
      console.error(error);
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }
}

module.exports = CategoryService;
