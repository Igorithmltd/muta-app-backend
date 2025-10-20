const admin = require("firebase-admin");
// const serviceAccount = require("../firebase.json");


if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


const sendPushNotification = async ({ deviceToken, topic, title=null, body=null, data = {}, notificationType="default" }) => {
    try {
      const stringifiedData = {};
      Object.entries(data).forEach(([key, value]) => {
        stringifiedData[key] = String(value);
      });

      const message = {
        notification: {
          title,
          body,
        },
        data: {
          data: stringifiedData,
          notificationType
        },
        ...(deviceToken && { token: deviceToken }),
        ...(topic && { topic }),
      };
  
      const response = await admin.messaging().send(message);
      // console.log("✅ Push Notification Sent:", response);
      console.log("✅ Push Notification Sent:", {message});
      return response;
    } catch (error) {
      console.error("❌ Error Sending Notification:", error);
      throw error;
    }
};
  
  
  module.exports = {
    sendPushNotification,
  };