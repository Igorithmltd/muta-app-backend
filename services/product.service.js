const ProductModel = require("../models/product.model");
const ProductCategoryModel = require("../models/productCategory.model");
const validateData = require("../util/validate");
const BaseService = require("./base");

class ProductService extends BaseService {
  async createProduct(req) {
    try {
      const post = req.body;
      const validateRule = {
        title: "string|required",
        description: "string|required",
        price: "integer|required",
        category: "string|required",
        color: "string|required",
        size: "string|required",
        stock: "integer|required",
        image: "object|required",
      };
      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
        "integer.integer": ":attribute must be a integer.",
      };

      const validateResult = validateData(
        post,
        validateRule,
        validateMessage
      );
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const existingProduct = await ProductModel.findOne({
        title: post.title,
      });
      if (existingProduct) {
        return BaseService.sendFailedResponse({
          error: "Product with this title already exists",
        });
      }
        const newProduct = new ProductModel(post);
        await newProduct.save();
      return BaseService.sendSuccessResponse({
        message: "Product created successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getAllProducts(req){
    try {
        const filter = req.query.category ? {category: req.query.category} : {}
        const allProducts = await ProductModel.find(filter)
        return BaseService.sendSuccessResponse({message: allProducts})
    } catch (error) {
        return BaseService.sendFailedResponse({error: this.server_error_message})
    }
  }
  async updateProduct(req){
    try {
      const { id } = req.params;
      const post = req.body;

      const product = await ProductModel.findById(id);
      if (!product) {
        return BaseService.sendFailedResponse({
          error: "Product not found",
        });
      }

      const existingProduct = await ProductModel.findOne({
        title: post.title,
        _id: {$ne: id}
      });

      if(existingProduct){
        return BaseService.sendFailedResponse({error: 'Product with this title already exists'})
      }

      await ProductModel.updateOne({ _id: id }, post);
      return BaseService.sendSuccessResponse({
        message: "Product updated successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getProduct(req){
    try {
      const { id } = req.params;

      const product = await ProductModel.findById(id);
      if (!product) {
        return BaseService.sendFailedResponse({
          error: "Product not found",
        });
      }

      return BaseService.sendSuccessResponse({message: product});
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async deleteProduct(req){
    try {
      const { id } = req.params;

      if (!product) {
        return BaseService.sendFailedResponse({
          error: "Product not found",
        });
      }
      const product = await ProductModel.findByIdAndDelete(id);

      return BaseService.sendSuccessResponse({message: 'Product deleted successfully'});
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }

  async createProductCategory(req) {
    try {
      const post = req.body;
      const validateRule = {
        title: "string|required",
      };
      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
        "integer.integer": ":attribute must be a integer.",
      };

      const validateResult = validateData(
        post,
        validateRule,
        validateMessage
      );
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const existingProductCategory = await ProductCategoryModel.findOne({
        title: post.title,
      });
      if (existingProductCategory) {
        return BaseService.sendFailedResponse({
          error: "Product with this title already exists",
        });
      }
        const newProductCategory = new ProductCategoryModel(post);
        await newProductCategory.save();
      return BaseService.sendSuccessResponse({
        message: "Product category created successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getAllProductsCategories(req){
    try {
        const allProductsCategory = await ProductCategoryModel.find()
        return BaseService.sendSuccessResponse({message: allProductsCategory})
    } catch (error) {
        return BaseService.sendFailedResponse({error: this.server_error_message})
    }
  }
  async updateProductCategory(req){
    try {
      const { id } = req.params;
      const post = req.body;

      const productCategory = await ProductCategoryModel.findById(id);
      if (!productCategory) {
        return BaseService.sendFailedResponse({
          error: "Product category not found",
        });
      }

      const existingProductCategory = await ProductModel.findOne({
        title: post.title,
        _id: {$ne: id}
      });

      if(existingProductCategory){
        return BaseService.sendFailedResponse({error: 'Product category with this title already exists'})
      }

      await ProductCategoryModel.updateOne({ _id: id }, post);
      return BaseService.sendSuccessResponse({
        message: "Product category updated successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getProductCategory(req){
    try {
      const { id } = req.params;

      const productCategory = await ProductModel.findById(id);
      if (!productCategory) {
        return BaseService.sendFailedResponse({
          error: "Product category not found",
        });
      }

      return BaseService.sendSuccessResponse({message: productCategory});
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async deleteProductCategory(req){
    try {
      const { id } = req.params;

      if (!productCategory) {
        return BaseService.sendFailedResponse({
          error: "Product not found",
        });
      }
      const productCategory = await ProductCategoryModel.findByIdAndDelete(id);

      return BaseService.sendSuccessResponse({message: 'Product category deleted successfully'});
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }

}

module.exports = ProductService;
