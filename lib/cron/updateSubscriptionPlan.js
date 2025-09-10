const cron = require("node-cron");
const UserModel = require("../../models/user.model"); // adjust path

// Run daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running subscription expiry check...");

  try {
    const now = new Date();

    // Find users with expired premium subscriptions
    const expiredUsers = await UserModel.find({
      // subscriptionPlan: "premium",
      subscriptionExpiry: { $lte: now },
    });

    for (const user of expiredUsers) {
      user.subscriptionPlan = null; // or null
      user.subscriptionExpiry = null;
      user.subscriptionStart = null;
      user.coachAssigned = null; // optional
      await user.save();

    }

  } catch (err) {
    console.error("Cron job error:", err);
  }
});
