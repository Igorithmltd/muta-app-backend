const CartModel = require("../models/cart.model");
const ProductModel = require("../models/product.model");
const validateData = require("../util/validate");
const BaseService = require("./base");

class CartService extends BaseService {
  async addToCart(req) {
    try {
      const post = req.body;
      const userId = req.user.id;
  
      const validateRule = {
        productId: "string|required",
        quantity: "integer|required|min:1",
        color: "string|required",
        size: "string|required",
      };
  
      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };
  
      const validateResult = validateData(post, validateRule, validateMessage);
  
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }
  
      const { productId, quantity, color, size } = post;
  
      const product = await ProductModel.findById(productId);
      if (!product) {
        return BaseService.sendFailedResponse({ error: "Product not found" });
      }
  
      // ✅ Find matching variation
      const variation = product.variations.find(
        (v) => v.color === color && v.size === size
      );
  
      if (!variation) {
        return BaseService.sendFailedResponse({
          error: "Product variation not found",
        });
      }
  
      if (variation.stock < quantity) {
        return BaseService.sendFailedResponse({
          error: `Only ${variation.stock} in stock for selected variation`,
        });
      }
  
      let cart = await CartModel.findOne({ user: userId });
  
      if (!cart) {
        // Create new cart
        cart = new CartModel({
          user: userId,
          items: [
            {
              product: productId,
              quantity,
              color,
              size,
              price: variation.price || product.price,
            },
          ],
        });
      } else {
        // Check if the same variation already exists in the cart
        const itemIndex = cart.items.findIndex(
          (item) =>
            item.product.toString() === productId &&
            item.color === color &&
            item.size === size
        );
  
        if (itemIndex > -1) {
          const existingQty = cart.items[itemIndex].quantity;
          const newQty = existingQty + quantity;
  
          if (newQty > variation.stock) {
            return BaseService.sendFailedResponse({
              error: `Only ${variation.stock} in stock for selected variation`,
            });
          }
  
          cart.items[itemIndex].quantity = newQty;
        } else {
          // Add new item
          cart.items.push({
            product: productId,
            quantity,
            color,
            size,
            price: variation.price || product.price,
          });
        }
      }
  
      // ✅ Recalculate totals
      let totalItems = 0;
      let totalPrice = 0;
  
      for (const item of cart.items) {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
      }
  
      cart.totalItems = totalItems;
      cart.totalPrice = totalPrice;
  
      await cart.save();
  
      return BaseService.sendSuccessResponse({
        message: "Product added to cart successfully",
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }  
  async removeFromCart(req) {
    try {
      const userId = req.user.id;
      const post = req.body;
  
      const validateRule = {
        productId: "string|required",
        color: "string|required",
        size: "string|required",
      };
  
      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };
  
      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }
  
      const { productId, color, size } = post;
  
      let cart = await CartModel.findOne({ user: userId });
      if (!cart) {
        return BaseService.sendFailedResponse({ error: "Cart not found" });
      }
  
      const prevCount = cart.items.length;
  
      cart.items = cart.items.filter(
        (item) =>
          item.product.toString() !== productId ||
          item.color !== color ||
          item.size !== size
      );
  
      if (cart.items.length === prevCount) {
        return BaseService.sendFailedResponse({
          error: "Item not found in cart",
        });
      }
  
      // Recalculate totals
      let totalItems = 0;
      let totalPrice = 0;
  
      for (const item of cart.items) {
        const p = await ProductModel.findById(item.product);
        const variation = p?.variations.find(
          (v) => v.color === item.color && v.size === item.size
        );
  
        const itemPrice = variation?.price || p?.price || 0;
  
        totalItems += item.quantity;
        totalPrice += itemPrice * item.quantity;
      }
  
      cart.totalItems = totalItems;
      cart.totalPrice = totalPrice;
  
      await cart.save();
  
      return BaseService.sendSuccessResponse({
        message: "Product variation removed from cart successfully",
      });
    } catch (error) {
      console.error("Remove from cart error:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }  
  async updateCart(req) {
    try {
      const userId = req.user.id;
      const post = req.body;
  
      const validateRule = {
        productId: "string|required",
        quantity: "integer|required|min:1",
        color: "string|required",
        size: "string|required",
      };
  
      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
        "integer.integer": ":attribute must be an integer.",
      };
  
      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }
  
      const { productId, quantity, color, size } = post;
  
      let cart = await CartModel.findOne({ user: userId });
      if (!cart) {
        return BaseService.sendFailedResponse({ error: "Cart not found" });
      }
  
      // Find item index with matching product + color + size
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.color === color &&
          item.size === size
      );
  
      if (itemIndex === -1) {
        return BaseService.sendFailedResponse({ error: "Product variation not in cart" });
      }
  
      // Update quantity for the matched variation
      cart.items[itemIndex].quantity = quantity;
  
      // Recalculate totals using variation price if available
      let totalItems = 0;
      let totalPrice = 0;
  
      for (const item of cart.items) {
        const p = await ProductModel.findById(item.product);
        const variation = p?.variations.find(
          (v) => v.color === item.color && v.size === item.size
        );
        const itemPrice = variation?.price || p?.price || 0;
  
        totalItems += item.quantity;
        totalPrice += itemPrice * item.quantity;
      }
  
      cart.totalItems = totalItems;
      cart.totalPrice = totalPrice;
  
      await cart.save();
  
      return BaseService.sendSuccessResponse({
        message: "Cart updated successfully",
      });
    } catch (error) {
      console.error("Update cart error:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }  
  async getCart(req) {
    try {
      const userId = req.user.id;
  
      let cart = await CartModel.findOne({ user: userId })
        .populate({
          path: 'items.product',
          // select: 'title price images variations', // Select fields you want
        });
  
      if (!cart) {
        // Optionally create an empty cart response instead of error
        return BaseService.sendSuccessResponse({
          cart: {
            items: [],
            totalItems: 0,
            totalPrice: 0,
          },
        });
        // Or if you prefer, return failure:
        // return BaseService.sendFailedResponse({ error: "Cart not found" });
      }
  
      return BaseService.sendSuccessResponse({
        cart,
      });
    } catch (error) {
      console.error('Get cart error:', error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  
}

module.exports = CartService;
