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
  console.log(data, 'handleSubscriptionDisable')
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
    const customerCode = data.customer.customer_code || ""
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
    user.customerCode = customerCode
    await user.save()

    const subscription = await SubscriptionModel.findOne(filter);
    console.log(
      { paystackSubscriptionCode: planCode, subscription, filter },
      "handleSubscriptionCreate"
    );

    if (subscription) {
      subscription.subscriptionCode = data.subscription_code;
      subscription.paystackSubscriptionId = data.plan.plan_code;
      subscription.paystackEmailToken = data.email_token | ""
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
    console.log({ metadata, gift }, "handleGiftSubscription");

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
    let expiresAt = new Date(now);

    if (duration === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (duration === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    console.log("coupon creation amount", metadata.amount)
    // Save coupon
    await CouponModel.create({
      code: couponCode,
      // coachId,
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
  //   if (recipientEmail) {
  //     const emailHtml = `
  // <div style="margin:0; padding:0; background-color:#f0f9ff; font-family: Arial, sans-serif;">
  //   <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9ff; padding: 20px 0;">
  //     <tr>
  //       <td align="center">
          
  //         <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            
  //           <!-- Header -->
  //           <tr>
  //             <td style="background:#38bdf8; padding:20px; text-align:center;">
  //               <h1 style="margin:0; color:#ffffff; font-size:20px;">
  //                 You’ve Received a Gift 🎁
  //               </h1>
  //             </td>
  //           </tr>

  //           <!-- Body -->
  //           <tr>
  //             <td style="padding:30px 25px; color:#444;">
                
  //               <p style="margin:0 0 15px; font-size:16px;">
  //                 Hey <strong>${recipientName || recipientEmail}</strong>! 🎉
  //               </p>

  //               <p style="margin:0 0 15px;">
  //                 You’ve just been gifted a fitness boost by 
  //                 <strong>${sender.firstName} ${sender.lastName}</strong>! 💪
  //               </p>

  //               <p style="margin:0 0 15px;">
  //                 Muta Fitness is cheering you on — because someone believes in your goals and your glow-up! ✨
  //               </p>

  //               <!-- Coupon Box -->
  //               <div style="text-align:center; margin:20px 0;">
  //                 <span style="
  //                   display:inline-block;
  //                   padding:14px 24px;
  //                   background:#e0f2fe;
  //                   color:#0369a1;
  //                   font-size:18px;
  //                   font-weight:bold;
  //                   border-radius:8px;
  //                   letter-spacing:2px;
  //                 ">
  //                   ${couponCode}
  //                 </span>
  //               </div>

  //               ${
  //                 giftMessage
  //                   ? `<p style="margin:15px 0; font-style:italic; color:#555;">
  //                       "${giftMessage}"
  //                     </p>`
  //                   : ""
  //               }

  //               <p style="margin:20px 0;">
  //                 Open your Muta app, claim your gift, and start your journey to a healthier, stronger, and happier YOU! 🏋🏽‍♀️
  //               </p>

  //               <!-- CTA Button -->
  //               <div style="text-align:center; margin:25px 0;">
  //                 <a href="https://muta.fit" style="
  //                   display:inline-block;
  //                   padding:12px 24px;
  //                   background:#38bdf8;
  //                   color:#ffffff;
  //                   text-decoration:none;
  //                   border-radius:25px;
  //                   font-weight:bold;
  //                   font-size:14px;
  //                 ">
  //                   Redeem Gift
  //                 </a>
  //               </div>

  //               <p style="font-size:12px; color:#999; text-align:center;">
  //                 If you have any issues redeeming your gift, please contact support.
  //               </p>

  //             </td>
  //           </tr>

  //           <!-- Footer -->
  //           <tr>
  //             <td style="background:#e0f2fe; padding:15px; text-align:center; font-size:12px; color:#888;">
  //               © ${new Date().getFullYear()} Muta Fitness. All rights reserved.
  //             </td>
  //           </tr>

  //         </table>

  //       </td>
  //     </tr>
  //   </table>
  // </div>
  //      `;

  //     await sendEmail({
  //       to: recipientEmail,
  //       subject: "You received a gift subscription!",
  //       html: emailHtml,
  //     });
  //   }

  if (recipientEmail) {
    const redeemUrl = `https://muta.fit/subscription/redeem-gift?code=${encodeURIComponent(
      couponCode
    )}&gifter=${sender.firstName}`;
  
    const emailHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>You've Received a MutaFit Premium Gift</title>
  </head>
  
  <body style="
    margin:0;
    padding:0;
    background-color:#0b0b0b;
    font-family:Arial, Helvetica, sans-serif;
    color:#ffffff;
  ">
  
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        background-color:#0b0b0b;
        padding:40px 15px;
      "
    >
      <tr>
        <td align="center">
  
          <!-- Main Email Container -->
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              max-width:650px;
              background-color:#111111;
              border-radius:4px;
              overflow:hidden;
            "
          >
  
            <!-- Logo -->
            <tr>
              <td style="padding:45px 50px 30px 50px;">
  
                <div style="
                  font-size:30px;
                  line-height:1;
                  font-weight:700;
                  letter-spacing:-1px;
                ">
                  <span style="color:#087cff;">MUTA</span><span style="color:#ffffff;">FIT</span>
                </div>
  
              </td>
            </tr>
  
            <!-- Heading -->
            <tr>
              <td style="padding:10px 50px 0 50px;">
  
                <h1 style="
                  margin:0;
                  color:#ffffff;
                  font-size:42px;
                  line-height:1.15;
                  font-weight:400;
                  letter-spacing:-1px;
                ">
                  You've Received a<br />
                  MutaFit Premium<br />
                  Gift
                </h1>
  
              </td>
            </tr>
  
            <!-- Greeting + Message -->
            <tr>
              <td style="padding:35px 50px 10px 50px;">
  
                <p style="
                  margin:0 0 18px 0;
                  font-size:17px;
                  line-height:1.6;
                  color:#d0d0d0;
                ">
                  Hello <strong style="color:#ffffff;">
                    ${recipientName}
                  </strong>,
                </p>
  
                <p style="
                  margin:0 0 18px 0;
                  font-size:17px;
                  line-height:1.6;
                  color:#d0d0d0;
                ">
                  Great news! Someone has gifted you a MutaFit Premium
                  subscription to support your health, fitness, and
                  wellness journey.
                </p>
  
                <p style="
                  margin:0;
                  font-size:17px;
                  line-height:1.6;
                  color:#d0d0d0;
                ">
                  <strong style="color:#ffffff;">
                    ${sender.firstName} ${sender.lastName}
                  </strong>
                  believes in your goals and your journey.
                </p>
  
              </td>
            </tr>
  
            <!-- Premium Description -->
            <tr>
              <td style="padding:20px 50px 10px 50px;">
  
                <p style="
                  margin:0;
                  font-size:17px;
                  line-height:1.6;
                  color:#d0d0d0;
                ">
                  With <strong style="color:#ffffff;">MutaFit Premium</strong>,
                  you'll gain access to premium features, personalized
                  experiences, and progress tracking tools to help you
                  stay motivated and achieve your goals.
                </p>
  
              </td>
            </tr>
  
            <!-- Gift Message -->
            ${
              giftMessage
                ? `
            <tr>
              <td style="padding:20px 50px 0 50px;">
  
                <div style="
                  border-left:3px solid #087cff;
                  padding:12px 18px;
                  background:#171717;
                ">
                  <p style="
                    margin:0;
                    font-size:16px;
                    line-height:1.6;
                    color:#bdbdbd;
                    font-style:italic;
                  ">
                    "${giftMessage}"
                  </p>
                </div>
  
              </td>
            </tr>
            `
                : ""
            }
  
            <!-- Gift Code -->
            <tr>
              <td style="padding:30px 50px 10px 50px;">
  
                <p style="
                  margin:0 0 10px 0;
                  font-size:14px;
                  color:#888888;
                ">
                  Gift Code:
                </p>
  
                <div style="
                  background:#191919;
                  border:1px solid #292929;
                  border-radius:8px;
                  padding:20px;
                ">
  
                  <p style="
                    margin:0;
                    color:#ffffff;
                    font-size:21px;
                    font-weight:700;
                    letter-spacing:2px;
                    word-break:break-all;
                    text-align:center;
                  ">
                    ${couponCode}
                  </p>
  
                </div>
  
              </td>
            </tr>
  
            <!-- CTA -->
            <tr>
              <td align="center" style="padding:30px 50px 20px 50px;">
  
                <a
                  href="${redeemUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    display:inline-block;
                    padding:17px 48px;
                    background:#087cff;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:8px;
                    font-size:18px;
                    font-weight:600;
                    text-align:center;
                  "
                >
                  View Gift
                </a>
  
              </td>
            </tr>
  
            <!-- Fallback URL -->
            <tr>
              <td style="padding:5px 50px 35px 50px;">
  
                <p style="
                  margin:0;
                  text-align:center;
                  font-size:12px;
                  line-height:1.5;
                  color:#666666;
                ">
                  If the button doesn't work, copy and paste this link
                  into your browser:
                </p>
  
                <p style="
                  margin:8px 0 0;
                  text-align:center;
                  font-size:11px;
                  line-height:1.5;
                  color:#087cff;
                  word-break:break-all;
                ">
                  ${redeemUrl}
                </p>
  
              </td>
            </tr>
  
            <!-- Footer -->
            <tr>
              <td style="
                padding:25px 50px;
                border-top:1px solid #222222;
              ">
  
                <p style="
                  margin:0;
                  text-align:center;
                  font-size:13px;
                  line-height:1.6;
                  color:#666666;
                ">
                  Your journey to a healthier, fitter you starts here.
                </p>
  
                <p style="
                  margin:10px 0 0;
                  text-align:center;
                  font-size:12px;
                  color:#555555;
                ">
                  © ${new Date().getFullYear()} MutaFit.
                  All rights reserved.
                </p>
  
              </td>
            </tr>
  
          </table>
  
        </td>
      </tr>
    </table>
  
  </body>
  </html>
    `;
  
    await sendEmail({
      to: recipientEmail,
      subject: "You've Received a MutaFit Premium Gift!",
      html: emailHtml,
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
    console.log(
      { paystackSubscriptionCode: planCode, subscription, filter },
      "handleNormalSubscription"
    );

    if (!subscription) {
      console.log(
        "Subscription does not exist, creating new subscription from webhook"
      );

      // Optional: fallback values if you have a mapping table or default plan/coach
      console.log(
        new Date(),
        "Creating handle normal subscription with start date"
      );

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
        amount: metadata.amount
      });

      let chat = await ChatRoomModel.findOne({
        type: "private",
        participants: { $all: [user._id, metadata.coachId] },
      });

      console.log({user1: user, user2: metadata.coachId})

      if (!chat) {
        chat = await ChatRoomModel.create({
          type: "private",
          participants: [user._id, metadata.coachId],
        });
      }

      console.log({chat})

      return;
    } else {
      subscription.status = "active";
      (subscription.paystackSubscriptionId =
        metadata.paystackSubscriptionCode || null),
        (subscription.startDate = new Date(data.paid_at)),
        (subscription.coachId = metadata.coachId),
        (subscription.categoryId = metadata.categoryId),
        (subscription.planId = metadata.planId),
        (subscription.amount = metadata.amount),
        (subscription.user = user._id),
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

module.exports = {
  handleChargeSuccess,
  handlePaymentFailed,
  handleSubscriptionDisable,
  handleSubscriptionCreate,
  handleInvoiceFailed,
};
