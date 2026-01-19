const CouponModel = require("../models/coupon.model");
const NotificationModel = require("../models/notification.model");
const OrderModel = require("../models/order.model");
const PaymentModel = require("../models/payment.model");
const SubscriptionModel = require("../models/subscription.model");
const UserModel = require("../models/user.model");
const paystackAxios = require("../services/paystack.client.service");
const sendEmail = require("./emailService");

async function handleChargeSuccess(data) {
    console.log({handleChargeData: data})
  const metadata = data.metadata || {};
  const reference = data.reference;
  const userEmail = data.customer.email;
  const subscriptionCode = data.subscription?.subscription_code || null;

  const user = await UserModel.findOne({ email: userEmail });
  if (!user) return;

  // 1️⃣ Idempotency: prevent duplicate payments
  const existingPayment = await PaymentModel.findOne({ reference });
  if (existingPayment) return;

  // 2️⃣ Always record payment
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
    const orderId = metadata.orderId;
    if (!orderId) return;

    const order = await OrderModel.findById(orderId);
    if (!order || order.paymentStatus === "success") return;

    order.paymentStatus = "success";
    order.paymentReference = reference;
    order.paymentDate = new Date();
    await order.save();

    return;
  }

  // ==========================
  // 🔁 SUBSCRIPTION PAYMENT FLOW
  // ==========================

  if (metadata.type === "order") {
    await handleOrderPayment(metadata, reference);
    return;
  }

  // =====================
  // 🎁 GIFT SUBSCRIPTION
  // =====================
  if (metadata.type === "subscription" && metadata.isGift === true) {
    await handleGiftSubscription(data, user, metadata);
    return;
  }

  // =====================
  // 🔁 NORMAL SUBSCRIPTION
  // =====================
  if (metadata.type === "subscription") {
    await handleNormalSubscription(data, user, metadata);
  }
//   if (metadata.type !== "subscription") return;

//   // 🟢 RENEWAL (subscription already exists)
//   if (subscriptionCode) {
//     const subscription = await SubscriptionModel.findOne({
//       subscriptionCode,
//     });

//     if (!subscription) return;

//     subscription.status = "active";
//     subscription.lastPaymentAt = new Date(data.paid_at);
//     subscription.currentPeriodEnd = new Date(
//       data.subscription.next_payment_date
//     );
//     subscription.nextPaymentDate = new Date(
//       data.subscription.next_payment_date
//     );

//     await subscription.save();
//     return;
//   }

//   // 🟡 INITIAL SUBSCRIPTION PAYMENT (no subscription yet)
//   await createInitialSubscriptionFromCharge(data, user, metadata);
}

async function createInitialSubscriptionFromCharge(data, user, metadata) {
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
}

async function handlePaymentFailed(data) {
  if (!data.subscription) return;

  await Subscription.findOneAndUpdate(
    { subscriptionCode: data.subscription.subscription_code },
    { status: "failed" }
  );
}

async function handleSubscriptionDisable(data) {
  await SubscriptionModel.findOneAndUpdate(
    { subscriptionCode: data.subscription_code },
    {
      status: "cancelled",
      cancelledAt: new Date(),
    }
  );
}

async function handleSubscriptionCreate(data) {
  await SubscriptionModel.findOneAndUpdate(
    { subscriptionCode: data.subscription_code },
    {
      paystackSubscriptionId: data.id,
      nextPaymentDate: new Date(data.next_payment_date),
    }
  );
}

async function handleInvoiceFailed(data) {
  if (!data.subscription) return;

  await SubscriptionModel.findOneAndUpdate(
    { subscriptionCode: data.subscription.subscription_code },
    { status: "failed" }
  );
}

async function handleGiftSubscription(data, sender, metadata) {
  const { planId, categoryId, coachId, recipientEmail, duration } = metadata;

  if (!planId || !categoryId || !coachId || !recipientEmail) {
    console.warn("Invalid gift subscription metadata", metadata);
    return;
  }

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
    planId,
    categoryId,
    giftedByUserId: sender._id,
    recipientEmail,
    expiresAt,
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
  await NotificationModel.create({
    user: sender._id,
    title: "Gift Sent 🎁",
    body: `Your gift subscription has been successfully sent to ${recipientEmail}.`,
  });

  console.log(
    `🎁 Gift subscription created by ${sender.email} for ${recipientEmail}`
  );
}

async function handleNormalSubscription(data, user, metadata) {
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
}

async function handleGiftSubscription(data, sender, metadata) {
    const {
      planId,
      categoryId,
      coachId,
      recipientEmail,
      duration,
    } = metadata;
  
    if (!planId || !categoryId || !coachId || !recipientEmail) {
      console.warn("Invalid gift subscription metadata", metadata);
      return;
    }
  
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
      planId,
      categoryId,
      giftedByUserId: sender._id,
      recipientEmail,
      expiresAt,
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
    await NotificationModel.create({
      user: sender._id,
      title: "Gift Sent 🎁",
      body: `Your gift subscription has been successfully sent to ${recipientEmail}.`,
    });
  
    console.log(
      `🎁 Gift subscription created by ${sender.email} for ${recipientEmail}`
    );
  }

  async function handleOrderPayment(metadata, reference) {
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
      user: order.user,
      title: "Payment Successful",
      body: "Your order payment was successful and is being processed.",
    });
  
    console.log(`🛒 Order ${order._id} marked as paid`);
  }
  
  

module.exports = {
  handleChargeSuccess,
  handlePaymentFailed,
  handleSubscriptionDisable,
  handleSubscriptionCreate,
  handleInvoiceFailed,
};
