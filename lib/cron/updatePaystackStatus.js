const cron = require("node-cron");
const SubscriptionModel = require("../../models/subscription.model");
const paystackAxios = require("../../services/paystack.client.service");

cron.schedule("0 2 * * *", async () => {
    const subscriptions = await SubscriptionModel.find({
      subscriptionCode: { $ne: null },
    });
  
    for (const sub of subscriptions) {
      await syncSubscriptionFromPaystack(sub);
    }
  });

cron.schedule("0 3 * * *", async () => {
    const gracePeriodMs = 3 * 24 * 60 * 60 * 1000;
  
    await SubscriptionModel.updateMany(
      {
        status: "active",
        currentPeriodEnd: {
          $lt: new Date(Date.now() - gracePeriodMs),
        },
      },
      { status: "expired" }
    );
  });
  

  async function syncSubscriptionFromPaystack(subscription) {
    try {
      const res = await paystackAxios.get(
        `/subscription/${subscription.subscriptionCode}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );
  
      const data = res.data.data;
  
      subscription.status =
        data.status === "active" ? "active" : subscription.status;
  
      if (data.next_payment_date) {
        subscription.currentPeriodEnd = new Date(data.next_payment_date);
        subscription.nextPaymentDate = new Date(data.next_payment_date);
      }
  
      await subscription.save();
    } catch (err) {
      console.error(
        `Paystack sync failed for ${subscription.subscriptionCode}:`,
        err.message
      );
    }
  }
  