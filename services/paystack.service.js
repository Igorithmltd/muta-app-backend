const SubscriptionModel = require("../models/subscription.model");
const UserModel = require("../models/user.model");
// const connectRedis = require("../util/cache");
const validateData = require("../util/validate");
const BaseService = require("./base");
const axios = require("axios");

/**
 * test:
 * monthly: PLN_02ufsh4w75lk7fx
 * yearly: PLN_7e0ibd16z5ijrxi
 * 
 * live: 
 * montly: PLN_ylerggpbm0jq6vu
 * yearly: PLN_vu53jf8t745zu7l
 */
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
        duration: "string|required",
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

      const user = await UserModel.findById(userId);
      if (!user) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      const { email, amount, planId, categoryId, paystackSubscriptionCode, coachId, duration } = post;
      const isGift = post.isGift || false;
      const recipientEmail = post.recipientEmail || "";
      const giftMessage = post.giftMessage || "";

      // console.log(await connectRedis(),'the redix')

      if(isGift && !recipientEmail){
        return BaseService.sendFailedResponse({ error: "Recipient email is required for gift subscriptions" });
      }
      
      
      const receiverExists = await UserModel.findOne({email: recipientEmail})
      if(isGift && !receiverExists){
        return BaseService.sendFailedResponse({ error: "Recipient does not have an account" });
      }

      const customerCode = user.customerCode || null;

      // if(!customerCode){
      //   return BaseService.sendFailedResponse({error: "Customer code not found. Please make a successful transaction first."});
      // }
      let existingPaystackSubscription
      if(customerCode){
        existingPaystackSubscription = await this.checkIfCustomerHasSubscription(customerCode, paystackSubscriptionCode);
      }


      let existingSubscription = await SubscriptionModel.findOne({
        user: user._id,
        paystackSubscriptionId: paystackSubscriptionCode,
        status: "active",
      });


      if(existingSubscription){
        return BaseService.sendSuccessResponse({message: "Subscription already active"});
      }

    //   if(isUserSubscribed?.status && isUserSubscribed?.data.length > 0){
    //     return BaseService.sendFailedResponse({error: 'You are already subscribed to this plan'})
    //   }

      const response = await this.axiosInstance.post(
        "/transaction/initialize",
        {
          email,
          amount, // e.g. 4500000 for ₦45,000.00
          metadata: { userId, planId, categoryId, duration, paystackSubscriptionCode, coachId, type: "subscription", isGift, ...(giftMessage && {giftMessage}) }, // VERY helpful for mapping webhooks -> user
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
  async checkIfCustomerHasSubscription(customerCode, paystackSubscriptionId) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/subscription?customer=${customerCode}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
          // params: {
          //   customer: customerCode,  // Pass customerCode to filter subscriptions
          // },
        }
      );
  

      // Check if the customer already has a subscription to the given plan
      const existingSubscription = response.data.data.find(sub => sub.plan.code === planCode);
      console.log({PexistingSubscription: response.data})
  
      return existingSubscription ? true : false;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false; // If there's an error, assume no active subscription
    }
  }
  async disableSubscription(paystackSubscriptionId, token) {
    const resp = await this.axiosInstance.post(
      "/subscription/disable",
      {
        code: paystackSubscriptionId,
        token
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    return resp.data;
  };
}

module.exports = PaystackService;
