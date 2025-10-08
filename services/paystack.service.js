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

  async initializePayment(req) {
    try {
      const post = req.body;
      const userId = req.user.id;

      const validateRule = {
        email: "string|required",
        amount: "integer|required",
        planId: "string|required",
        coachId: "string|required",
        categoryId: "string|required",
        paystackSubscriptionCode: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { email, amount, planId, categoryId, paystackSubscriptionCode, coachId } = post;

      // const lookupCustomer = await axios.get(
      //   `https://api.paystack.co/customer/${email}`,
      //   {
      //     headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      //   }
      // );
      // const customerCode = lookupCustomer.data.data.customer_code || email;


      // const isUserSubscribed = await axios.get(
      //   `https://api.paystack.co/subscription`,
      //   // `https://api.paystack.co/subscription?customer=${customerCode}`,
      //   // `https://api.paystack.co/subscription?customer=${customerCode}&plan=${paystackSubscriptionCode}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      //     },
      //   }
      // );

      let existingSubscription = await SubscriptionModel.findOne({
        user: user._id,
        // paystackSubscriptionId: paystackSubscriptionCode,
        status: "active",
      });


      if(existingSubscription){
        return BaseService.sendFailedResponse({error: "Subscription already active"});
      }

    //   if(isUserSubscribed?.status && isUserSubscribed?.data.length > 0){
    //     return BaseService.sendFailedResponse({error: 'You are already subscribed to this plan'})
    //   }

      const response = await this.axiosInstance.post(
        "/transaction/initialize",
        {
          email,
          amount, // e.g. 4500000 for ₦45,000.00
          metadata: { userId, planId, categoryId, paystackSubscriptionCode, coachId }, // VERY helpful for mapping webhooks -> user
          // callback_url: 'https://yourapp.com/pay/callback' // optional
        }
      );

      return BaseService.sendSuccessResponse({ message: response.data });
    } catch (error) {
      console.error("Initialize payment failed:", error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
}

module.exports = PaystackService;
