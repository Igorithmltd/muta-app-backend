const crypto = require("crypto");
const { handleSubscriptionDisable, handleSubscriptionCreate, handleChargeSuccess, handleInvoiceFailed } = require("./webHookHelpers.js");

const webhookFunction = async (req, res) => {
  console.log("📩 Paystack webhook hit", new Date().toISOString());

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers["x-paystack-signature"];

  const hash = crypto
    .createHmac("sha512", secret)
    .update(req.body)
    .digest("hex");

  if (hash !== signature) {
    return res.status(401).send("Invalid signature");
  }

  try {
    const event = JSON.parse(req.body.toString());
    if (!event?.event || !event?.data) return res.sendStatus(200);

    switch (event.event) {
      case "charge.success":
        console.log("📩 Paystack webhook 2", event.data);
        await handleChargeSuccess(event.data);
        break;

      case "subscription.create":
        console.log("📩 Paystack webhook 3: subscription.create", event.data);
        await handleSubscriptionCreate(event.data);
        break;

      case "invoice.payment_failed":
        console.log("📩 Paystack webhook 4");
        await handleInvoiceFailed(event.data);
        break;

      case "subscription.disable":
        console.log("📩 Paystack webhook 5");
        await handleSubscriptionDisable(event.data);
        break;

      default:
        break;
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    return res.sendStatus(500);
  }
};

module.exports = webhookFunction;