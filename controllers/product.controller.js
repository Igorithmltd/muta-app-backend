
const ProductService = require("../services/product.service");
const  BaseController = require("./base");

class ProductController extends BaseController{
    async createProduct(req, res){
        const productService = new ProductService()
        const createProduct = await productService.createProduct(req)
        if(!createProduct.success){
            return BaseController.sendFailedResponse(res, createProduct.data)
        }
        return BaseController.sendSuccessResponse(res, createProduct.data)
    }
    async getProduct(req, res){
        const productService = new ProductService()
        const getProduct = await productService.getProduct(req)
        if(!getProduct.success){
            return BaseController.sendFailedResponse(res, getProduct.data)
        }
        return BaseController.sendSuccessResponse(res, getProduct.data)
    }
    async getAllProducts(req, res){
        const productService = new ProductService()
        const getAllProducts = await productService.getAllProducts(req)
        if(!getAllProducts.success){
            return BaseController.sendFailedResponse(res, getAllProducts.data)
        }
        return BaseController.sendSuccessResponse(res, getAllProducts.data)
    }
    async updateProduct(req, res){
        const productService = new ProductService()
        const updateProduct = await productService.updateProduct(req)
        if(!updateProduct.success){
            return BaseController.sendFailedResponse(res, updateProduct.data)
        }
        return BaseController.sendSuccessResponse(res, updateProduct.data)
    }
    async deleteProduct(req, res){
        const productService = new ProductService()
        const deleteProduct = await productService.deleteProduct(req)
        if(!deleteProduct.success){
            return BaseController.sendFailedResponse(res, deleteProduct.data)
        }
        return BaseController.sendSuccessResponse(res, deleteProduct.data)
    }

    async createProductCategory(req, res){
        const productService = new ProductService()
        const createProductCategory = await productService.createProductCategory(req)
        if(!createProductCategory.success){
            return BaseController.sendFailedResponse(res, createProductCategory.data)
        }
        return BaseController.sendSuccessResponse(res, createProductCategory.data)
    }
    async getProductCategory(req, res){
        const productService = new ProductService()
        const getProductCategory = await productService.getProductCategory(req)
        if(!getProductCategory.success){
            return BaseController.sendFailedResponse(res, getProductCategory.data)
        }
        return BaseController.sendSuccessResponse(res, getProductCategory.data)
    }
    async getAllProductCategories(req, res){
        const productService = new ProductService()
        const getAllProductCategories = await productService.getAllProductsCategories(req)
        if(!getAllProductCategories.success){
            return BaseController.sendFailedResponse(res, getAllProductCategories.data)
        }
        return BaseController.sendSuccessResponse(res, getAllProductCategories.data)
    }
    async updateProductCategory(req, res){
        const productService = new ProductService()
        const updateProductCategory = await productService.updateProductCategory(req)
        if(!updateProductCategory.success){
            return BaseController.sendFailedResponse(res, updateProductCategory.data)
        }
        return BaseController.sendSuccessResponse(res, updateProductCategory.data)
    }
    async deleteProductCategory(req, res){
        const productService = new ProductService()
        const deleteProductCategory = await productService.deleteProductCategory(req)
        if(!deleteProductCategory.success){
            return BaseController.sendFailedResponse(res, deleteProductCategory.data)
        }
        return BaseController.sendSuccessResponse(res, deleteProductCategory.data)
    }
}

module.exports = ProductController