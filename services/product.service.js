const { default: mongoose } = require("mongoose");
const ProductModel = require("../models/product.model");
const ProductCategoryModel = require("../models/productCategory.model");
const UserModel = require("../models/user.model");
const validateData = require("../util/validate");
const BaseService = require("./base");
const FavoriteProductModel = require("../models/favorite.model");

class ProductService extends BaseService {
  async createProduct(req) {
    try {
      const post = req.body;
  
      // Validate main product fields
      const validateRule = {
        title: "string|required",
        description: "string|required",
        price: "integer|required",
        category: "string|required",
        keyFeatures: "array|required",
        images: "array|required",
        variations: "array|required|min:1",
      };
  
      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
        "integer.integer": ":attribute must be an integer.",
        "array.array": ":attribute must be an array.",
      };
  
      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }
  
      // Extra manual validation for variations
      for (const variation of post.variations) {
        if (
          !variation.color ||
          !variation.size ||
          typeof variation.stock !== 'number'
        ) {
          return BaseService.sendFailedResponse({
            error: "Each variation must have color, size, and stock (number)",
          });
        }
      }
  
      // Check if product already exists
      const existingProduct = await ProductModel.findOne({
        title: post.title,
      });
  
      if (existingProduct) {
        return BaseService.sendFailedResponse({
          error: "Product with this title already exists",
        });
      }
  
      // Create and save the product
      const newProduct = new ProductModel(post);
      await newProduct.save();
  
      return BaseService.sendSuccessResponse({
        message: "Product created successfully",
      });
  
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse(this.server_error_message);
    }
  }  
  async getAllProducts(req) {
    try {
      const filter = req.query.category ? { category: req.query.category } : {};
      const allProducts = await ProductModel.find(filter)
      .populate('category');
      return BaseService.sendSuccessResponse({ message: allProducts });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async updateProduct(req) {
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
        _id: { $ne: id },
      });

      if (existingProduct) {
        return BaseService.sendFailedResponse({
          error: "Product with this title already exists",
        });
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
  async getProduct(req) {
    try {
      const { id } = req.params;

      const product = await ProductModel.findById(id)
      .populate('category');
      if (!product) {
        return BaseService.sendFailedResponse({
          error: "Product not found",
        });
      }

      return BaseService.sendSuccessResponse({ message: product });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async deleteProduct(req) {
    try {
      const { id } = req.params;

      if (!product) {
        return BaseService.sendFailedResponse({
          error: "Product not found",
        });
      }
      const product = await ProductModel.findByIdAndDelete(id);

      return BaseService.sendSuccessResponse({
        message: "Product deleted successfully",
      });
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

      const validateResult = validateData(post, validateRule, validateMessage);
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
  async getAllProductsCategories(req) {
    try {
      const allProductsCategory = await ProductCategoryModel.find();
      return BaseService.sendSuccessResponse({ message: allProductsCategory });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async updateProductCategory(req) {
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
        _id: { $ne: id },
      });

      if (existingProductCategory) {
        return BaseService.sendFailedResponse({
          error: "Product category with this title already exists",
        });
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
  async getProductCategory(req) {
    try {
      const { id } = req.params;

      const productCategory = await ProductModel.findById(id);
      if (!productCategory) {
        return BaseService.sendFailedResponse({
          error: "Product category not found",
        });
      }

      return BaseService.sendSuccessResponse({ message: productCategory });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async deleteProductCategory(req) {
    try {
      const { id } = req.params;

      if (!productCategory) {
        return BaseService.sendFailedResponse({
          error: "Product not found",
        });
      }
      const productCategory = await ProductCategoryModel.findByIdAndDelete(id);

      return BaseService.sendSuccessResponse({
        message: "Product category deleted successfully",
      });
    } catch (error) {
      console.log(error, "the error");
      BaseService.sendFailedResponse(this.server_error_message);
    }
  }
  async getFavorites(req) {
    try {
      const userId = req.user.id;
  
      // Find or create the user's favorite record
      let favorites = await FavoriteProductModel.find({ userId })
      .populate('product');
  
      return BaseService.sendSuccessResponse({
        message: favorites,
      });
    } catch (error) {
      console.error("Add to favorites error:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async addProductToFavorites(req) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
  
      // Ensure product exists
      const product = await ProductModel.findById(productId);
      if (!product) {
        return BaseService.sendFailedResponse({ error: "Product not found" });
      }
  
      // Find or create the user's favorite record
      let favoriteRecord = await FavoriteProductModel.findOne({ userId });
  
      if (favoriteRecord) {
        // Check if already favorited
        if (favoriteRecord.product.includes(productId)) {
          return BaseService.sendSuccessResponse({
            message: "Product is already in favorites",
          });
        }
  
        // Add product to existing favorites
        favoriteRecord.product.push(productId);
      } else {
        // Create new favorite record
        favoriteRecord = new FavoriteProductModel({
          userId,
          product: [productId],
        });
      }
  
      await favoriteRecord.save();
  
      return BaseService.sendSuccessResponse({
        message: "Product added to favorites",
      });
    } catch (error) {
      console.error("Add to favorites error:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async removeFavoriteProduct(req) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
  
      const favoriteRecord = await FavoriteProductModel.findOne({ userId });
  
      if (!favoriteRecord || !favoriteRecord.product.includes(productId)) {
        return BaseService.sendFailedResponse({
          message: "Product is not in favorites",
        });
      }
  
      // Filter out the productId
      favoriteRecord.product = favoriteRecord.product.filter(
        (favId) => favId.toString() !== productId
      );
      await favoriteRecord.save();
  
      return BaseService.sendSuccessResponse({
        message: "Product removed from favorites",
      });
    } catch (error) {
      console.error("Remove from favorites error:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async reviewProduct(req) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { rating, comment } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return BaseService.sendFailedResponse({ error: "Invalid product ID" });
      }

      if (!rating || rating < 1 || rating > 5) {
        return BaseService.sendFailedResponse({
          error: "Rating must be between 1 and 5",
        });
      }

      const product = await ProductModel.findById(id);
      if (!product)
        return BaseService.sendFailedResponse({ error: "Product not found" });

      // Check if user has already reviewed
      const existingReviewIndex = product.reviews.findIndex(
        (r) => r.user.toString() === userId
      );

      if (existingReviewIndex !== -1) {
        // Update existing review
        product.reviews[existingReviewIndex].rating = rating;
        product.reviews[existingReviewIndex].comment =
          comment || product.reviews[existingReviewIndex].comment;
        product.reviews[existingReviewIndex].createdAt = new Date();
      } else {
        // Add new review
        product.reviews.push({
          user: userId,
          rating,
          comment,
          createdAt: new Date(),
        });
      }

      // Recalculate average rating and number of reviews
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => acc + item.rating, 0) /
        product.numReviews;

      await product.save();

      return BaseService.sendSuccessResponse({
        message: "Review added successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async getAllProductReview(req) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return BaseService.sendFailedResponse({ error: "Invalid product ID" });
      }

      const product = await ProductModel.findById(id).select("reviews");

      if (!product)
        return BaseService.sendFailedResponse({ error: "Product not found" });

      return BaseService.sendSuccessResponse({
        message: product.reviews,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
}

module.exports = ProductService;
