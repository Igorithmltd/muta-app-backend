const cron = require("node-cron");
const UserModel = require("../../models/user.model");
const SubscriptionModel = require("../../models/subscription.model");
const CouponBalanceModel = require("../../models/couponBalance");
const CouponModel = require("../../models/coupon.model");

// Run daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("📆 Running subscription maintenance job...");

  try {
    const now = new Date();

    /*
    =============================
    1️⃣ HANDLE EXPIRED SUBSCRIPTIONS
    =============================
    */

    const expiredSubscriptions = await SubscriptionModel.find({
      currentPeriodEnd: { $lte: now },
      status: "active",
    });

    for (const subscription of expiredSubscriptions) {
      await subscription.deleteOne();
      console.log(`⛔ Subscription deleted for user ${subscription.user}`);

      console.log(`⛔ Subscription expired for user ${subscription.user}`);
    }

    console.log(
      `✅ Checked ${expiredSubscriptions.length} expired subscriptions.`
    );

    /*
    =============================
    2️⃣ REMOVE DUPLICATE PENDING SUBSCRIPTIONS
    =============================
    */

    const duplicates = await SubscriptionModel.aggregate([
      {
        $match: {
          status: "pending",
          paystackSubscriptionId: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            user: "$user",
            paystackSubscriptionId: "$paystackSubscriptionId",
          },
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    let deletedCount = 0;

    for (const dup of duplicates) {
      const idsToDelete = dup.ids.slice(1); // keep first

      const result = await SubscriptionModel.deleteMany({
        _id: { $in: idsToDelete },
      });

      deletedCount += result.deletedCount;
    }

    console.log(`🧹 Removed ${deletedCount} duplicate pending subscriptions`);

        /*
    =============================
    3️⃣ HANDLE EXPIRED COUPONS
    =============================
    */

    const expiredCoupons = await CouponModel.find({
      expiresAt: { $lte: now },
      used: false,
    });

    let refundedCoupons = 0;

    for (const coupon of expiredCoupons) {
      let couponBalance = await CouponBalanceModel.findOne({
        userId: coupon.giftedByUserId,
      });

      // Create balance record if it doesn't exist
      if (!couponBalance) {
        couponBalance = await CouponBalanceModel.create({
          userId: coupon.giftedByUserId,
          balance: 0,
        });
      }

      // Refund coupon amount
      couponBalance.balance =
        Number(couponBalance.balance) + Number(coupon.amount);

      await couponBalance.save();

      // Delete expired coupon after refund
      // await coupon.deleteOne();

      refundedCoupons++;

      console.log(
        `💰 Refunded ${coupon.amount} to user ${coupon.giftedByUserId}`
      );
    }

    console.log(
      `✅ Refunded ${refundedCoupons} expired coupon(s).`
    );

  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
});
