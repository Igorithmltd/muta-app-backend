const crypto = require("crypto");
const UserModel = require("../models/user.model.js");
const UserService = require("../services/user.service.js");
const PlanModel = require("../models/plan.model.js");
const SubscriptionModel = require("../models/subscription.model.js");
// const WalletModel = require("../models/wallet.model.js");
// const TransactionModel = require("../models/transaction.model.js");
// const NotificationModel = require("../models/notification.model.js");
// const PayoutItemModel = require("../models/payoutItem.model.js");

const webhookFunction = async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers["x-paystack-signature"];
  const userService = new UserService()

  // ✅ Ensure raw body for signature verification (middleware must provide rawBody)
  const hash = crypto
    .createHmac("sha512", secret)
    .update(req.body) // raw body, not parsed JSON
    // .update(req.rawBody) // raw body, not parsed JSON
    .digest("hex");

  if (hash !== signature) {
    console.log("❌ Invalid Paystack signature");
    return res.status(401).send("Unauthorized: Invalid signature");
  }

  try {
    const event = JSON.parse(req.body.toString());
    // const event = req.body;

    if (event.event === "charge.success") {
      console.log('charge.success event received');
      const { data } = event;
      const metadata = data.metadata || {};
      const transactionId = data.id;
      const reference = data.reference;
      const userEmail = data.customer.email;
      const amount = data.amount / 100; // kobo to naira

      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).send("User not found");
      }


      if (metadata.purpose === "subscription") {
        try {
          await userService.createSubscriptionFromMetadata({
            userId: user._id,
            coachId: metadata.coachId,
            planId: metadata.planId,
            reference,
            isGift: metadata.isGift,
            recipientEmail: metadata.recipientEmail,
          });
    
          return res.status(200).send("Subscription processed");
        } catch (err) {
          console.error("❌ Subscription failed:", err.message);
          return res.status(500).send("Subscription error");
        }
      }

      console.log(`✅ Wallet funded: User ${user._id}, Amount ₦${amount}`);
    }

    if (event.event === 'subscription.charge.success') {


      try {
        const data = event.data;
        const paystackSubscriptionCode = data.subscription.subscription_code;
        const reference = data.reference;
        const userEmail = data.customer.email;
        const amount = data.amount / 100;
    
        // Find user by email
        const user = await UserModel.findOne({ email: userEmail });
        if (!user) {
          console.log(`User with email ${userEmail} not found`);
          return res.status(404).send('User not found');
        }
    
        // Find subscription by paystackSubscriptionId (subscription_code)
        let subscription = await SubscriptionModel.findOne({ paystackSubscriptionId: paystackSubscriptionCode });
    
        if (!subscription) {
          // No subscription found, create one based on Paystack subscription info
    
          // Find the plan and category that matches this paystackSubscriptionCode
          // Plans store paystackSubscriptionId inside categories, so we can query:
          // const plan = await PlanModel.findOne({ 'categories.paystackSubscriptionId': paystackSubscriptionCode });
          // if (!plan) {
          //   console.log(`Plan for paystackSubscriptionId ${paystackSubscriptionCode} not found`);
          //   return res.status(404).send('Plan not found');
          // }
    
          // // Find category matching the paystackSubscriptionCode
          // const category = plan.categories.find(cat => cat.paystackSubscriptionId === paystackSubscriptionCode);
    
          // if (!category) {
          //   console.log(`Category with paystackSubscriptionId ${paystackSubscriptionCode} not found in plan`);
          //   return res.status(404).send('Category not found');
          // }
    
          // // Calculate expiry date based on category duration
          // let expiryDate = new Date();
          // if (category.duration === 'monthly') {
          //   expiryDate.setMonth(expiryDate.getMonth() + 1);
          // } else if (category.duration === 'yearly') {
          //   expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          // }
    
          // subscription = new SubscriptionModel({
          //   user: user._id,
          //   planId: plan._id,
          //   categoryId: category._id,
          //   paystackSubscriptionId: paystackSubscriptionCode,
          //   reference,
          //   status: 'active',
          //   startDate: new Date(),
          //   expiryDate,
          // });
    
          // await subscription.save();
          // console.log(`Created new subscription for user ${user._id}`);
          console.log('subscription not found')
        } else {
          // Subscription exists, update expiry and status
    
          // Get plan and category from subscription references
          const plan = await PlanModel.findById(subscription.planId);
          if (!plan) {
            console.log(`Plan with ID ${subscription.planId} not found`);
            return res.status(404).send('Plan not found');
          }
    
          const category = plan.categories.id(subscription.categoryId);
          if (!category) {
            console.log(`Category with ID ${subscription.categoryId} not found in plan`);
            return res.status(404).send('Category not found');
          }
    
          // Update expiry based on duration
          let newExpiryDate = subscription.expiryDate ? new Date(subscription.expiryDate) : new Date();
          if (category.duration === 'monthly') {
            newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
          } else if (category.duration === 'yearly') {
            newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
          }
    
          subscription.expiryDate = newExpiryDate;
          subscription.status = 'active';
          subscription.reference = reference; // update payment reference
    
          await subscription.save();
          console.log(`Updated subscription expiry for user ${user._id} to ${newExpiryDate}`);
        }
    
        return res.status(200).send('Subscription processed');
      } catch (error) {
        console.error('Error processing subscription.charge.success webhook:', error);
        return res.status(500).send('Internal Server Error');
      }






        // const data = event.data;
        // const paystackSubscriptionId = data.subscription.subscription_code;
        // const reference = data.reference;
        // const amount = data.amount / 100;
    
        // // Find subscription by Paystack subscription ID
        // const subscription = await SubscriptionModel.findOne({ paystackSubscriptionId });
    
        // if (!subscription) {
        //   return res.status(404).send('Subscription not found');
        // }
    
        // // Update subscription expiry based on plan duration
        // const plan = await PlanModel.findById(subscription.planId);
        // let newExpiryDate = new Date(subscription.expiryDate);
    
        // if (plan.duration === 'monthly') {
        //   newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
        // } else if (plan.duration === 'yearly') {
        //   newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
        // }
    
        // subscription.expiryDate = newExpiryDate;
        // subscription.status = 'active';
        // subscription.reference = reference; // last payment reference
        // await subscription.save();
    
        // // Optionally notify user or log success
        // console.log(`Subscription renewed for user ${subscription.user} until ${newExpiryDate}`);
    
        // return res.sendStatus(200);
      }
    
    // if (event.event === "transfer.success" || event.event === "transfer.failed") {
    //   const data = event.data;
    //   const transferCode = data.transfer_code;
    //   const status = event.event === "transfer.success" ? "success" : "failed";

    // }


    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error processing webhook:", err);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = webhookFunction;





















