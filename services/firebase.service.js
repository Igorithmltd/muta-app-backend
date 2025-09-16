const admin = require("firebase-admin");
const serviceAccount = require("../firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const sendPushNotification = async ({ deviceToken, topic, title, body }) => {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        ...(deviceToken && { token: deviceToken }),
        ...(topic && { topic }),
      };
  
      const response = await admin.messaging().send(message);
      console.log("✅ Push Notification Sent:", response);
      return response;
    } catch (error) {
      console.error("❌ Error Sending Notification:", error);
      throw error;
    }
  };
  
  
  module.exports = {
    sendPushNotification,
  };