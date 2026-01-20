const CouponModel = require("../models/coupon.model");
const NotificationModel = require("../models/notification.model");
const OrderModel = require("../models/order.model");
const PaymentModel = require("../models/payment.model");
const SubscriptionModel = require("../models/subscription.model");
const UserModel = require("../models/user.model");
const paystackAxios = require("../services/paystack.client.service");
const sendEmail = require("./emailService");

async function handleChargeSuccess(data) {
    try {
      
        const metadata = data.metadata || {};
        const reference = data.reference;
        const userEmail = data.customer.email;
      
        // 1️⃣ Find user
        const user = await UserModel.findOne({ email: userEmail });
        if (!user) return;
      
        // 2️⃣ Idempotency: prevent duplicate payments
        const existingPayment = await PaymentModel.findOne({ reference });
        if (existingPayment) return;
      
        // 3️⃣ Record payment
        await PaymentModel.create({
          user: user._id,
          amount: data.amount / 100,
          reference,
          status: "success",
          type: metadata.type,
          channel: data.channel,
          paidAt: new Date(data.paid_at),
          metadata,
        });
      
        // ==========================
        // 🛒 ORDER PAYMENT FLOW
        // ==========================
        if (metadata.type === "order") {
          await handleOrderPayment(metadata, reference);
          return;
        }
      
        // ==========================
        // 🎁 GIFT SUBSCRIPTION
        // ==========================
        if (metadata.type === "subscription" && (metadata.isGift === true || metadata.isGift === "true")) {
          await handleGiftSubscription(data, user, metadata);
          return;
        }
      
        // ==========================
        // 🔁 NORMAL SUBSCRIPTION
        // ==========================
        if (metadata.type === "subscription") {
        console.log({user, metadata, data}, "subscription handle")
          await handleNormalSubscription(data, user, metadata);
          return;
        }
    } catch (error) {
        console.error("Error in handleChargeSuccess:", error);
        return;
    }
  }
  

async function createInitialSubscriptionFromCharge(data, user, metadata) {
    try {
        console.log({user, metadata, data}, 'from createInitialSubscriptionFromCharge');
        const {
          planId,
          categoryId,
          coachId,
          isGift = false,
          recipientEmail,
        } = metadata;
      
        if (!planId || !categoryId || !coachId) return;
      
        // 🔒 Prevent duplicate active subscription
        const existing = await SubscriptionModel.findOne({
          user: user._id,
          planId,
          status: "active",
        });
      
        if (existing) return;
      
        // ⚠️ Create Paystack subscription HERE (ONCE)
        const resp = await paystackAxios.post(
          "/subscription",
          {
            customer: user.customerCode,
            plan: metadata.paystackSubscriptionCode,
            authorization: data.authorization.authorization_code,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
          }
        );
      
        const paystackSub = resp.data.data;
      
        await SubscriptionModel.create({
          user: user._id,
          coachId,
          planId,
          categoryId,
          status: "active",
          startDate: new Date(),
          subscriptionCode: paystackSub.subscription_code,
          paystackSubscriptionId: paystackSub.id,
          paystackAuthorizationToken: paystackSub.email_token,
        });
    } catch (error) {
        console.error("Error from createInitialSubscriptionFromCharge:", error);
        return;
    }
}

async function handlePaymentFailed(data) {
    try {
        if (!data.subscription) return;
      
        await Subscription.findOneAndUpdate(
          { subscriptionCode: data.subscription.subscription_code },
          { status: "failed" }
        );
    } catch (error) {
        console.error("Error in handlePaymentFailed:", error);
        return;
    }
}

async function handleSubscriptionDisable(data) {
    try {
        await SubscriptionModel.findOneAndUpdate(
          { subscriptionCode: data.subscription_code },
          {
            status: "cancelled",
            cancelledAt: new Date(),
          }
        );
    } catch (error) {
        console.error("Error in handleSubscriptionDisable:", error);
        return;
    }
}

async function handleSubscriptionCreate(data) {
    try {       
        await SubscriptionModel.findOneAndUpdate(
          { subscriptionCode: data.subscription_code },
          {
            paystackSubscriptionId: data.id,
            nextPaymentDate: new Date(data.next_payment_date),
          }
        );
    } catch (error) {
        console.error("Error in handleSubscriptionCreate:", error);
        return;
    }
}

