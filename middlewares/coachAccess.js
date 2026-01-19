const SubscriptionModel = require("../models/subscription.model");
const auth = require("./auth");

async function coachAccessAuth(req, res, next) {
  try {
    auth(req, res, async () => {
      const subscription = await SubscriptionModel.findOne({
        user: req.user.id,
      });
      if (!subscription) {
        return res.status(403).json({
          success: false,
          data: {
            error: "Access denied. Subcribed users only",
          },
        });
      }
      if (req.user.userType == "user" && hasActiveSubscription(subscription)) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          data: {
            error: "Access denied. Coaches only",
          },
        });
      }
    });
  } catch (error) {
    console.log(error, "the coach auth error");
  }
}

module.exports = coachAccessAuth;

function hasActiveSubscription(subscription) {
  if (!subscription) return false;

  return (
    subscription.status === "active" &&
    new Date(subscription.currentPeriodEnd) > new Date()
  );
}
