const CouponModel = require("../models/coupon.model");
const NotificationModel = require("../models/notification.model");
const OrderModel = require("../models/order.model");
const PaymentModel = require("../models/payment.model");
const SubscriptionModel = require("../models/subscription.model");
const UserModel = require("../models/user.model");
const paystackAxios = require("../services/paystack.client.service");
const sendEmail = require("./emailService");
const sendOTP = require("./sendOtp");

async function handleChargeSuccess(data) {
  try {
    const metadata = data.metadata || {};
    const reference = data.reference;
    const userEmail = data.customer.email;

    if (data.subscription) {
      console.log("📩 Charge success with subscription data, updating subscription", {subscription: data.subscription})
      const subscription = await SubscriptionModel.findOne({
        subscriptionCode: data.subscription.subscription_code,
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
    }

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
    if (metadata.type === "subscription" && metadata.isGift === true) {
      await handleGiftSubscription(data, user, metadata);
      return;
    }

    // ==========================
    // 🔁 NORMAL SUBSCRIPTION
    // ==========================
    if (metadata.type === "subscription") {
      // await handleNormalSubscription(data, user);
      return;
    }
  } catch (error) {
    console.error("Error in handleChargeSuccess:", error);
    return;
  }
}

async function createInitialSubscriptionFromCharge(data, user, metadata) {
  try {
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
    const customerCode = data.customer.customer_code || "";
    if (!customerCode) {
      console.warn(
        "Charge missing customer code, cannot create subscription",
        data
      );
      return;
    }
    const resp = await paystackAxios.post(
      "/subscription",
      {
        customer: customerCode,
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
      planCode: metadata.paystackSubscriptionCode,
      authorizationCode: data.authorization.authorization_code,
    });
    user.customerCode = customerCode;
    user.save();
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
    const metadata = data.metadata || {};

    const existing = await SubscriptionModel.findOne({
      subscriptionCode: data.subscription_code,
    });
    console.log("📩 Handling subscription.create, inside***", {data})

    if (existing) return;

    await SubscriptionModel.create({
      user: metadata.payerId,
      coachId: metadata.coachId,
      planId: metadata.planId,
      categoryId: metadata.categoryId,
      status: "active",
      startDate: new Date(),
      subscriptionCode: data.subscription_code,
      paystackSubscriptionId: data.id,
      nextPaymentDate: new Date(data.next_payment_date),
    });
  } catch (error) {
    console.error("Error in handleSubscriptionCreate:", error);
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
    const {
      planId,
      categoryId,
      coachId,
      duration,
      gift = {},
      paystackSubscriptionCode,
    } = metadata;

    const { recipientEmail, phoneNumber, giftMessage } = gift;

    if (!planId || !categoryId || !coachId) {
      console.warn("Invalid gift subscription metadata", metadata);
      return;
    }

    if (!recipientEmail && !phoneNumber) {
      console.warn("Gift missing recipient contact", gift);
      return;
    }

    // Optional: find receiver if email exists
    const receiver = recipientEmail
      ? await UserModel.findOne({ email: recipientEmail })
      : null;

    // Generate coupon
    const couponCode =
      "MUTAG-" + Math.random().toString(36).slice(2, 10).toUpperCase();

    // Calculate expiry
    const now = new Date();
    let expiresAt = new Date(now);

    if (duration === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (duration === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Save coupon
    await CouponModel.create({
      code: couponCode,
      coachId,
      planId: paystackSubscriptionCode,
      // categoryId,
      giftedByUserId: sender._id,

      recipientEmail: recipientEmail || null,
      phoneNumber: phoneNumber || null,

      expiresAt,
      used: false,
    });

    /* ==========================
       📧 EMAIL DELIVERY
    ========================== */
    if (recipientEmail) {
      await sendEmail({
        from: "Muta App <no-reply@fitnessapp.com>",
        to: recipientEmail,
        subject: "🎁 You received a gift subscription!",
        html: `
          <p>Hello!</p>
          <p>${sender.firstName} ${
          sender.lastName
        } gifted you a fitness subscription 💪</p>
          <p><strong>Coupon Code:</strong> ${couponCode}</p>
          <p>${giftMessage || ""}</p>
          <p>Open the Muta app and redeem your gift.</p>
        `,
      });
    }

    /* ==========================
       📱 SMS DELIVERY
    ========================== */
    if (phoneNumber) {
      const message = ` 🎁 You received a gift subscription from ${sender.firstName}! Coupon: ${couponCode} Redeem it in the Muta app.`;
      await sendOTP(phoneNumber, message);
    }

    /* ==========================
       🔔 NOTIFY SENDER
    ========================== */
    await NotificationModel.create({
      userId: sender._id,
      title: "Gift Sent 🎁",
      body: recipientEmail
        ? `Your gift subscription was sent to ${recipientEmail}`
        : `Your gift subscription was sent to ${phoneNumber}`,
    });

    console.log("🎁 Gift subscription created", {
      sender: sender.email,
      recipientEmail,
      phoneNumber,
    });
  } catch (error) {
    console.error("Error in handleGiftSubscription:", error);
  }
}

async function handleNormalSubscription(data, user) {
  try {
    const metadata = data.metadata || {};
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
