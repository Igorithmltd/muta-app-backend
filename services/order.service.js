const CartModel = require("../models/cart.model");
const OrderModel = require("../models/order.model");
const ProductModel = require("../models/product.model");
const { DELIVERY_CHARGE } = require("../util/constants");
const validateData = require("../util/validate");
const BaseService = require("./base");

class OrderService extends BaseService {
  async createOrder(req) {
    try {
      const userId = req.user.id;

      const cart = await CartModel.findOne({ user: userId }).populate("items.product");

      if (!cart || cart.items.length === 0) {
        return BaseService.sendFailedResponse({ error: "Cart is empty" });
      }

      let totalAmount = 0;

      const orderItems = cart.items.map((item) => {
        totalAmount += item.product.price * item.quantity;
        return {
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        };
      });

      totalAmount = parseFloat(totalAmount.toFixed(2)) + DELIVERY_CHARGE;

      const newOrder = await Order.create({
        userId,
        items: orderItems,
        totalAmount,
        shippingAddress: req.body.shippingAddress,
      });

      // Optionally clear cart after order
      await Cart.findOneAndUpdate({ userId }, { items: [] });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
}

module.exports = OrderService;
