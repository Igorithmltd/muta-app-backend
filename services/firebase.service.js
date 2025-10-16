const admin = require("firebase-admin");
const serviceAccount = require("../firebase.json");

const servAll = {
  "type": "service_account",
  "project_id": "nord-react-nativer",
  "private_key_id": "2dc16001ad7e63d1ef8e7a6b",
  "private_key": "-----+Mdz5z7Oxy41i4ZDOApnDkr\ncm6RmreO3yOJKzrldCXC8Z60f7LgehbvsDc0TEpZ7ZAeMMQMuc9Zt3pvgCtf0B3h\nYNd7+TMqRJ8km6HO9PbHMRQdje7GU5NIocGG6+Euuwrh/0YAMPsQQnpmLDwlPfdt\n6YqADWSzQD9LODh3obyn3gfm5Z74I8hMJI/vEOYldRUzBPo4AxyQazA25nootXZ+\nwWzzMntVAgMBAAECggEAHFiI/XZFKi/v2iy1PWMoMrHkIuwJV0+P8X6ZJdSn5fZl\nqB+oV7lxxub90WsPtrA/RXWFx2n/y6rcQ7x6nSC+4bbw8XpqZ/la3UrZU2+kIiOZ\ntnbX+5tb/amz/0W+K97xn9dPCF1J2K7m8t/IjN0Pv8TuKjD8HgBzgI8U+QJg7T/9\nltPZ56rc2GKeTmeWFbL7ovPpwPOnqPdU6jlcmZAwcsyTzq2CDUoGaVB0mVmP7tNW\noviERaQ8ch+bAn83Qw7lGNTfUxKRAfJawxz8foZWqChu68qGJxrVJ+bG1HLZojaK\n8jS3OpPsOnUqvP2BSgnO/Mg3d/Vg1aAqD2WxjMccWQKBgQD8A9eAsygdujA6fJB/\npVL67TjCXRhcK6OSUrRJ2NJvirF918hRRqNIgGHFih2LuCZU02yHr6/58JgrjzGQ\nxO4svP29IH2WYS0pVg7a5Z7g9H30DBAzm4eacN6Y/WcR7Ab6u0x+Ii9YT0zVcpQQ\nldlIxQsEYr/48RfndlYulLqe+wKBgQDkOFs3+XhpXuJXb8iKqh5x0+VCFijhFGDK\nAfDYwnApBL3gsuRCGdm6uPGXyuovpjwZ1SYkCjMRDG7gKqF7yArtn82ev0GVF+e1\njEB+0zUpCXFPTk2A1gtuBipNBjb346G13kvg3RwgY/6Z9wwjgIGucCZu0j71ngrW\nZkcC7m797wKBgFdXGYPgE2IiGf7bFtU2Pcj7F/W8f+nJsfnPMe5594xyu8rKUwFg\nAszouXnVwSGgI6C4WV+5ErsDmClYiiwLJCRbJ3E5Zm0MprMxwRo6BFMgSNqgp6jL\nGTb8MRlCkUsTyuNwsDTysgfgC9fZytjophJjP8s4UiH7pHYye/HO19KrAoGAOHOk\nRLVFzrK0xDIXZg1smHV0qSM4G2ziADX4sHVwLwVIPpOhmKQyUli7EfQUd5LkHPO3\nioSnWxk7N+Hzrd2urlawEwt2Gn4eR68YqQZviOYYDCjvTOYlT6Lgxcq6wBijgIwr\nMsUe1vhFGyqb6xA3g8GkEBebkT/1qFEGUbhO5isCgYASu+XjMXJYna2iNDn+z7ED\n+N+J81GxjKJK+U38djHyXxJ1S4bZIKN2vzILipoPj1g+PBjAQwVnZ4WntkOOUcm3\nUL471M95TxTUE0xc6E9QCx+BBg9+F09wHdJCLLK/QL7+MOIiy5hFmAnZ+xDDC1T8\n/qgdGq27jaBrSmOc+vs2pQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-1uordam.gserviceaccount.com",
  "client_id": "10801ereuifuiekejkfe164767547klkelkflelkfeef9344858884",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/fdafdfadfdffirebase-adminsdk-1uwy2%40nord-react-native.iam.gserviceaccount.com",
  "universe_domain": "googleapis.comer"
}


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