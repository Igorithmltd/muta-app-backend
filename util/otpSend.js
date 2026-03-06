const axios = require("axios");
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID;

const otpSend = async (phoneNumber, message, session = null) => {
  try {
    const phoneNo = formatPhoneNumber(phoneNumber);
    // console.log('Formatted phone number:', typeof phoneNo, phoneNo);
    // console.log({phoneNo, code})
    const response = await axios.post(
      "https://api.ng.termii.com/api/sms/send",
      {
        api_key: TERMII_API_KEY,
        to: phoneNo, // e.g. '2349012345678'
        from: TERMII_SENDER_ID, // Use 'Termii' or your sender ID
        channel: "generic", // Options: generic, dnd, whatsapp
        type: "plain",
        sms: message,

        // message_type: "NUMERIC",
        // pin_attempts: 3,
        // pin_time_to_live: 5,
        // pin_length: 6,
        // pin_placeholder: "< 123456 >",
        // message_text: "Your verification code is < 123456 >"
      }
    );

    console.log('OTP response:', response.data);
    if(session && session.inTransaction()){
      await session.commitTransaction();
    }

    session?.endSession();
    return {success: true, message: response.data};
  } catch (error) {
    if(session && session.inTransaction()){
      await session.abortTransaction();
    }
    session?.endSession();
    console.error("Error sending OTP:", error.response?.data || error.message);
    return {success: false}
  }
};

function formatPhoneNumber(phoneNumber) {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return "234" + digits.slice(1);
  }
  if (digits.startsWith("234")) {
    return digits;
  }
  return digits; // fallback (already international format)
}

module.exports = otpSend;















// const axios = require("axios");

// const BREVO_API_KEY = process.env.BREVO_API_KEY;
// // const BREVO_SENDER_ID = process.env.EMAIL_FROM; // Must be verified in Brevo
// const BREVO_SENDER_ID = process.env.APP_NAME; // Must be verified in Brevo

// /**
//  * Send OTP using Brevo SMS API
//  * @param {string} phoneNumber - Recipient phone number
//  * @param {string} message - The message content (e.g., OTP code)
//  * @param {object|null} session - Optional MongoDB transaction session
//  */
// const sendOTP = async (phoneNumber, message, session = null) => {
//   try {
//     const phoneNo = formatPhoneNumber(phoneNumber);
//     console.log("Formatted phone number:", phoneNo);

//     const response = await axios.post(
//       "https://api.brevo.com/v3/transactionalSMS/send",
//       {
//         sender: BREVO_SENDER_ID, // Brevo verified sender
//         recipient: phoneNo,
//         content: message,        // e.g., "Your OTP is 123456"
//       },
//       {
//         headers: {
//           "api-key": BREVO_API_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("OTP response:", response.data);

//     if (session) {
//       await session.commitTransaction();
//       session.endSession();
//     }

//     return { success: true, message: response.data };
//   } catch (error) {
//     await session?.abortTransaction();
//     session?.endSession();

//     console.error("Error sending OTP:", error.response?.data || error.message);
//     return { success: false };
//   }
// };

// /**
//  * Convert local phone number to international format (e.g., 234XXXXXXXXXX)
//  */
// function formatPhoneNumber(phoneNumber) {
//   const digits = phoneNumber.replace(/\D/g, "");
//   if (digits.startsWith("0")) return "+234" + digits.slice(1);
//   if (digits.startsWith("234")) return "+" + digits;
//   return digits; // fallback
//   // return "+" + digits; // fallback
// }

// module.exports = sendOTP;
