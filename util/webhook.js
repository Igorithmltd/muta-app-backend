const crypto = require("crypto");
const UserModel = require("../models/user.model.js");
const PlanModel = require("../models/plan.model.js");
const SubscriptionModel = require("../models/subscription.model.js");
const axios = require("axios");
const ChatRoomModel = require("../models/chatModel.js");
const orderModel = require("../models/order.model.js");
const PaymentModel = require("../models/payment.model.js");
const sendEmail = require("./emailService.js");
const CouponModel = require("../models/coupon.model.js");
const NotificationModel = require("../models/notification.model.js");
const { handleSubscriptionDisable, handleSubscriptionCreate, handleChargeSuccess, handleInvoiceFailed } = require("./webHookHelpers.js");
// const WalletModel = require("../models/wallet.model.js");
// const TransactionModel = require("../models/transaction.model.js");
// const NotificationModel = require("../models/notification.model.js");
// const PayoutItemModel = require("../models/payoutItem.model.js");

const webhookFunction = async (req, res) => {
  console.log("📩 Paystack webhook hit", new Date().toISOString());

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers["x-paystack-signature"];

  const hash = crypto
    .createHmac("sha512", secret)
    .update(req.body)
    .digest("hex");

  if (hash !== signature) {
    return res.status(401).send("Invalid signature");
  }

  try {
    const event = JSON.parse(req.body.toString());
    if (!event?.event || !event?.data) return res.sendStatus(200);
    console.log("📩 Paystack webhook 1");

    switch (event.event) {
      case "charge.success":
        console.log("📩 Paystack webhook 2");
        await handleChargeSuccess(event.data);
        break;

      case "subscription.create":
        console.log("📩 Paystack webhook 3: subscription.create");
        await handleSubscriptionCreate(event.data);
        break;

      case "invoice.payment_failed":
        console.log("📩 Paystack webhook 4");
        await handleInvoiceFailed(event.data);
        break;

      case "subscription.disable":
        console.log("📩 Paystack webhook 5");
        await handleSubscriptionDisable(event.data);
        break;

      default:
        break;
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    return res.sendStatus(500);
  }
};

module.exports = webhookFunction;