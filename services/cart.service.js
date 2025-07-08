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
        quantity: "integer|requred|min:1",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { productId, quantity } = post;

      const product = await ProductModel.findById(productId);
      if (!product) {
        return BaseService.sendFailedResponse({ error: "Product not found" });
      }

      let cart = await CartModel.findOne({ user: userId });

      if (!cart) {
        cart = new CartModel({
          user: userId,
          items: [{ product: productId, quantity }],
        });
      } else {
        const itemIndex = cart.items.findIndex(
          (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += quantity;
        } else {
          cart.items.push({ product: productId, quantity });
        }
      }

      // Recalculate totals
      let totalItems = 0;
      let totalPrice = 0;

      for (const item of cart.items) {
        const p = await ProductModel.findById(item.product);
        totalItems += item.quantity;
        totalPrice += p.price * item.quantity;
      }

      cart.totalItems = totalItems;
      cart.totalPrice = totalPrice;

      await cart.save();

      return BaseService.sendSuccessResponse({
        message: "Product added to cart successfully",
      });
    } catch (error) {
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
      };
      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };
      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }
      const { productId } = post;
      let cart = await CartModel.findOne({ user: userId });
      if (!cart) {
        return BaseService.sendFailedResponse({ error: "Cart not found" });
      }
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );

      // Recalculate totals
      let totalItems = 0;
      let totalPrice = 0;

      for (const item of cart.items) {
        const p = await ProductModel.findById(item.product);
        totalItems += item.quantity;
        totalPrice += p.price * item.quantity;
      }

      cart.totalItems = totalItems;
      cart.totalPrice = totalPrice;

      await cart.save();
      return BaseService.sendSuccessResponse({
        message: "Product removed from cart successfully",
      });
    } catch (error) {
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
      };
      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };
      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }
      const { productId, quantity } = post;
      let cart = await CartModel.findOne({ user: userId });
      if (!cart) {
        return BaseService.sendFailedResponse({ error: "Cart not found" });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        return BaseService.sendFailedResponse({ error: "Product not in cart" });
      }

      // Recalculate totals
      let totalItems = 0;
      let totalPrice = 0;

      for (const item of cart.items) {
        const p = await ProductModel.findById(item.product);
        totalItems += item.quantity;
        totalPrice += p.price * item.quantity;
      }

      cart.totalItems = totalItems;
      cart.totalPrice = totalPrice;

      await cart.save();
      return BaseService.sendSuccessResponse({
        message: "Cart updated successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
}

module.exports = CartService;
