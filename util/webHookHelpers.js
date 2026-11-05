const { default: mongoose } = require("mongoose");
const ChatRoomModel = require("../models/chatModel");
const CouponModel = require("../models/coupon.model");
const NotificationModel = require("../models/notification.model");
const OrderModel = require("../models/order.model");
const PaymentModel = require("../models/payment.model");
const SubscriptionModel = require("../models/subscription.model");
const UserModel = require("../models/user.model");
const sendEmail = require("./emailService");
const otpSend = require("./otpSend");

async function handleChargeSuccess(data) {
  try {
    // console.log({ data }, "handleChargeSuccess");
    const metadata = data.metadata || {};
    const reference = data.reference;
    const userEmail = data.customer?.email;

    if (!userEmail) {
      return;
    }

    // 1️⃣ Find user
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return;
    }

    // 2️⃣ Prevent duplicate payments
    const existingPayment = await PaymentModel.findOne({ reference });
    if (existingPayment) {
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
    if (metadata.type === "gift") {
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
      // if (!subscription) {
      //   console.log("Creating new subscription");

      //   subscription = await SubscriptionModel.create({
      //     user: metadata.payerId || user._id,
      //     coachId: metadata.coachId,
      //     planId: metadata.planId,
      //     categoryId: metadata.categoryId,
      //     status: "active",
      //     startDate: new Date(data.paid_at),
      //     subscriptionCode: subscriptionCode,
      //     paystackSubscriptionId: data.subscription.id,
      //     lastPaymentAt: new Date(data.paid_at),
      //     currentPeriodEnd: new Date(data.subscription.next_payment_date),
      //     nextPaymentDate: new Date(data.subscription.next_payment_date),
      //   });

      //   return;
      // }

      // subscription.status = "active";
      // subscription.lastPaymentAt = new Date(data.paid_at);
      // subscription.currentPeriodEnd = new Date(
      //   data.subscription.next_payment_date
      // );
      // subscription.nextPaymentDate = new Date(
      //   data.subscription.next_payment_date
      // );

      // await subscription.save();
    }
  } catch (error) {
    console.error("Error in handleChargeSuccess:", error);
  }
}

