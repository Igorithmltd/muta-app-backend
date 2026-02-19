const admin = require("firebase-admin");
const UserModel = require("../models/user.model");
// const serviceAccount = require("../firebase.json");


if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


const sendPushNotification = async ({ deviceToken, topic, title=null, body=null, data = {}, notificationType="general" }) => {
    try {
      const stringifiedData = {};
      Object.entries(data).forEach(([key, value]) => {
        stringifiedData[key] =
          typeof value === 'string' ? value : JSON.stringify(value);
      });
      // Add notificationType to the flat data object
      // stringifiedData.notificationType = String(notificationType);

      const message = {
        ...(notificationType != "call" && {notification: {
          title,
          body,
        }}),
        data: stringifiedData,
        // data: {
        //   data: stringifiedData,
        //   notificationType: String(notificationType),
        // },
        ...(deviceToken && { token: deviceToken }),
        ...(topic && { topic }),
      };
  
      const response = await admin.messaging().send(message);
      // console.log("✅ Push Notification Sent:", response);
      console.log("✅ Push Notification Sent:", {caller: message.data.caller, receiver: message.data.receiver});
      return response;
    } catch (error) {
      console.error("❌ Error Sending Notification:", error);
      if (error.code === "messaging/registration-token-not-registered") {
        // remove token from DB
        await UserModel.updateOne(
          { deviceToken: deviceToken },
          { $unset: { deviceToken: "" } }
        );
      }
      throw error;
    }
};
  
  
  module.exports = {
    sendPushNotification,
  };