// const TransactionModel = require("../models/transaction.model.js");
// const UserModel = require("../models/user.model.js");
// const NotificationModel = require("../models/notification.model.js");
// const crypto = require("crypto");

// const webhookFunction = async (req, res) => {
//   const rawBody = req.body;
//   const secret = process.env.PAYSTACK_SECRET_KEY;
//   const signature = req.headers["x-paystack-signature"];

//   const hash = crypto
//     .createHmac("sha512", secret)
//     .update(rawBody)
//     .digest("hex");

//   if (hash !== signature) {
//     console.log("Invalid signature");
//     return res.status(401).send("Unauthorized: Invalid signature");
//   }

//   try {
//     const event = JSON.parse(req.body.toString("utf8"));

//     if (event.event === "charge.success") {
//       const { data } = event;
//       const transactionId = data.id;
//       const reference = data.reference;
//       const userEmail = data.customer.email;
//       const amount = data.amount / 100;

//       const user = await UserModel.findOne({ email: userEmail });
//       if (!user) {
//         return res.status(401).send("Unauthorized: User not found");
//       }

//       // Update the user's balance
//       user.balance += amount;
//       await user.save();

//       // Save the transaction
//       const transaction = new TransactionModel({
//         userId: user._id,
//         amount,
//         transaction: reference,
//         status: "success",
//         type: "wallet",
//         trxref: transactionId,
//       });

//       await transaction.save();

//       await NotificationModel.create({
//         userId: user._id,
//         title: "Fund Wallet",
//         message: `You have successfully funded your wallet with ₦${amount}`,
//       });
//     }

//     return res.status(200).send("Webhook received");
//   } catch (err) {
//     console.error("❌ Error processing webhook:", err);
//     return res.status(500).send("Internal Server Error");
//   }
// };

// module.exports = webhookFunction;
