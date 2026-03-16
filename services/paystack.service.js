const PlanModel = require("../models/plan.model");
const SubscriptionModel = require("../models/subscription.model");
const UserModel = require("../models/user.model");
// const connectRedis = require("../util/cache");
const validateData = require("../util/validate");
const BaseService = require("./base");
const axios = require("axios");
const paystackAxios = require("./paystack.client.service");
const { generateReference } = require("../util/constants");

/**
 * test:
 * monthly: PLN_02ufsh4w75lk7fx
 * yearly: PLN_7e0ibd16z5ijrxi
 *
 * live:
 * monthly: PLN_ylerggpbm0jq6vu
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
        planId: "string|required",
        coachId: "string|required",
        categoryId: "string|required",
        isGift: "boolean|required",
        recipientEmail: "string|email",
        phoneNumber: "string",
        giftMessage: "string",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.string": ":attribute must be a string",
        "email.email": ":attribute must be a valid email",
      };

      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const {
        email,
        planId,
        categoryId,
        coachId,
        isGift,
        recipientEmail,
        phoneNumber,
        giftMessage,
      } = post;

      const user = await UserModel.findById(userId);
      if (!user) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      if (email !== user.email) {
        return BaseService.sendFailedResponse({
          error: "Email must match the authenticated user",
        });
      }

      const plan = await PlanModel.findById(planId);
      if (!plan) {
        return BaseService.sendFailedResponse({ error: "Plan not found" });
      }

      if (!plan.categories?.length) {
        return BaseService.sendFailedResponse({
          error: "Plan categories not configured",
        });
      }

      const category = plan.categories.find(
        (cat) => cat._id.toString() === categoryId
      );

      if (!category) {
        return BaseService.sendFailedResponse({ error: "Invalid category" });
      }

      if (!category.price || !category.paystackSubscriptionId || !category.duration) {
        return BaseService.sendFailedResponse({
          error: "Invalid plan configuration",
        });
      }

      const amount = category.price * 100; // Paystack uses kobo
      const paystackPlanCode = category.paystackSubscriptionId;
      const duration = category.duration;

      /* --------------------
         Gift validation
      ---------------------*/
      if (isGift && !(recipientEmail || phoneNumber)) {
        return BaseService.sendFailedResponse({
          error: "Recipient email or phone number is required for gifts",
        });
      }
      
      if (recipientEmail && phoneNumber) {
        return BaseService.sendFailedResponse({
          error: "Provide only one gift delivery method (email OR phone)",
        });
      }

      /* --------------------
         Self subscription checks
      ---------------------*/
      if (!isGift) {
        const existingPaystackSubscription = await paystackAxios.get(
          `/customer/${user.email}`
        );
        const subscriptions =
          existingPaystackSubscription.data.data.subscriptions || [];
        if (subscriptions.length > 0) {

          const hasActiveSubscription = subscriptions.some(
            (sub) => sub.status === "active"
          );
          
          if (hasActiveSubscription) {
            return BaseService.sendSuccessResponse({
              message: "Subscription already active",
            });
          }

          const existingSubscription = await SubscriptionModel.findOne({
            user: user._id,
            // paystackSubscriptionId: paystackPlanCode,
            status: "active",
            // categoryId,
          });

          if (existingSubscription) {
            return BaseService.sendSuccessResponse({
              message: "Subscription already exists. Disable your subscription current subscription",
            });
          }
        }
      }

      /* --------------------
         Optional: Gift duplication check
      ---------------------*/
      if (isGift) {
        const gifteeUser = await UserModel.findOne({
          $or: [{ email: recipientEmail }, { phoneNumber }],
        });


        if (gifteeUser && gifteeUser._id) {
          const existingGift = await SubscriptionModel.findOne({
            status: "active",
            user: gifteeUser._id,
          });
          if (existingGift) {
            return BaseService.sendFailedResponse({
              error:
                "Recipient already has an active subscription for this plan",
            });
          }
        }
      }

      /* --------------------
         Initialize Paystack
      ---------------------*/
      const paystackPayload = {
        email, // payer email
        ...(isGift && {amount}),
        reference,
        channels: ["card"],
        ...(!isGift && { plan: paystackPlanCode }),
        // ...(planId && !isGift && {plan: paystackPlanCode}),
        metadata: {
          type: isGift ? "gift" : "subscription",
          payerId: userId,
          planId,
          categoryId,
          duration,
          coachId,
          paystackSubscriptionCode: paystackPlanCode,
          isGift,
          ...(isGift && {
            gift: {
              recipientEmail,
              phoneNumber,
              giftMessage,
            },
          }),
        },
      }
      console.log({paystackPayload})

      const reference = generateReference(userId);
      const response = await this.axiosInstance.post(
        "/transaction/initialize",
        paystackPayload
      );


      return BaseService.sendSuccessResponse({
        message: response.data,
      });
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
        // `https://api.paystack.co/subscription?customer=${customerCode}`,
        `https://api.paystack.co/subscription`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
          // params: {
          //   customer: customerCode,  // Pass customerCode to filter subscriptions
          // },
        }
      );
      function hasActiveSubscription(subscriptions, customerCode) {
        return subscriptions.some(
          (sub) =>
            sub.customer.customer_code === customerCode &&
            sub.status === "active"
        );
      }

      const userHasSub = hasActiveSubscription(
        response.data.data,
        customerCode
      );

      return userHasSub;
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
        token,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return resp.data;
  }
  isInputEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input.trim());
  }
}

module.exports = PaystackService;