async function handlePaymentFailed(data) {
  try {
    if (!data.subscription) return;

    await SubscriptionModel.findOneAndUpdate(
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
    // await SubscriptionModel.findOneAndDelete(
    //   { subscriptionCode: data.subscription_code }
    // );
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
    const customerCode = data.customer.customer_code || "";

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
    user.customerCode = customerCode;
    await user.save();

    const subscription = await SubscriptionModel.findOne(filter);

    if (subscription) {
      subscription.subscriptionCode = data.subscription_code;
      subscription.paystackSubscriptionId = data.plan.plan_code;
      subscription.paystackEmailToken = data.email_token | "";
      subscription.status = data.status || "active";
      subscription.nextPaymentDate = data.next_payment_date
        ? new Date(data.next_payment_date)
        : null;
      subscription.paystackAuthorizationToken = authorizationCode;

      await subscription.save();
    } else {
      // console.log(new Date(), "Creating create subscription with start date");
      // await SubscriptionModel.create({
      //   nextPaymentDate: data.next_payment_date,
      //   status: "active",
      //   subscriptionCode: data.subscription_code,
      //   paystackSubscriptionId: data.plan.plan_code,
      //   paystackAuthorizationToken: authorizationCode,
      //   user: user._id,
      //   currentPeriodEnd: new Date(data.next_payment_date),
      // });
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
      // coachId,
      duration,
      gift = {},
      paystackSubscriptionCode,
    } = metadata;
    const reference = data?.reference ?? "";

    const { recipientEmail, phoneNumber, giftMessage, recipientName } = gift;

    if (!planId || !categoryId) {
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
    let expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    // const now = new Date();
    // let expiresAt = new Date(now);

    // if (duration === "monthly") {
    //   expiresAt.setMonth(expiresAt.getMonth() + 1);
    // } else if (duration === "yearly") {
    //   expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    // }

    // Save coupon
    await CouponModel.create({
      code: couponCode,
      planId: paystackSubscriptionCode,
      giftedByUserId: sender._id,
      recipientEmail: recipientEmail || null,
      recipientName: recipientName || null,
      phoneNumber: phoneNumber || "",
      amount: metadata.amount / 100,
      expiresAt,
      used: false,
      reference,
    });

    /* ==========================
            📧 EMAIL DELIVERY
          ========================== */
    if (recipientEmail) {
      // Escape dynamic values before inserting them into HTML.
      const escapeHtml = (value = "") =>
        String(value).replace(
          /[&<>"']/g,
          (char) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            }[char])
        );

      // Prepare redemption URL.
      const cleanCode = encodeURIComponent(couponCode);
      const cleanGifter = encodeURIComponent(sender.firstName);

      const redeemUrl = `https://muta.fit/subscription/redeem-gift?code=${cleanCode}&gifter=${cleanGifter}`;

      const currentYear = new Date().getFullYear();

      // Safely prepare dynamic content.
      const safeRecipientName = escapeHtml(recipientName);
      const safeFirstName = escapeHtml(sender.firstName);
      const safeLastName = escapeHtml(sender.lastName);
      const safeCouponCode = escapeHtml(couponCode);
      const safeGiftMessage = giftMessage ? escapeHtml(giftMessage.trim()) : "";

      const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MutaFit Gift Notification</title>
</head>

<body style="
  margin:0;
  padding:20px 10px;
  background:#ffffff;
  font-family:Arial, Helvetica, sans-serif;
  font-size:15px;
  line-height:1.6;
  color:#444444;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    role="presentation"
    style="max-width:500px; margin:0 auto;"
  >

    <!-- Greeting and Message -->
    <tr>
      <td style="padding:10px 0;">

        <p style="margin:0 0 15px;">
          Hello <strong>${safeRecipientName}</strong>,
        </p>

        <p style="margin:0 0 15px;">
          Someone has gifted you a MutaFit Premium subscription
          to support your health, fitness, and wellness journey.
        </p>

        <p style="margin:0 0 15px;">
          <strong>${safeFirstName} ${safeLastName}</strong>
          believes in your goals and your journey.
        </p>

        <p style="margin:0 0 15px;">
          With <strong>MutaFit Premium</strong>, you'll gain access
          to premium features, personalized experiences, and
          progress tracking tools to help you stay motivated and
          achieve your goals.
        </p>

        ${
          safeGiftMessage
            ? `
              <p style="margin:0 0 20px;">
                ${safeGiftMessage}
              </p>
            `
            : ""
        }

      </td>
    </tr>

    <!-- Gift Code -->
    <tr>
      <td style="padding:10px 0;">

        <p style="margin:0 0 5px;">
          Your gift code is:
        </p>

        <p style="
          margin:0 0 15px;
          font-size:17px;
          font-weight:bold;
          color:#0369a1;
        ">
          ${safeCouponCode}
        </p>

      </td>
    </tr>

    <!-- Redemption Link -->
    <tr>
      <td style="padding:5px 0 20px;">

        <p style="margin:0 0 10px;">
          You can redeem your gift using the link below:
        </p>

        <p style="margin:0 0 15px;">
          <a
            href="${redeemUrl}"
            target="_blank"
            rel="noopener noreferrer"
            style="color:#0369a1;"
          >
            Redeem your MutaFit gift
          </a>
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="
        padding:15px 0;
        border-top:1px solid #eeeeee;
        font-size:12px;
        color:#888888;
      ">

        <p style="margin:0 0 5px;">
          Your journey to a healthier, fitter you starts here.
        </p>

        <p style="margin:0;">
          © ${currentYear} MutaFit. All rights reserved.
        </p>

      </td>
    </tr>

  </table>

</body>
</html>
`;

      await sendEmail({
        to: recipientEmail,
        subject: "You've received a MutaFit gift",
        html: emailHtml,
      });
    }

    //   <p style="
    //   margin:0;
    //   font-size:12px;
    //   line-height:1.5;
    //   color:#0369a1;
    //   text-align:center;
    //   word-break:break-all;
    // ">
    //   ${redeemUrl}
    // </p>

    /* ==========================
       📱 SMS DELIVERY
    ========================== */
    if (phoneNumber) {
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

    if (!subscription) {
      const duration = metadata.duration || "";
      const nextPaymentDate = generateNextPaymentDate(duration);

      subscription = await SubscriptionModel.create({
        paystackSubscriptionId: metadata.paystackSubscriptionCode || null,
        startDate: new Date(data.paid_at),
        coachId: metadata.coachId,
        categoryId: metadata.categoryId,
        planId: metadata.planId,
        lastPaymentAt: new Date(data.paid_at),
        user: user._id,
        paystackAuthorizationToken: authorizationCode,
        status: "active",
        currentPeriodEnd: nextPaymentDate,
        nextPaymentDate: nextPaymentDate,
        amount: metadata.amount,
      });

      // ✅ CHAT CREATION - Moved to a helper function
      await ensureChatRoom(user._id, metadata.coachId);

      return;
    } else {
      subscription.status = "active";
      subscription.paystackSubscriptionId =
        metadata.paystackSubscriptionCode || null;
      subscription.startDate = new Date(data.paid_at);
      subscription.coachId = metadata.coachId;
      subscription.categoryId = metadata.categoryId;
      subscription.planId = metadata.planId;
      subscription.amount = metadata.amount;
      subscription.user = user._id;
      subscription.lastPaymentAt = new Date(data.paid_at);
      await subscription.save();

      // ✅ CHAT UPDATE - Moved to a helper function
      await ensureChatRoom(user._id, metadata.coachId);
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
    order.orderStatus = "processing";
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

function generateNextPaymentDate(duration, startDate = new Date()) {
  const next = new Date(startDate);

  if (duration === "monthly") next.setMonth(next.getMonth() + 1);
  if (duration === "yearly") next.setFullYear(next.getFullYear() + 1);

  return next.toISOString().replace("Z", "+00:00");
}

async function ensureChatRoom(userId, coachId) {
  try {
    // Convert to ObjectId for consistency
    const userObjectId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
    const coachObjectId =
      typeof coachId === "string"
        ? new mongoose.Types.ObjectId(coachId)
        : coachId;

    // Try multiple query approaches
    let chat = await ChatRoomModel.findOne({
      type: "private",
      participants: { $all: [userObjectId, coachObjectId] },
    });

    // If no chat found, try alternative queries
    if (!chat) {
      // Alternative 1: Check if either participant exists
      chat = await ChatRoomModel.findOne({
        type: "private",
        $or: [
          { participants: { $all: [userObjectId, coachObjectId] } },
          { participants: { $all: [coachObjectId, userObjectId] } },
        ],
      });

      if (chat) {
        // Ensure both participants are in the array
        if (
          !chat.participants.some(
            (p) => p.toString() === userObjectId.toString()
          )
        ) {
          chat.participants.push(userObjectId);
        }
        if (
          !chat.participants.some(
            (p) => p.toString() === coachObjectId.toString()
          )
        ) {
          chat.participants.push(coachObjectId);
        }
        await chat.save();
        return chat;
      }

      // Alternative 2: Check individually
      const userChats = await ChatRoomModel.find({
        type: "private",
        participants: userObjectId,
      }).lean();

      const coachChats = await ChatRoomModel.find({
        type: "private",
        participants: coachObjectId,
      }).lean();

      // Alternative 3: Create new chat
      chat = await ChatRoomModel.create({
        type: "private",
        participants: [userObjectId, coachObjectId],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return chat;
    }

    // Chat exists - ensure both participants are present

    // Normalize participants array
    if (!Array.isArray(chat.participants)) {
      chat.participants = [];
    }

    // Ensure both participants are in the array (convert to strings for comparison)
    const participantStrings = chat.participants.map((p) => p.toString());
    const userString = userObjectId.toString();
    const coachString = coachObjectId.toString();

    let updated = false;
    if (!participantStrings.includes(userString)) {
      chat.participants.push(userObjectId);
      updated = true;
    }
    if (!participantStrings.includes(coachString)) {
      chat.participants.push(coachObjectId);
      updated = true;
    }

    if (updated) {
      await chat.save();
    }

    return chat;
  } catch (error) {
    console.error("❌ Error in ensureChatRoom:", error);
    // Don't throw - we want subscription to succeed even if chat creation fails
    return null;
  }
}

module.exports = {
  handleChargeSuccess,
  handlePaymentFailed,
  handleSubscriptionDisable,
  handleSubscriptionCreate,
  handleInvoiceFailed,
};
