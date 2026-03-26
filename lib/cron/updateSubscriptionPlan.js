const cron = require("node-cron");
const UserModel = require("../../models/user.model");
const SubscriptionModel = require("../../models/subscription.model");

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
  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
});
