const cron = require("node-cron");
const UserModel = require("../../models/user.model");
const SubscriptionModel = require("../../models/subscription.model");


// Run daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("📆 Running subscription expiry check...");

  try {
    const now = new Date();

    // 🔍 Find subscriptions that have expired and are still marked as "active"
    const expiredSubscriptions = await SubscriptionModel.find({
      expiryDate: { $lte: now },
      status: "active",
    });

    for (const subscription of expiredSubscriptions) {
      // 1. Update subscription status to expired
      subscription.status = "expired";
      await subscription.save();

      // 2. Optionally update the user model
      const user = await UserModel.findById(subscription.user);
      if (user) {
        user.subscriptionPlan = null;
        user.subscriptionStart = null;
        user.subscriptionExpiry = null;
        user.coachAssigned = null; // if needed
        await user.save();
      }

      console.log(`⛔ Subscription expired for user ${subscription.user}`);
    }

    console.log(`✅ Checked ${expiredSubscriptions.length} subscriptions.`);

  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
});
