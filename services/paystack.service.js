const CartModel = require("../models/cart.model");
const ProductModel = require("../models/product.model");
const validateData = require("../util/validate");
const BaseService = require("./base");
const axios = require("axios");

class PaystackService extends BaseService {
  constructor() {
    super();
    this.axiosInstance = axios.create({
      baseURL: "https://api.paystack.co",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
  }

  async initialisePayment(req) {
    try {
      const post = req.body;
      const userId = req.user.id;

      const validateRule = {
        email: "string|required",
        amount: "string|required",
        planId: "string|required"
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { email, amount, planId } = post; // amount in kobo

      const response = await this.axiosInstance.post(
        "/transaction/initialize",
        {
          email,
          amount, // e.g. 4500000 for ₦45,000.00
          metadata: { userId, planId }, // VERY helpful for mapping webhooks -> user
          // callback_url: 'https://yourapp.com/pay/callback' // optional
        }
      );

      return BaseService.sendSuccessResponse({ message: response.data });
    } catch (error) {
      console.error("Add to cart error:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
}

module.exports = PaystackService;
