const admin = require("firebase-admin");
// const serviceAccount = require("../firebase.json");


if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


const sendPushNotification = async ({ deviceToken, topic, title, body, data = {} }) => {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: data,
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