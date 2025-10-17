const crypto = require("crypto");
const UserModel = require("../models/user.model.js");
const UserService = require("../services/user.service.js");
const PlanModel = require("../models/plan.model.js");
const SubscriptionModel = require("../models/subscription.model.js");
const axios = require("axios");
const ChatRoomModel = require("../models/chatModel.js");
const orderModel = require("../models/order.model.js");
const PaymentModel = require("../models/payment.model.js");
const sendEmail = require("./emailService.js");
const CouponModel = require("../models/coupon.model.js");
// const WalletModel = require("../models/wallet.model.js");
// const TransactionModel = require("../models/transaction.model.js");
// const NotificationModel = require("../models/notification.model.js");
// const PayoutItemModel = require("../models/payoutItem.model.js");

const webhookFunction = async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers["x-paystack-signature"];

  // ✅ Ensure raw body for signature verification (middleware must provide rawBody)
  const hash = crypto
    .createHmac("sha512", secret)
    .update(req.body) // raw body, not parsed JSON
    // .update(req.rawBody) // raw body, not parsed JSON
    .digest("hex");

  if (hash !== signature) {
    return res.status(401).send("Unauthorized: Invalid signature");
  }

  try {
    // const event = req.body;
    const event = JSON.parse(req.body.toString());

    if (!event || !event.event || !event.data) {
      console.warn("Received malformed or test webhook:", event);
      return res.sendStatus(200); // Accept it silently so Paystack doesn't retry
    }

    if (event.event === "charge.success") {
      const { data } = event;
      const metadata = data.metadata || {};
      // const transactionId = data.id;
      const reference = data.reference;
      const userEmail = data.customer.email;
      // const amount = data.amount / 100; // kobo to naira
      const paystackSubscriptionCode =
        metadata.paystackSubscriptionCode || null;
      const coachId = metadata.coachId || null;

      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).send("User not found");
      }
      if (metadata.type === "order") {
        const orderId = metadata.orderId;

        if (!orderId) {
          return res.status(400).send("Order ID missing in metadata.");
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
          return res.status(404).send("Order not found.");
        }

        if (order.paymentStatus === "success") {
          return res.status(200).send("Order already paid.");
        }

        await PaymentModel.create({
          user: user._id,
          amount: data.amount / 100, // Paystack amount is in kobo
          reference: data.reference,
          status: "success",
          type: "order",
          metadata,
          channel: data.channel,
          paidAt: new Date(data.paid_at),
        });

        order.paymentStatus = "success"; // or "processing" if you have steps after payment
        // order.orderStatus = "success";
        order.paymentReference = data.reference;
        order.paymentDate = new Date();
        order.paymentMethod = "paystack"; // optional
        await order.save();

        // You can trigger email, delivery, etc. here if needed
        console.log(`Order ${order._id} marked as paid.`);

        return res.status(200).send("Order payment processed.");
      }

      if (
        metadata.type == "subscription" &&
        event.data.authorization &&
        event.data.authorization.reusable
      ) {
        const authorizationCode = event.data.authorization
          ? event.data.authorization.authorization_code
          : null;
        const customerCode = event.data.customer
          ? event.data.customer.customer_code
          : null;

        // user.subscriptionCode = paystackSubscriptionCode;
        // user.paystackAuthorizationToken = authorizationCode;
        user.customerCode = customerCode;
        await user.save()

        // Gift subscription flow
        if (metadata.isGift) {
          const planWithCategory = await PlanModel.findOne({
            "categories.paystackSubscriptionId": paystackSubscriptionCode,
          });
          if (!planWithCategory) {
            console.log(
              "Plan with given category not found for gift subscription"
            );
            return res.status(200).send("Plan not found for gift subscription");
          }

          const matchedCategory = planWithCategory.categories.find(
            (cat) => cat.paystackSubscriptionId === paystackSubscriptionCode
          );

          if (!matchedCategory) {
            console.log("Category not found in plan for gift subscription");
            return res
              .status(200)
              .send("Category not found for gift subscription");
          }
          const categoryDuration = matchedCategory.duration;

          // Generate coupon for gift recipient
          const couponCode =
            "MutaG-" + Math.random().toString(36).substr(2, 8).toUpperCase();

          await CouponModel.create({
            code: couponCode,
            coachId,
            planId: planWithCategory._id,
            giftedByUserId: user._id,
            recipientEmail: metadata.recipientEmail || "",
            used: false,
            authorizationCode: authorizationCode,
            customerCode: customerCode,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
          });

          await sendEmail({
            from: "Muta App <no-reply@fitnessapp.com>",
            subject: `You've received a gift subscription!`,
            to: metadata.recipientEmail || user.email,
            html: `<p>You have received a ${categoryDuration} premium subscription from ${user.firstName}. Your coupon code is <b>${couponCode}</b>.</p>`,
          });

          // Create Payment record for gift subscription too
          await PaymentModel.create({
            user: user._id,
            amount: data.amount / 100,
            reference: reference,
            status: "success",
            type: "gift_subscription",
            metadata,
            channel: data.channel,
            paidAt: new Date(data.paid_at),
          });

          console.log(
            `Processed gift subscription payment for user ${user._id}`
          );
          return res.status(200).send("Gift subscription processed");
        }

        // Self subscription flow (non-gift)
        else {
          const existingSubscription = await SubscriptionModel.findOne({
            user: user._id,
            status: "active",
          }).populate("planId");

          if (existingSubscription) {
            console.log(
              "User already has an active subscription. Skipping creation."
            );
            return res.status(200).send("Subscription already active");
          }

          let resp;
          try {
            resp = await axios.post(
              "https://api.paystack.co/subscription",
              {
                customer: customerCode,
                plan: paystackSubscriptionCode,
                authorization: authorizationCode,
                // start_date: new Date().toISOString(), // optional
              },
              {
                headers: {
                  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
              }
            );
          } catch (error) {
            console.log(
              "Error creating Paystack subscription:",
              error.response?.data || error.message
            );
            return res.status(500).send("Error creating subscription");
          }

          // Save it on the user model (or wherever needed)
          await user.save();

          if (!resp.data.status) {
            return res.status(500).send("Error creating subscription");
          }

          const planId = data.metadata?.planId || "";
          const categoryId = data.metadata?.categoryId || "";

          if (!planId || !categoryId) {
            console.log("PlanId or CategoryId missing from webhook metadata");
            return res.status(200).send("Plan or category info missing");
          }

          // Create private chat room between user and coach
          await ChatRoomModel.create({
            type: "private",
            participants: [user._id, coachId],
          });

          // Record the payment
          await PaymentModel.create({
            user: user._id,
            amount: data.amount / 100,
            reference: reference,
            status: "success",
            type: "subscription",
            metadata,
            channel: data.channel,
            paidAt: new Date(data.paid_at),
          });

          const paystackSubscriptionId = resp.data.data.subscription_code;

          if(!paystackSubscriptionId){
            console.log("Paystack subscription ID missing in response");
            return res.status(500).send("Subscription ID missing");
          }

          // Create subscription record
          const subscription = new SubscriptionModel({
            user: user._id,
            planId: planId,
            categoryId: categoryId,
            coachId: coachId,
            paystackSubscriptionId: paystackSubscriptionCode,
            reference: data.reference,
            status: "active",
            startDate: new Date(),
            paystackAuthorizationToken: authorizationCode,
            subscriptionCode: paystackSubscriptionId
          });
          console.log({subscription})


          await subscription.save();

          console.log(`Created new subscription for user ${user._id}`);
          return res.status(200).send("Subscription processed");
        }
      } else {
        // authorization not reusable — handle accordingly
        console.warn(
          "authorization not reusable; cannot create subscription automatically"
        );
        return res.status(400).send("Authorization not reusable");
      }
    }

    if (event.event === "subscription.charge.success") {
      console.log("finally subscribed************************");
    }

    // if (event.event === "subscription.charge.success") {
    //   try {
    //     const data = event.data;
    //     const paystackSubscriptionCode = data.subscription.subscription_code;
    //     const reference = data.reference;
    //     const userEmail = data.customer.email;
    //     const amount = data.amount / 100;

    //     // Find user by email
    //     const user = await UserModel.findOne({ email: userEmail });
    //     if (!user) {
    //       console.log(`User with email ${userEmail} not found`);
    //       return res.status(404).send("User not found");
    //     }

    //     // Find active subscription by user and paystackSubscriptionId
    //     let subscription = await SubscriptionModel.findOne({
    //       user: user._id,
    //       paystackSubscriptionId: paystackSubscriptionCode,
    //       status: "active",
    //     });

    //     if (!subscription) {
    //       // No active subscription found - create a new subscription record
    //       // You may want to decide how to get planId and categoryId here
    //       // For example, from the webhook metadata or another reliable source
    //       // For this example, let's assume you can get it from webhook metadata:
    //       const planId = data.metadata?.planId;
    //       const categoryId = data.metadata?.categoryId;

    //       if (!planId || !categoryId) {
    //         console.log("PlanId or CategoryId missing from webhook metadata");
    //         return res.status(200).send("Plan or category info missing");
    //       }

    //       subscription = new SubscriptionModel({
    //         user: user._id,
    //         planId: planId,
    //         categoryId: categoryId,
    //         paystackSubscriptionId: paystackSubscriptionCode,
    //         reference: reference,
    //         status: "active",
    //         startDate: new Date(),
    //       });
    //     }

    //     // Find the plan
    //     const plan = await PlanModel.findById(subscription.planId);
    //     if (!plan) {
    //       console.log(`Plan with ID ${subscription.planId} not found`);
    //       return res.status(404).send("Plan not found");
    //     }

    //     // Find category in plan.categories by subscription.categoryId
    //     const category = plan.categories.id(subscription.categoryId);
    //     if (!category) {
    //       console.log(
    //         `Category with ID ${subscription.categoryId} not found in plan`
    //       );
    //       return res.status(404).send("Category not found");
    //     }

    //     // Calculate new expiry date based on duration
    //     let currentExpiry =
    //       subscription.expiryDate && subscription.expiryDate > new Date()
    //         ? subscription.expiryDate
    //         : new Date();

    //     let newExpiryDate = new Date(currentExpiry);
    //     if (category.duration === "monthly") {
    //       newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
    //     } else if (category.duration === "yearly") {
    //       newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
    //     }

    //     // Update subscription fields
    //     subscription.expiryDate = newExpiryDate;
    //     subscription.status = "active";
    //     subscription.reference = reference;
    //     if (!subscription.startDate) {
    //       subscription.startDate = new Date();
    //     }
    //     subscription.paystackSubscriptionId = paystackSubscriptionCode;

    //     await subscription.save();

    //     console.log(
    //       `Updated subscription for user ${user._id}. New expiry: ${newExpiryDate}`
    //     );

    //     return res.status(200).send("Subscription processed");
    //   } catch (error) {
    //     console.error("Error processing subscription.charge.success webhook:");
    //     return res.status(500).send("Internal Server Error");
    //   }
    // }

    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error processing webhook:", err.message);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = webhookFunction;
