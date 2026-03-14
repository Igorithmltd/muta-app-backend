const CouponModel = require("../models/coupon.model");
const NotificationModel = require("../models/notification.model");
const OrderModel = require("../models/order.model");
const PaymentModel = require("../models/payment.model");
const SubscriptionModel = require("../models/subscription.model");
const UserModel = require("../models/user.model");
const paystackAxios = require("../services/paystack.client.service");
const sendEmail = require("./emailService");
const otpSend = require("./otpSend");

async function handleChargeSuccess(data) {
  try {
    // console.log({ data }, "handleChargeSuccess");
    const metadata = data.metadata || {};
    const reference = data.reference;
    const userEmail = data.customer?.email;

    if (!userEmail) {
      console.log("No user email in charge.success");
      return;
    }

    // 1️⃣ Find user
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      console.log("User not found for email:", userEmail);
      return;
    }

    // 2️⃣ Prevent duplicate payments
    const existingPayment = await PaymentModel.findOne({ reference });
    if (existingPayment) {
      console.log("Payment already recorded:", reference);
      return;
    }

    // 3️⃣ Save payment
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

    console.log("Payment recorded:", reference);

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
    if (metadata.type === "subscription" && metadata.isGift == "true") {
      await handleGiftSubscription(data, user, metadata);
      return;
    }

    // ==========================
    // 🔁 NORMAL SUBSCRIPTION
    // ==========================
    if (metadata.type === "subscription") {
      if (!data.subscription) {
        await handleNormalSubscription(data, user);
        return;
      }

      const subscriptionCode = data.subscription.subscription_code;

      let subscription = await SubscriptionModel.findOne({
        subscriptionCode,
      });

      // 4️⃣ Create subscription if it doesn't exist
      if (!subscription) {
        console.log("Creating new subscription");

        subscription = await SubscriptionModel.create({
          user: metadata.payerId || user._id,
          coachId: metadata.coachId,
          planId: metadata.planId,
          categoryId: metadata.categoryId,
          status: "active",
          startDate: new Date(data.paid_at),
          subscriptionCode: subscriptionCode,
          paystackSubscriptionId: data.subscription.id,
          lastPaymentAt: new Date(data.paid_at),
          currentPeriodEnd: new Date(data.subscription.next_payment_date),
          nextPaymentDate: new Date(data.subscription.next_payment_date),
        });

        return;
      }

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
  } catch (error) {
    console.error("Error in handleChargeSuccess:", error);
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
    const email = data.customer.email;
    const planCode = data.plan.plan_code;
    const authorizationCode = data.authorization.authorization_code;
    // console.log(data, "handle subscription create");

    const user = await UserModel.findOne({ email });
    if (!user) {
      console.warn(
        "User not found for subscription.create, cannot create subscription",
        data.customer.email
      );
      return;
    }

    const filter = {
      user: user._id,
      paystackAuthorizationToken: authorizationCode,
      paystackSubscriptionId: planCode,
    };

    const subscription = await SubscriptionModel.findOne(filter);
    console.log(
      { paystackSubscriptionCode: planCode, subscription, filter },
      "handleSubscriptionCreate"
    );

    if (subscription) {
      subscription.subscriptionCode = data.subscription_code;
      subscription.paystackSubscriptionId = data.plan.plan_code;
      subscription.status = data.status || "active";
      subscription.nextPaymentDate = data.next_payment_date
        ? new Date(data.next_payment_date)
        : null;
      subscription.paystackAuthorizationToken = authorizationCode;

      await subscription.save();
      console.log(
        "✅ Subscription updated with Paystack subscription_code:",
        subscription.subscriptionCode
      );
    } else {
      console.log(new Date(), "Creating create subscription with start date");
      await SubscriptionModel.create({
        nextPaymentDate: data.next_payment_date,
        status: 'active',
        subscriptionCode: data.subscription_code,
        paystackSubscriptionId: data.plan.plan_code,
        paystackAuthorizationToken: authorizationCode,
        user: user._id,
        currentPeriodEnd: new Date(data.next_payment_date),
      });
    }
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
    console.log({ metadata, gift }, "handleGiftSubscription");

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
      giftedByUserId: sender._id,
      recipientEmail: recipientEmail || null,
      phoneNumber: phoneNumber || "",
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
      // const message = ` 🎁 You received a gift subscription from ${sender.firstName}! Coupon: ${couponCode} Redeem it in the Muta app.`;
      const message = ` You received a gift subscription Coupon. Redeem it in the Muta app. Go to playstore and download MutaApp`;
      await otpSend(phoneNumber, message);
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

async function handleNormalSubscription(data) {
  try {
    const email = data.customer.email;
    const planCode = data.plan.plan_code;
    const authorizationCode = data.authorization.authorization_code;
    const metadata = data.metadata || {};

    const user = await UserModel.findOne({ email });

    if (!user) {
      console.warn(
        "User not found for subscription.create, cannot create subscription",
        data.customer.email
      );
      return;
    }

    const filter = {
      user: user._id,
      paystackSubscriptionId: planCode,
      paystackAuthorizationToken: authorizationCode,
    };

    let subscription = await SubscriptionModel.findOne(filter);
    console.log({ paystackSubscriptionCode: planCode, subscription, filter }, "handleNormalSubscription");

    if (!subscription) {
      console.log(
        "Subscription does not exist, creating new subscription from webhook"
      );

      // Optional: fallback values if you have a mapping table or default plan/coach
      console.log(new Date(), "Creating handle normal subscription with start date");
      subscription = await SubscriptionModel.create({
        paystackSubscriptionId: metadata.paystackSubscriptionCode || null,
        startDate: new Date(data.paid_at),
        coachId: metadata.coachId,
        categoryId: metadata.categoryId,
        planId: metadata.planId,
        lastPaymentAt: new Date(data.paid_at),
        user: user._id,
        paystackAuthorizationToken: authorizationCode,
      });

      return;
    } else {
      subscription.status = "active";
      (subscription.paystackSubscriptionId =
        metadata.paystackSubscriptionCode || null),
        (subscription.startDate = new Date(data.paid_at)),
        (subscription.coachId = metadata.coachId),
        (subscription.categoryId = metadata.categoryId),
        (subscription.planId = metadata.planId),
        (user = user._id),
        (subscription.lastPaymentAt = new Date(data.paid_at));
      await subscription.save();
    }
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