async function handleInvoiceFailed(data) {
    try {
        if (!data.subscription) return;
      
        await SubscriptionModel.findOneAndUpdate(
          { subscriptionCode: data.subscription.subscription_code },
          { status: "failed" }
        );
    } catch (error) {
        console.error("Error in handleInvoiceFailed:", error);
        return;
    }
}

async function handleGiftSubscription(data, sender, metadata) {
    try {
        
        const { planId, categoryId, coachId, recipientEmail, duration } = metadata;
      
        if (!planId || !categoryId || !coachId || !recipientEmail) {
          console.warn("Invalid gift subscription metadata", metadata);
          return;
        }

        const receiver = await UserModel.findOne({ email: recipientEmail });
      
        // Generate coupon
        const couponCode =
          "MUTAG-" + Math.random().toString(36).slice(2, 10).toUpperCase();
      
        // Calculate access duration
        const now = new Date();
        let expiresAt = new Date(now);
      
        if (duration === "monthly") {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (duration === "yearly") {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1); // default
        }
      
        await CouponModel.create({
          code: couponCode,
          coachId,
          planId: metadata.paystackSubscriptionCode,
          categoryId,
          giftedByUserId: sender._id,
          recipientEmail,
          expiresAt,
        //   userId: receiver._id,
          used: false,
        });
      
        // Notify recipient
        await sendEmail({
          from: "Muta App <no-reply@fitnessapp.com>",
          to: recipientEmail,
          subject: "🎁 You received a gift subscription!",
          html: `
              <p>Hello!</p>
              <p>${sender.firstName} ${sender.lastName} just gifted you a fitness subscription 💪</p>
              <p><strong>Coupon Code:</strong> ${couponCode}</p>
              <p>Open the Muta app and redeem your gift to get started!</p>
            `,
        });
      
        // Notify sender (optional)
        const notificationData = {
            userId: sender._id,
            title: "Gift Sent 🎁",
            body: `Your gift subscription has been successfully sent to ${recipientEmail}.`,
          }
          console.log({notificationData})
        await NotificationModel.create(notificationData);
      
        console.log(
          `🎁 Gift subscription created by ${sender.email} for ${recipientEmail}`
        );
    } catch (error) {
        console.error("Error in handleGiftSubscription:", error);
        return;
    }
}

async function handleNormalSubscription(data, user, metadata) {
    try {
        console.log({user, metadata, data}, 'from handleNormalSubscription');    
        const subscriptionCode = data.subscription?.subscription_code;
      
        // 🔁 Renewal
        if (subscriptionCode) {
          const subscription = await SubscriptionModel.findOne({
            subscriptionCode,
          });
          if (!subscription) return;
      
          subscription.status = "active";
          subscription.lastPaymentAt = new Date(data.paid_at);
          subscription.currentPeriodEnd = new Date(
            data.subscription.next_payment_date
          );
          subscription.nextPaymentDate = new Date(
            data.subscription.next_payment_date
          );
      
          await subscription.save();
          return;
        }
      
        // 🆕 Initial subscription creation
        await createInitialSubscriptionFromCharge(data, user, metadata);
    } catch (error) {
        console.error("Error in handleNormalSubscription:", error);
    }
}

  async function handleOrderPayment(metadata, reference) {
    try {
        
        const { orderId } = metadata;
      
        if (!orderId) {
          console.warn("Order payment missing orderId in metadata");
          return;
        }
      
        const order = await OrderModel.findById(orderId);
        if (!order) {
          console.warn(`Order ${orderId} not found`);
          return;
        }
      
        // 🔒 Idempotency guard
        if (order.paymentStatus === "success") {
          return;
        }
      
        order.paymentStatus = "success";
        order.paymentReference = reference;
        order.paymentDate = new Date();
        order.paymentMethod = "paystack";
      
        await order.save();
      
        // 🔔 Optional notification
        await NotificationModel.create({
          userId: order.userId,
          title: "Payment Successful",
          body: "Your order payment was successful and is being processed.",
        });
      
        console.log(`🛒 Order ${order._id} marked as paid`);
    } catch (error) {
        console.error("Error in handleOrderPayment:", error);
        return;
    }
  }
  
  

module.exports = {
  handleChargeSuccess,
  handlePaymentFailed,
  handleSubscriptionDisable,
  handleSubscriptionCreate,
  handleInvoiceFailed,
};
