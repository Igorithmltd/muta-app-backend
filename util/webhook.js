const crypto = require("crypto");
const UserModel = require("../models/user.model.js");
// const WalletModel = require("../models/wallet.model.js");
// const TransactionModel = require("../models/transaction.model.js");
// const NotificationModel = require("../models/notification.model.js");
// const PayoutItemModel = require("../models/payoutItem.model.js");

const webhookFunction = async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers["x-paystack-signature"];

  // ✅ Ensure raw body for signature verification (middleware must provide rawBody)
  const hash = crypto
    .createHmac("sha512", secret)
    .update(req.body) // raw body, not parsed JSON
    // .update(req.rawBody) // raw body, not parsed JSON
    .digest("hex");

  if (hash !== signature) {
    console.log("❌ Invalid Paystack signature");
    return res.status(401).send("Unauthorized: Invalid signature");
  }

  try {
    const event = JSON.parse(req.body.toString());
    // const event = req.body;

    if (event.event === "charge.success") {
      const { data } = event;
      const transactionId = data.id;
      const reference = data.reference;
      const userEmail = data.customer.email;
      const amount = data.amount / 100; // kobo to naira

      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).send("User not found");
      }

      // ✅ Check if transaction already processed
      const existingTx = await TransactionModel.findOne({ transaction: reference });
      if (existingTx) {
        return res.status(200).send("Duplicate transaction ignored");
      }

      // ✅ Get or create wallet
      let wallet = await WalletModel.findOne({ userId: user._id });
      if (!wallet) {
        wallet = await WalletModel.create({
          userId: user._id,
          balance: 0,
        });
      }

      // ✅ Update wallet balance safely
      wallet.balance += amount;
      await wallet.save();

      // ✅ Save transaction record
    //   const transaction = new TransactionModel({
    //     userId: user._id,
    //     walletId: wallet._id,
    //     amount,
    //     transaction: reference,
    //     status: "success",
    //     type: "wallet", // money coming in
    //     gatewayResponse: data.gateway_response,
    //     trxref: transactionId,
    //   });
    //   await transaction.save();

      // ✅ Create notification
    //   await NotificationModel.create({
    //     userId: user._id,
    //     title: "Wallet Funded",
    //     message: `₦${amount.toLocaleString()} has been added to your wallet.`,
    //   });

      console.log(`✅ Wallet funded: User ${user._id}, Amount ₦${amount}`);
    }
    
    if (event.event === "transfer.success" || event.event === "transfer.failed") {
      const data = event.data;
      const transferCode = data.transfer_code;
      const status = event.event === "transfer.success" ? "success" : "failed";

    }


    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error processing webhook:", err);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = webhookFunction;





















// const TransactionModel = require("../models/transaction.model.js");
// const UserModel = require("../models/user.model.js");
// const NotificationModel = require("../models/notification.model.js");
// const crypto = require("crypto");

// const webhookFunction = async (req, res) => {
//   const rawBody = req.body;
//   const secret = process.env.PAYSTACK_SECRET_KEY;
//   const signature = req.headers["x-paystack-signature"];

//   const hash = crypto
//     .createHmac("sha512", secret)
//     .update(rawBody)
//     .digest("hex");

//   if (hash !== signature) {
//     console.log("Invalid signature");
//     return res.status(401).send("Unauthorized: Invalid signature");
//   }

//   try {
//     const event = JSON.parse(req.body.toString("utf8"));

//     if (event.event === "charge.success") {
//       const { data } = event;
//       const transactionId = data.id;
//       const reference = data.reference;
//       const userEmail = data.customer.email;
//       const amount = data.amount / 100;

//       const user = await UserModel.findOne({ email: userEmail });
//       if (!user) {
//         return res.status(401).send("Unauthorized: User not found");
//       }

//       // Update the user's balance
//       user.balance += amount;
//       await user.save();

//       // Save the transaction
//       const transaction = new TransactionModel({
//         userId: user._id,
//         amount,
//         transaction: reference,
//         status: "success",
//         type: "wallet",
//         trxref: transactionId,
//       });

//       await transaction.save();

//       await NotificationModel.create({
//         userId: user._id,
//         title: "Fund Wallet",
//         message: `You have successfully funded your wallet with ₦${amount}`,
//       });
//     }

//     return res.status(200).send("Webhook received");
//   } catch (err) {
//     console.error("❌ Error processing webhook:", err);
//     return res.status(500).send("Internal Server Error");
//   }
// };

// module.exports = webhookFunction;
