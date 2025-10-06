const CartModel = require("../models/cart.model");
const OrderModel = require("../models/order.model");
const { DELIVERY_CHARGE } = require("../util/constants");
const validateData = require("../util/validate");
const BaseService = require("./base");

class OrderService extends BaseService {
  async createOrder(req) {
    try {
      const userId = req.user.id;
      const post = req.body;
  
      const validateRule = {
        paymentMethod: "string|required",
        shippingAddress: "object|required",
        "shippingAddress.address": "string|required",
        "shippingAddress.fullName": "string|required",
        "shippingAddress.phoneNumber": "string|required",
        "shippingAddress.city": "string|required",
        "shippingAddress.deliveryNote": "string|required",
        "shippingAddress.region": "string|required",
      };
  
      const validateMessage = {
        required: ":attribute is required",
      };
  
      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }
  
      const cart = await CartModel.findOne({ user: userId }).populate("items.product");
      if (!cart || cart.items.length === 0) {
        return BaseService.sendFailedResponse({ error: "Cart is empty" });
      }
  
      let totalAmount = 0;
  
      const orderItems = cart.items.map((item) => {
        const variation = item.product.variations.find(
          (v) => v.color === item.color && v.size === item.size
        );
  
        const price = variation && variation.price ? variation.price : item.product.price;
  
        totalAmount += price * item.quantity;
  
        return {
          product: item.product._id,
          quantity: item.quantity,
          price,
          size: item.size,
          color: item.color,
        };
      });
  
      totalAmount = parseFloat(totalAmount.toFixed(2)) + DELIVERY_CHARGE;
  
      const newOrder = await OrderModel.create({
        userId,
        paymentMethod: post.paymentMethod,
        items: orderItems,
        totalAmount,
        shippingAddress: post.shippingAddress,
      });
  
      await CartModel.findOneAndUpdate({ user: userId }, { items: [] });
  
      return BaseService.sendSuccessResponse({
        message: "Order created successfully",
        order: newOrder,
      });
    } catch (error) {
      console.error("Create order error:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }  
  async getUserOrders(req){
    try {
        const userId = req.user.id;
        const orders = await OrderModel.find({ userId: userId }).sort("-createdAt").populate("items.product");
        return BaseService.sendSuccessResponse({
          message: orders
        });
    } catch (error) {
        return BaseService.sendFailedResponse({
          error: this.server_error_message,
        });
    }
  }
  async getOrderById(req){
    try {
        const userId = req.user.id;
        const orderId = req.params.id;
        const order = await OrderModel.findOne({
            _id: orderId,
            userId: userId,
          })
          .populate("items.product");

        return BaseService.sendSuccessResponse({
          message: order
        });
    } catch (error) {
        return BaseService.sendFailedResponse({
          error: this.server_error_message,
        });
    }
  }
  async getAllOrders(req){
    try {
        const userId = req.user.id;
        const filter = req.query.status ? {orderStatus: req.query.status} : {};
        const orders = await OrderModel.find(filter).sort("-createdAt").populate("items.product");
        return BaseService.sendSuccessResponse({
          message: orders
        });
    } catch (error) {
        return BaseService.sendFailedResponse({
          error: this.server_error_message,
        });
    }
  }
}

module.exports = OrderService;
