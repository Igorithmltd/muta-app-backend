const crypto = require("crypto");
const UserModel = require("../models/user.model.js");
const UserService = require("../services/user.service.js");
const PlanModel = require("../models/plan.model.js");
const SubscriptionModel = require("../models/subscription.model.js");
const axios = require("axios");
const ChatRoomModel = require("../models/chatModel.js");
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
      const transactionId = data.id;
      const reference = data.reference;
      const userEmail = data.customer.email;
      const amount = data.amount / 100; // kobo to naira
      const paystackSubscriptionCode = metadata.paystackSubscriptionCode || null;
      const coachId = metadata.coachId || null;

      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).send("User not found");
      }

      if (event.data.authorization && event.data.authorization.reusable) {
        const authorizationCode = event.data.authorization
          ? event.data.authorization.authorization_code
          : null;
        const customerCode = event.data.customer
          ? event.data.customer.customer_code
          : null;
        // const planCode = event.data.plan ? event.data.plan.plan_code : null;

        let existingSubscription = await SubscriptionModel.findOne({
          user: user._id,
          // paystackSubscriptionId: paystackSubscriptionCode,
          status: "active",
        });


        if(existingSubscription){
          console.log("User already has an active subscription. Skipping creation.");
          return res.status(200).send("Subscription already active");
        }

        // create subscription via Paystack API
        // const startDateUnix = Math.floor(Date.now() / 1000);


        const resp = await axios.post(
          "https://api.paystack.co/subscription",
          {
            customer: customerCode,
            plan: paystackSubscriptionCode,
            authorization: authorizationCode,
            // start_date: new Date().toISOString(), // optional; omit to start immediately
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
          }
        );


        if (!resp.data.status) {
          return res.status(500).send("Error creating subscription");
        }
       

        // if (!existingSubscription) {
          // No active subscription found - create a new subscription record
          // You may want to decide how to get planId and categoryId here
          // For example, from the webhook metadata or another reliable source
          // For this example, let's assume you can get it from webhook metadata:
          const planId = data.metadata?.planId || "";
          const categoryId = data.metadata?.categoryId || "";
          

          if (!planId || !categoryId) {
            console.log("PlanId or CategoryId missing from webhook metadata");
            return res.status(200).send("Plan or category info missing");
          }

          const newChat = await ChatRoomModel.create({
            type: "private",
            participants: [user._id, coachId]
          })
          
          const subscription = new SubscriptionModel({
            user: user._id,
            planId: planId,
            categoryId: categoryId,
            coachId: coachId,
            paystackSubscriptionId: paystackSubscriptionCode,
            reference: reference,
            status: "active",
            startDate: new Date(),
          });
          await subscription.save();
          return res.status(200).send("Subscription processed");
        // }

        // Find the plan
        // const plan = await PlanModel.findById(subscription.planId);
        // if (!plan) {
        //   console.log(`Plan with ID ${subscription.planId} not found`);
        //   return res.status(404).send("Plan not found");
        // }

        // // Find category in plan.categories by subscription.categoryId
        // const category = plan.categories.id(subscription.categoryId);
        // if (!category) {
        //   console.log(
        //     `Category with ID ${subscription.categoryId} not found in plan`
        //   );
        //   return res.status(404).send("Category not found");
        // }

        // // Calculate new expiry date based on duration
        // let currentExpiry =
        //   subscription.expiryDate && subscription.expiryDate > new Date()
        //     ? subscription.expiryDate
        //     : new Date();

        // let newExpiryDate = new Date(currentExpiry);
        // if (category.duration === "monthly") {
        //   newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
        // } else if (category.duration === "yearly") {
        //   newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
        // }

        // // Update subscription fields
        // subscription.expiryDate = newExpiryDate;
        // subscription.status = "active";
        // subscription.reference = reference;
        // if (!subscription.startDate) {
        //   subscription.startDate = new Date();
        // }
        // subscription.paystackSubscriptionId = paystackSubscriptionCode;

        // await subscription.save();

        // console.log(
        //   `Updated subscription for user ${user._id}. New expiry: ${newExpiryDate}`
        // );

        // return res.status(200).send("Subscription processed");

        // persist resp.data.data to your DB: subscription_code, status, next_payment_date, etc
        // update user's account (grant premium access)
      } else {
        // authorization not reusable — ask user to re-enter or use a different flow
        console.warn(
          "authorization not reusable; cannot create subscription automatically"
        );
      }
    }

    if(event.event === "subscription.charge.success"){
      console.log('finally subscribed************************')
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
