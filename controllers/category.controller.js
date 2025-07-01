const CategoryService = require("../services/category.service");
const BaseController = require("./base");

class CategoryController extends BaseController {
    constructor() {
        super();
        this.categoryService = new CategoryService();
    }

    async createCategory(req, res) {
        const createCategory = await this.categoryService.createCategory(req)
        if(!createCategory.success){
            return BaseController.sendFailedResponse(res, createCategory.data)
        }
        return BaseController.sendSuccessResponse(res, createCategory.data)
    }
    
    async getCategories(req, res) {
        const getCategories = await this.categoryService.getCategories(req)
        if(!getCategories.success){
            return BaseController.sendFailedResponse(res, getCategories.data)
        }
        return BaseController.sendSuccessResponse(res, getCategories.data)
    }
    
    async getCategoryById(req, res) {
        const getCategoryById = await this.categoryService.getCategoryById(req)
        if(!getCategoryById.success){
            return BaseController.sendFailedResponse(res, getCategoryById.data)
        }
        return BaseController.sendSuccessResponse(res, getCategoryById.data)
    }
    
    async updateCategory(req, res) {
        const updateCategory = await this.categoryService.updateCategory(req)
        if(!updateCategory.success){
            return BaseController.sendFailedResponse(res, updateCategory.data)
        }
        return BaseController.sendSuccessResponse(res, updateCategory.data)
    }
    
    async deleteCategory(req, res) {
        const deleteCategory = await this.categoryService.deleteCategory(req)
        if(!deleteCategory.success){
            return BaseController.sendFailedResponse(res, deleteCategory.data)
        }
        return BaseController.sendSuccessResponse(res, deleteCategory.data)
    }
}
module.exports = CategoryController;