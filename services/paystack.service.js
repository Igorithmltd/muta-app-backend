const PlanModel = require("../models/plan.model");
const SubscriptionModel = require("../models/subscription.model");
const UserModel = require("../models/user.model");
// const connectRedis = require("../util/cache");
const validateData = require("../util/validate");
const BaseService = require("./base");
const axios = require("axios");
const paystackAxios = require("./paystack.client.service");
const { generateReference } = require("../util/constants");
const CouponModel = require("../models/coupon.model");
const CouponBalanceModel = require("../models/couponBalance");

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
        // coachId: "string|required",
        categoryId: "string|required",
        isGift: "boolean|required",
        recipientEmail: "string|email",
        recipientName: "string",
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
        isGift,
        recipientEmail,
        recipientName,
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

      if (
        !category.price ||
        !category.paystackSubscriptionId ||
        !category.duration
      ) {
        return BaseService.sendFailedResponse({
          error: "Invalid plan configuration",
        });
      }

      let amount = category.price * 100; // Amount in kobo

      if (isGift) {
        const couponBalance = await CouponBalanceModel.findOne({
          userId: req.user._id,
        });

        if (couponBalance && Number(couponBalance.balance) > 0) {
          // Convert balance to kobo
          const availableBalance = Number(couponBalance.balance) * 100;

          // Amount to deduct from coupon balance
          const deduction = Math.min(availableBalance, amount);

          // Reduce payable amount
          amount -= deduction;

          couponBalance.balance = (availableBalance - deduction) / 100;
          await couponBalance.save();
        }
      }

      amount = Math.max(amount, 0);

      const paystackPlanCode = category.paystackSubscriptionId;
      const duration = category.duration;

      /* --------------------
         Gift validation
      ---------------------*/
      if (isGift && !phoneNumber) {
        return BaseService.sendFailedResponse({
          error: "Recipient phone number is required for gifts",
        });
      }
      if (isGift && !recipientEmail) {
        return BaseService.sendFailedResponse({
          error: "Recipient email is required for gifts",
        });
      }
      if (isGift && !recipientName) {
        return BaseService.sendFailedResponse({
          error: "Recipient name is required for gifts",
        });
      }

      // if (recipientEmail && phoneNumber) {
      //   return BaseService.sendFailedResponse({
      //     error: "Provide only one gift delivery method (email OR phone)",
      //   });
      // }

      if (!isGift) {
        // let subscriptions = [];

        // if (user.customerCode) {
        //   try {
        //     const response = await paystackAxios.get(
        //       `/customer/${user.customerCode}`
        //     );

        //     subscriptions = response.data?.data?.subscriptions || [];
        //   } catch (error) {
        //     console.log("Error from paystack customer check", error);
        //     if (error.response?.status === 404) {
        //       // Customer does not exist on Paystack → treat as no subscription
        //       subscriptions = [];
        //     } else {
        //       return BaseService.sendFailedResponse({
        //         error: "Error occured while attempting to subscribe",
        //       });
        //     }
        //   }
        // }

        // console.log({s: subscriptions[0]})
        // const hasActiveSubscription = subscriptions.some(
        //   (sub) => sub.status === "active"
        // );

        // if (hasActiveSubscription) {
        //   return BaseService.sendSuccessResponse({
        //     message: "Subscription already active",
        //   });
        // }

        // // 🔥 Your DB check is still important (good job keeping it)
        // const existingSubscription = await SubscriptionModel.findOne({
        //   user: user._id,
        //   status: "active",
        // });

        const subscriptionStatus = await this.checkUserSubscription(user);

        if (!subscriptionStatus.isSynced) {
          // Handle sync issues here
          console.log("Subscription data out of sync:", subscriptionStatus);
        }

        if (subscriptionStatus.hasActiveSubscription) {
          return BaseService.sendSuccessResponse({
            message: "Subscription already active",
          });
        }

        // if (existingSubscription) {
        //   return BaseService.sendSuccessResponse({
        //     message:
        //       "Subscription already exists. Disable your current subscription",
        //   });
        // }
      }

      if (isGift) {
        const gifteeUser = await UserModel.findOne({
          $or: [{ email: recipientEmail }, { phoneNumber }],
        });

        if (gifteeUser && gifteeUser._id) {
          const existingGift = await SubscriptionModel.findOne({
            status: "active",
            user: gifteeUser._id,
          });
          console.log(existingGift, "existing gift");
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
      const reference = generateReference(userId);

      const paystackPayload = {
        email,
        amount,
        reference,
        channels: ["card"],
        ...(!isGift && { plan: paystackPlanCode }),
        // ...(planId && !isGift && {plan: paystackPlanCode}),
        metadata: {
          type: isGift ? "gift" : "subscription",
          amount,
          payerId: userId,
          planId,
          categoryId,
          duration,
          paystackSubscriptionCode: paystackPlanCode,
          isGift,
          ...(isGift && {
            gift: {
              recipientEmail,
              recipientName,
              phoneNumber,
              giftMessage,
            },
          }),
        },
      };

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

  async verifyReference(req) {
    try {
      const reference = req.params.referenceId;

      const response = await this.axiosInstance.get(
        `/transaction/verify/${reference}`
      );

      if (!response.data.status) {
        return BaseService.sendFailedResponse({
          error: "We are trying to verify your payment. Please try again later",
        });
      }

      const couponExists = await CouponModel.findOne({ reference });

      if (!couponExists) {
        return BaseService.sendFailedResponse({
          error: "Reference not valid or not found",
        });
      }

      return BaseService.sendSuccessResponse({
        message: {
          code: couponExists.code,
          ...(couponExists.recipientEmail && {
            email: couponExists.recipientEmail,
          }),
          ...(couponExists.phoneNumber && {
            phoneNumber: couponExists.phoneNumber,
          }),
        },
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: "Something went wrong. Please try again later",
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
    try {
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
      return { success: true, message: resp.data };
    } catch (error) {
      const message = error.response.data.message;
      console.log(error.response.data.messsage, "from disable");
      if (
        error.status == 404 ||
        message == "Subscription with code not found or already inactive"
      ) {
        return { success: true, message: "Already disabled" };
      }
      return {
        success: false,
        error: message || "Something went wrong disabling the subscription",
      };
    }
  }
  async checkUserSubscription(user) {
    let hasPaystackSub = false;
    let paystackSub = null;

    if (user.customerCode) {
      try {
        const response = await paystackAxios.get(
          `/customer/${user.customerCode}`
        );
        const subscriptions = response.data?.data?.subscriptions || [];

        const activeSub = subscriptions.find((sub) => sub.status === "active");
        if (activeSub) {
          hasPaystackSub = true;
          paystackSub = activeSub;
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Paystack check failed:", error);
          // Consider throwing or handling based on your needs
        }
      }
    }

    const dbSub = await SubscriptionModel.findOne({
      user: user._id,
      status: "active",
      endDate: { $gt: new Date() },
    });

    return {
      hasActiveSubscription: hasPaystackSub || !!dbSub,
      paystackSubscription: paystackSub,
      dbSubscription: dbSub,
      isSynced: hasPaystackSub === !!dbSub,
    };
  }
}

module.exports = PaystackService;
