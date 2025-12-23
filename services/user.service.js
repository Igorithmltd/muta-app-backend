const { OAuth2Client } = require("google-auth-library");
const sendEmail = require("../util/emailService");
const BaseService = require("./base");
const UserModel = require("../models/user.model");
const { empty } = require("../util");
const jwt = require("jsonwebtoken");
const validateData = require("../util/validate");
const {
  generateOTP,
  verifyRefreshToken,
  signAccessToken,
  formatNotificationTime,
  getWeightImprovementTipsByWeight,
} = require("../util/helper");
const { EXPIRES_AT } = require("../util/constants");
const NuggetModel = require("../models/nugget.model");
const DietModel = require("../models/diet.model");
const WorkoutPlanModel = require("../models/workoutPlan.model");
const PlanModel = require("../models/plan.model");
const CouponModel = require("../models/coupon.model");
const SleepEntryModel = require("../models/sleep-entry.model");
const WaterEntryModel = require("../models/water-entry.model");
const NotificationModel = require("../models/notification.model");
const SubscriptionModel = require("../models/subscription.model");
const { sendPushNotification } = require("./firebase.service");
const PaystackService = require("./paystack.service");
const sendOTP = require("../util/sendOtp");
const MessageModel = require("../models/message.model");
const CallLogModel = require("../models/call-log.model");
const mongoose = require("mongoose");
const ChallengeActionModel = require("../models/challengeAction.model");
const DietActionModel = require("../models/dietAction.model");
const FavoriteProductModel = require("../models/favorite.model");
const OrderModel = require("../models/order.model");
const WorkoutPlanActionModel = require("../models/workoutPlanAction.model");
const VerificationApplicationModel = require("../models/verification-applications.model");
const CoachGuidanceModel = require("../models/coach-guidance.model");

class UserService extends BaseService {
  async createUser(req, res) {
    try {
      const post = req.body;

      const validateRule = {
        email: "email|required",
        password: "string|required",
        userType: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "email.email": "Please provide a valid :attribute.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const userExists = await UserModel.findOne({ email: post.email });
      if (!empty(userExists)) {
        return BaseService.sendFailedResponse({
          error: "User exist. Please login",
        });
      }

      const newUser = new UserModel({ ...post, servicePlatform: "local" });
      await newUser.save();

      // userExists.markModified("password");
      // await userExists.save();

      const otp = generateOTP();

      const expiresAt = new Date(Date.now() + EXPIRES_AT);

      newUser.otp = otp;
      newUser.otpExpiresAt = expiresAt;
      await newUser.save();

      // Send OTP email
      const emailHtml = `
         <h1>Verify Your Email</h1>
      <p>Hi <strong>${post.email}</strong>,</p>
      <p>Here is your One-Time Password: <b>${otp}</b> to complete the verification:</p>
      `;
      await sendEmail({
        subject: "Verify Your email",
        to: post.email,
        html: emailHtml,
      });

      return BaseService.sendSuccessResponse({
        message: "Registration Successful",
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({ error });
    }
  }
  async googleSignup(req, res) {
    try {
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      const client = new OAuth2Client(GOOGLE_CLIENT_ID);

      const post = req.body;

      const validateRule = {
        idToken: "string|required",
        userType: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const ticket = await client.verifyIdToken({
        idToken: post.idToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const {
        sub: googleId,
        email,
        name,
        picture,
        given_name,
        family_name,
      } = payload;

      const username = email
        ? email.split("@")[0]
        : name?.replace(/\s+/g, "").toLowerCase();

      const firstName = given_name || name?.split(" ")[0] || "";
      const lastName = family_name || name?.split(" ").slice(1).join(" ") || "";

      // Check if user exists in DB, otherwise create (pseudo code)
      const userWithSub = await UserModel.findOne({
        $or: [{ googleId }, { email }],
      });

      if (userWithSub) {
        const accessToken = await userWithSub.generateAccessToken(
          process.env.ACCESS_TOKEN_SECRET || ""
        );
        const refreshToken = await userWithSub.generateRefreshToken(
          process.env.REFRESH_TOKEN_SECRET || ""
        );
        return BaseService.sendSuccessResponse({
          message: accessToken,
          user: userWithSub,
          refreshToken,
        });
      }

      const userObject = {
        googleId,
        firstName,
        lastName,
        username,
        email,
        image: { imageUrl: picture, publicId: "" },
        isVerified: true,
        servicePlatform: "google",
        userType: post.userType,
      };

      const newUser = new UserModel(userObject);

      await newUser.save();

      // Generate your own JWT/session token
      const accessToken = await newUser.generateAccessToken(
        process.env.ACCESS_TOKEN_SECRET || ""
      );

      const refreshToken = await newUser.generateRefreshToken(
        process.env.REFRESH_TOKEN_SECRET || ""
      );

      // Send OTP email
      const emailHtml = `
         <h1>Registration successful</h1>
      <p>Hi <strong>${newUser.email}</strong>,</p>
      <p>You have successfully sign up:</p>
      `;
      await sendEmail({
        subject: "Welcome to Muta App",
        to: newUser.email,
        html: emailHtml,
      });

      return BaseService.sendSuccessResponse({
        message: accessToken,
        user: newUser,
        refreshToken,
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async appleSignup(req, res) {
    try {
      const {
        authorizationCode, // The authorization code from Apple
        idToken, // The id_token from Apple (used to extract user info)
        userType, // The type of user (e.g., admin, regular)
      } = req.body;

      // Replace with your Apple OAuth credentials
      const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID; // Your Apple Service ID (client ID)
      const APPLE_CLIENT_SECRET = process.env.APPLE_CLIENT_SECRET; // Your Apple Client Secret (generated from Apple Developer Console)
      const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID; // Your Apple Team ID (from Apple Developer Console)
      const APPLE_KEY_ID = process.env.APPLE_KEY_ID; // Your Key ID from Apple (from the private key you uploaded in Apple Developer Console)

      // 1. Validate the incoming data (similar to Google signup validation)
      const validateRule = {
        authorizationCode: "string|required",
        idToken: "string|required",
        userType: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
      };

      const validateResult = validateData(
        req.body,
        validateRule,
        validateMessage
      );

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      // 2. Decode the ID Token (optional but useful for debugging)
      const decodedToken = jwt.decode(idToken, { complete: true });
      console.log("Decoded Apple ID Token:", decodedToken);

      // 3. Exchange authorization code for access and refresh tokens
      const tokenResponse = await axios.post(
        "https://appleid.apple.com/auth/token",
        null,
        {
          params: {
            client_id: APPLE_CLIENT_ID,
            client_secret: APPLE_CLIENT_SECRET,
            code: authorizationCode,
            grant_type: "authorization_code",
            redirect_uri: "https://yourdomain.com/auth/apple/callback", // Replace with your actual redirect URI
          },
        }
      );

      const {
        access_token,
        refresh_token,
        id_token: newIdToken,
      } = tokenResponse.data;

      // 4. Decode the new ID token to get user information
      const payload = jwt.decode(newIdToken);
      const {
        sub: appleId,
        email,
        given_name,
        family_name,
        name,
        picture,
      } = payload;

      // 5. Generate a username based on email or name
      const username = email
        ? email.split("@")[0]
        : name.replace(/\s+/g, "").toLowerCase();

      // 6. Extract first and last names
      const firstName = given_name || name.split(" ")[0];
      const lastName = family_name || name.split(" ").slice(1).join(" ");

      // 7. Check if the user already exists in the database
      const userWithAppleId = await UserModel.findOne({
        $or: [{ appleId }, { email }],
      });

      if (userWithAppleId) {
        // If the user already exists, generate JWT tokens
        const accessToken = await userWithAppleId.generateAccessToken(
          process.env.ACCESS_TOKEN_SECRET || ""
        );
        const refreshToken = await userWithAppleId.generateRefreshToken(
          process.env.REFRESH_TOKEN_SECRET || ""
        );

        return BaseService.sendSuccessResponse({
          message: accessToken,
          user: userWithAppleId,
          refreshToken,
        });
      }

      // 8. Create a new user if the user doesn't exist
      const userObject = {
        appleId,
        firstName,
        lastName,
        username,
        email,
        image: { imageUrl: picture || "", publicId: "" }, // Apple profile image (optional)
        isVerified: true,
        servicePlatform: "apple", // Mark this user as using the "Apple" service for signup
        userType, // You can pass userType from the frontend (e.g., "admin", "regular")
      };

      // 9. Create a new user in the database
      const newUser = new UserModel(userObject);

      await newUser.save();

      // 10. Generate JWT tokens for the newly created user
      const accessToken = await newUser.generateAccessToken(
        process.env.ACCESS_TOKEN_SECRET || ""
      );
      const refreshToken = await newUser.generateRefreshToken(
        process.env.REFRESH_TOKEN_SECRET || ""
      );

      // 11. Send a welcome email or confirmation email to the user
      const emailHtml = `
        <h1>Registration successful</h1>
        <p>Hi <strong>${newUser.email}</strong>,</p>
        <p>You have successfully signed up with Apple.</p>
      `;
      await sendEmail({
        subject: "Welcome to Muta App",
        to: newUser.email,
        html: emailHtml,
      });

      // 12. Send the success response with the access token, user info, and refresh token
      return BaseService.sendSuccessResponse({
        message: accessToken,
        user: newUser,
        refreshToken,
      });
    } catch (error) {
      console.error("Apple Sign-Up Error:", error);
      return BaseService.sendFailedResponse({
        error: "Something went wrong with the Apple Sign-Up process.",
      });
    }
  }
  async verifyOTP(req) {
    try {
      const post = req.body;

      const validateRule = {
        email: "email|required",
        otp: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "email.email": "Please provide a valid :attribute.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { email, otp } = post;

      const userExists = await UserModel.findOne({ email });
      if (empty(userExists)) {
        return BaseService.sendFailedResponse({
          error: "User not found. Please try again later",
        });
      }

      if (empty(userExists.otp)) {
        return BaseService.sendFailedResponse({ error: "OTP not found" });
      }

      if (userExists.otp !== otp) {
        return BaseService.sendFailedResponse({ error: "Invalid OTP" });
      }
      if (userExists.otpExpiresAt < new Date()) {
        return BaseService.sendFailedResponse({ error: "OTP expired" });
      }

      userExists.isVerified = true;
      userExists.otp = "";
      userExists.otpExpiresAt = null;
      await userExists.save();

      const accessToken = await userExists.generateAccessToken(
        process.env.ACCESS_TOKEN_SECRET || ""
      );
      const refreshToken = await userExists.generateRefreshToken(
        process.env.REFRESH_TOKEN_SECRET || ""
      );

      // Send OTP email
      const emailHtml = `
          <h1>Your email has been verified</h1>
          <p>Hi <strong>${email}</strong>,</p>
          <p>You have successfully verified your account</p>
      `;
      await sendEmail({
        subject: "Email Verification",
        to: email,
        html: emailHtml,
      });

      return BaseService.sendSuccessResponse({
        message: accessToken,
        user: userExists,
        refreshToken,
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({ error });
    }
  }
  async loginUser(req, res) {
    try {
      const post = req.body;
      const { email, password, phoneNumber, userType } = post;

      const validateRule = {
        userType: "string|required",
        password: "string|required",
      };
      const validateMessage = {
        required: ":attribute is required",
        string: ":attribute must be a string",
        "email.email": "Please provide a valid :attribute.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      if (!email && !phoneNumber) {
        return BaseService.sendFailedResponse({
          error: "Please provide email or phone number to login",
        });
      }

      const userExists = await UserModel.findOne({
        userType,
        $or: [{ email }, { phoneNumber }],
      });

      if (empty(userExists)) {
        return BaseService.sendFailedResponse({
          error: "User not found. Please register as a new user",
        });
      }

      if (!userExists.isVerified) {
        return BaseService.sendFailedResponse(
          {
            error: "Email is not verified. Please verifiy your email",
          },
          405
        );
      }

      if (userExists.servicePlatform === "google") {
        // If the user signed up via Google, prevent local login attempt
        if (password) {
          return BaseService.sendFailedResponse({
            error:
              "This account was created using Google. Please log in using Google.",
          });
        }
      }

      if (userExists.servicePlatform === "local") {
        if (!userExists.password) {
          return BaseService.sendFailedResponse({
            error:
              "Account created via a different platform. Please use the appropriate platform to log in.",
          });
        }

        // Check if the provided password matches the stored password
        if (!(await userExists.comparePassword(password))) {
          return BaseService.sendFailedResponse({
            error: "Wrong email or password",
          });
        }
      }

      // if (!(await userExists.comparePassword(password))) {
      //   return BaseService.sendFailedResponse({
      //     error: "Wrong email or password",
      //   });
      // }

      const accessToken = await userExists.generateAccessToken(
        process.env.ACCESS_TOKEN_SECRET || ""
      );
      const refreshToken = await userExists.generateRefreshToken(
        process.env.REFRESH_TOKEN_SECRET || ""
      );
      // res.cookie("growe_refresh_token", refreshToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   path: "/",
      //   maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      //   sameSite: "strict",
      // });

      // res.header("Authorization", `Bearer ${accessToken}`);
      // res.header("refresh_token", `Bearer ${refreshToken}`);

      return BaseService.sendSuccessResponse({
        message: accessToken,
        user: userExists,
        refreshToken,
      });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse({ error });
    }
  }
  async getUser(req) {
    try {
      const userId = req.user.id;

      let userDetails = {};
      userDetails = await UserModel.findById(userId).select("-password");

      if (empty(userDetails)) {
        return BaseService.sendFailedResponse({
          error: "Something went wrong trying to fetch your account.",
        });
      }

      return BaseService.sendSuccessResponse({ message: userDetails });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Validate email
      if (!email) {
        return BaseService.sendFailedResponse({ error: "Email is required" });
      }

      const userExists = await UserModel.findOne({ email });
      if (!userExists) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }
      // Generate OTP
      const otp = generateOTP();
      userExists.otp = otp;
      userExists.otpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
      await userExists.save();
      // Send OTP email
      const emailHtml = `
      <h1>Password Reset Request</h1>
       <p>Hi <strong>${email}</strong>,</p>
       <p>Your password reset code is ${otp}</p>
    `;
      await sendEmail({
        subject: "Password Reset Request",
        to: email,
        html: emailHtml,
      });
      // Send response
      return BaseService.sendSuccessResponse({
        message: "Password Reset Request Successful",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({ error });
    }
  }
  async resetPassword(req, res) {
    try {
      const post = req.body;

      const validateRule = {
        email: "email|required",
        password: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "email.email": "Please provide a valid :attribute.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { email, password } = post;

      const userExists = await UserModel.findOne({ email });
      if (empty(userExists)) {
        return BaseService.sendFailedResponse({
          error: "User not found. Please try again later",
        });
      }

      if (await userExists.comparePassword(password)) {
        return BaseService.sendFailedResponse({
          error: "New password cannot be the same as the old password",
        });
      }

      userExists.password = password;
      // userExists.markModified("password");
      await userExists.save();

      // Send OTP email
      const emailHtml = `
          <h1>Password Reset</h1>
          <p>Hi <strong>${email}</strong>,</p>
          <p>Your Password has been reset successfully</p>
      `;
      await sendEmail({
        subject: "Password Reset Confirmation",
        to: email,
        html: emailHtml,
      });

      return BaseService.sendSuccessResponse({
        message: "Password reset successfullly",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({ error });
    }
  }
  async sendOTP(req) {
    try {
      const post = req.body;

      const validateRule = {
        email: "email|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "email.email": "Please provide a valid :attribute.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { email } = post;

      const userExists = await UserModel.findOne({ email });
      if (empty(userExists)) {
        return BaseService.sendFailedResponse({
          error: "User does not exist, Please try again later",
        });
      }
      const otp = generateOTP();

      const expiresAt = new Date(Date.now() + EXPIRES_AT);

      userExists.otp = otp;
      userExists.otpExpiresAt = expiresAt;
      await userExists.save();

      // Send OTP email
      const emailHtml = `
         <h1>Verify Your Email</h1>
      <p>Hi <strong>${email}</strong>,</p>
      <p>Here is your One-Time Password: <b>${otp}</b> to complete the verification:</p>
      `;
      await sendEmail({
        subject: "Verify Your email",
        to: email,
        html: emailHtml,
      });

      return BaseService.sendSuccessResponse({
        message: "Email sent. Please verify your email",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({ error });
    }
  }
  async verifyEmail(req) {
    try {
      const post = req.body;

      const validateRule = {
        email: "email|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "email.email": "Please provide a valid :attribute.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { email } = post;

      const userExists = await UserModel.findOne({ email });
      if (!empty(userExists)) {
        return BaseService.sendFailedResponse({
          error: { message: "Email registered already", user: userExists },
        });
      }

      const newPost = new UserModel({
        email,
      });

      const otp = generateOTP();

      const expiresAt = new Date(Date.now() + EXPIRES_AT);

      newPost.otp = otp;
      newPost.otpExpiresAt = expiresAt;
      await newPost.save();

      // Send OTP email
      const emailHtml = `
         <h1>Verify Your Email</h1>
      <p>Hi <strong>${email}</strong>,</p>
      <p>Here is your One-Time Password: <b>${otp}</b> to complete the verification:</p>
      `;
      await sendEmail({
        subject: "Verify Your email",
        to: email,
        html: emailHtml,
      });

      return BaseService.sendSuccessResponse({
        message: "Registration Successful. Please verify your email",
        token: "",
      });
    } catch (error) {
      console.log(error, "the error");
      return BaseService.sendFailedResponse({ error });
    }
  }
  async verifyPasswordOTP(req) {
    try {
      const post = req.body;

      const validateRule = {
        email: "email|required",
        otp: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "email.email": "Please provide a valid :attribute.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { email, otp } = post;

      const userExists = await UserModel.findOne({ email });
      if (empty(userExists)) {
        return BaseService.sendFailedResponse({
          error: "User not found. Please try again later",
        });
      }

      if (empty(userExists.otp)) {
        return BaseService.sendFailedResponse({ error: "OTP not found" });
      }

      if (userExists.otp !== otp) {
        return BaseService.sendFailedResponse({ error: "Invalid OTP" });
      }
      if (userExists.otpExpiresAt < new Date()) {
        return BaseService.sendFailedResponse({ error: "OTP expired" });
      }

      userExists.otp = "";
      userExists.otpExpiresAt = null;
      await userExists.save();

      // Send OTP email
      const emailHtml = `
          <h1>Your password OTP has been verified</h1>
          <p>Hi <strong>${email}</strong>,</p>
          <p>You have successfully reset your password</p>
      `;
      await sendEmail({
        subject: "Password Reset Verification",
        to: email,
        html: emailHtml,
      });

      return BaseService.sendSuccessResponse({
        message: "OTP verified successfullly",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({ error });
    }
  }
  async changePassword(req) {
    try {
      const post = req.body;

      const validateRule = {
        email: "email|required",
        oldPassword: "string|required",
        newPassword: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "email.email": "Please provide a valid :attribute.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { email, newPassword, oldPassword } = post;

      if (!oldPassword || !newPassword) {
        return BaseService.sendFailedResponse({
          error: "Both old and new passwords are required.",
        });
      }

      const userExists = await UserModel.findOne({ email });
      if (empty(userExists)) {
        return BaseService.sendFailedResponse({
          error: "User not found. Please try again later",
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return BaseService.sendFailedResponse({
          error: "Old password is incorrect.",
        });
      }

      userExists.password = newPassword;
      // userExists.markModified("password");
      await userExists.save();

      // Send OTP email
      const emailHtml = `
          <h1>Password Reset</h1>
          <p>Hi <strong>${email}</strong>,</p>
          <p>Your Password has been reset successfully</p>
      `;
      await sendEmail({
        subject: "Password Reset Confirmation",
        to: email,
        html: emailHtml,
      });

      return BaseService.sendSuccessResponse({
        message: "Password reset successfullly",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({ error });
    }
  }
  async refreshToken(req, res) {
    try {
      const refreshToken = req.headers["x-refresh-token"]; // better than Authorization

      if (!refreshToken) {
        return BaseService.sendFailedResponse({
          error: "No refresh token provided",
        });
      }

      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (err) {
        return BaseService.sendFailedResponse({
          error: "Invalid or expired refresh token",
        });
      }

      const newAccessToken = signAccessToken({
        id: decoded.id,
        userType: decoded.userType,
      });

      // Optionally: set as Authorization header or return in body
      res.header("Authorization", `Bearer ${newAccessToken}`);

      return BaseService.sendSuccessResponse({
        message: newAccessToken,
      });
    } catch (err) {
      console.error("Refresh Token Error:", err);
      return BaseService.sendFailedResponse({
        error: "Something went wrong. Please try again later.",
      });
    }
  }
  async completeOnboarding(req) {
    try {
      const post = req.body;
      const userId = req.user.id;
      const userType = req.user.userType;

      let validateRule = {
        firstName: "string|required",
        // lastName: "string|required",
        gender: "string|required",
      };

      if (userType === "user") {
        validateRule.age = "integer|required";
      } else if (userType === "coach") {
        validateRule.yearsOfExperience = "integer|required";
        validateRule.location = "string|required";
        validateRule.lastName = "string|required";
      }

      const validateMessage = {
        required: ":attribute is required",
        string: ":attribute must be a string",
        integer: ":attribute must be a string",
        array: ":attribute must be an array",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const user = await UserModel.findById(userId);
      if (empty(user)) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      if (userType == "user") {
        if (
          post.fitnessLevel &&
          !["beginner", "intermediate", "advanced"].includes(post.fitnessLevel)
        ) {
          return BaseService.sendFailedResponse({
            error: "Invalid fitness level",
          });
        }
        if (post.focusArea && !Array.isArray(post.focusArea)) {
          return BaseService.sendFailedResponse({
            error: "Focus area must be an array",
          });
        }
      } else {
        if (post.specialty && !Array.isArray(post.specialty)) {
          return BaseService.sendFailedResponse({
            error: "Specialty must be an array",
          });
        }
      }
      const userExists = await UserModel.findById(userId);

      if (userExists.isRegistrationComplete) {
        return BaseService.sendSuccessResponse({
          message: "Onboarding completed successfully",
        });
      }

      const onboardingData = {
        age: post.age,
        gender: post.gender,
        firstName: post.firstName,
        lastName: post.lastName,
        ...(post.weight && { weight: post.weight }),
        ...(post.height && { height: post.height }),
        ...(post.focusArea && { focusArea: post.focusArea }),
        ...(post.fitnessLevel && { fitnessLevel: post.fitnessLevel }),
        ...(post.specialty && { specialty: post.specialty }),
        ...(post.location && { location: post.location }),
        ...(post.yearsOfExperience && {
          yearsOfExperience: post.yearsOfExperience,
        }),
        isRegistrationComplete: true,
      };

      await UserModel.findByIdAndUpdate(userId, onboardingData, { new: true });
      await NotificationModel.create({
        userId: userId,
        title: "Welcome to Muta App!",
        body: "Thank you for completing your onboarding process.",
      });
      if (user.deviceToken) {
        sendPushNotification({
          deviceToken: user.deviceToken,
          title: "Welcome to Muta App!",
          body: "Thank you for completeting your onboarding process.",
        });
      }

      return BaseService.sendSuccessResponse({
        message: "Onboarding completed successfully",
      });
    } catch (err) {
      console.log(err);
      return BaseService.sendFailedResponse({
        error: "Something went wrong. Please try again later.",
      });
    }
  }
  async updateUserProfile(req) {
    try {
      const post = req.body;
      const userId = req.user.id;

      const updatedUser = await UserModel.findByIdAndUpdate(userId, post, {
        new: true,
      });

      return BaseService.sendSuccessResponse({
        message: "User profile updated successfully",
        data: updatedUser,
      });
    } catch (err) {
      console.error(err);
      return BaseService.sendFailedResponse({
        error: "Something went wrong. Please try again later.",
      });
    }
  }
  async profileImageUpload(req) {
    try {
      let post = req.body;

      if (empty(post) || empty(post.image) || empty(post.image.imageUrl)) {
        return BaseService.sendFailedResponse({
          error: "Please provide your profile image",
        });
      }

      const userExists = await UserModel.findById(req.user.id);
      if (empty(userExists)) {
        return BaseService.sendFailedResponse({
          error: "User does not exist. Please register!",
        });
      }

      if (!empty(userExists.image) && !empty(userExists.image.publicId)) {
        await deleteImage(userExists.image.publicId);
      }

      userExists.image = post.image;
      await userExists.save();

      return BaseService.sendSuccessResponse({
        message: "Profile image uploaded successfully",
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async getDailyNugget(req) {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split("T")[0];
      const nuggets = await NuggetModel.find();

      // Simple hash function based on date string
      let hash = 0;
      for (let i = 0; i < today.length; i++) {
        hash = today.charCodeAt(i) + ((hash << 5) - hash);
      }

      const index = Math.abs(hash) % nuggets.length;

      const nugget = nuggets[index];
      const hasLiked = nugget.likedBy.includes(userId);

      return BaseService.sendSuccessResponse({
        message: { nugget, hasLiked },
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async likeUnLikeNugget(req) {
    try {
      const userId = req.user.id;
      const nuggetId = req.params.id;
      const nugget = await NuggetModel.findById(nuggetId);

      if (empty(nugget)) {
        return BaseService.sendFailedResponse({
          error: "Nugget not found",
        });
      }
      const hasLiked = nugget.likedBy.includes(userId);
      let likeNugget = false;
      if (hasLiked) {
        likeNugget = false;
        nugget.likedBy = nugget.likedBy.filter(
          (id) => id.toString() !== userId
        );
        nugget.likes -= 1;
      } else {
        likeNugget = true;
        nugget.likedBy.push(userId);
        nugget.likes += 1;
      }
      await nugget.save();

      return BaseService.sendSuccessResponse({
        message: `${likeNugget ? "Liked" : "Unliked"} nugget successfully`,
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async createNugget(req) {
    try {
      const post = req.body;
      const validateRule = {
        title: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        string: ":attribute must be a string",
      };
      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const nugget = new NuggetModel({ title: post.title });
      await nugget.save();

      return BaseService.sendSuccessResponse({
        message: "nugget create successfully",
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async editNugget(req) {
    try {
      const nuggetId = req.params.id;
      const nugget = await NuggetModel.findById(nuggetId);

      const post = req.body;
      const validateRule = {
        title: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        string: ":attribute must be a string",
      };
      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      if (empty(nugget)) {
        return BaseService.sendFailedResponse({
          error: "Nugget not found",
        });
      }
      nugget.title = post.title || nugget.title;
      await nugget.save();

      return BaseService.sendSuccessResponse({
        message: "nugget updated successfully",
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async increaseNuggetDownloadCount(req) {
    try {
      const userId = req.user.id;
      const nuggetId = req.params.id;
      const nugget = await NuggetModel.findById(nuggetId);

      if (empty(nugget)) {
        return BaseService.sendFailedResponse({
          error: "Nugget not found",
        });
      }

      if (nugget.downloads === undefined) {
        nugget.downloads = 0;
      }
      if (!nugget.downloadedBy.includes(userId)) {
        nugget.downloads += 1;
        nugget.downloadedBy.push(userId);
        await nugget.save();
      }

      return BaseService.sendSuccessResponse({
        message: "nugget successfully downloaded",
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async increaseNuggetShareCount(req) {
    try {
      const userId = req.user.id;
      const nuggetId = req.params.id;
      const nugget = await NuggetModel.findById(nuggetId);

      if (empty(nugget)) {
        return BaseService.sendFailedResponse({
          error: "Nugget not found",
        });
      }

      if (nugget.shares === undefined) {
        nugget.shares = 0;
      }
      if (!nugget.sharedBy.includes(userId)) {
        nugget.shares += 1;
        nugget.sharedBy.push(userId);
        await nugget.save();
      }

      return BaseService.sendSuccessResponse({
        message: "nugget shared successfully",
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  calculateBMI(weight, height) {
    if (weight <= 0 || height <= 0) {
      return null; // Invalid input
    }
    const heightInMeters = height / 100; // Convert height from cm to meters
    const bmi = weight / (heightInMeters * heightInMeters);
    return parseFloat(bmi.toFixed(2)); // Return BMI rounded to two decimal places

    //     | BMI Range   | Category          |
    // | ----------- | ----------------- |
    // | < 18.5      | Underweight       |
    // | 18.5 – 24.9 | Normal weight     |
    // | 25.0 – 29.9 | Overweight        |
    // | 30.0 – 34.9 | Obese (Class I)   |
    // | 35.0 – 39.9 | Obese (Class II)  |
    // | ≥ 40.0      | Obese (Class III) |
  }
  async getWeightImprovementTips(req) {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    if (empty(user) || empty(user.weight) || empty(user.height)) {
      return BaseService.sendFailedResponse({ error: "User not found" });
    }

    const weight = user.weight.value;
    const height = user.height.value;

    if (empty(weight) || empty(height)) {
      return BaseService.sendFailedResponse({
        error: "Please log your weight and height",
      });
    }
    const weightTips = getWeightImprovementTipsByWeight(weight, height);
    return BaseService.sendSuccessResponse({ message: weightTips });
  }
  async getUserWeightLoss(req) {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return BaseService.sendFailedResponse({ error: "User not found" });
    }

    let weightLossDiff = user.weightLoss || 0;

    return BaseService.sendSuccessResponse({ message: weightLossDiff });
  }
  async adminDashboardStat() {
    try {
      const response = {};
      const totalUsers = await UserModel.find({
        userType: "user",
      }).countDocuments();
      const totalDietPlans = await DietModel.countDocuments();
      const totalWorkoutPlans = await WorkoutPlanModel.countDocuments();
      const totalVerifiedCoaches = await UserModel.find({
        userType: "coach",
        isVerifiedCoach: true,
      }).countDocuments();
      // const totalPendingOrders = await OrderModel.find({status: 'pending'}).countDocuments();
      response["totalUsers"] = totalUsers;
      response["totalDietPlans"] = totalDietPlans;
      response["totalWorkoutPlans"] = totalWorkoutPlans;
      response["totalVerifiedCoaches"] = totalVerifiedCoaches;

      return BaseService.sendSuccessResponse({
        message: response,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async applyCoachVerificationBadge(req) {
    try {
      const userId = req.user.id;
      const post = req.body;
      const validateRule = {
        governmentIssuedId: "object|required",
        "governmentIssuedId.imageUrl": "string|required",
        "governmentIssuedId.publicId": "string|required",
        coachCertificate: "object|required",
        "coachCertificate.imageUrl": "string|required",
        "coachCertificate.publicId": "string|required",
      };
      const validateMessage = {
        required: ":attribute is required",
        string: ":attribute must be a string",
      };
      const validateResult = validateData(post, validateRule, validateMessage);
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      if (user.userType !== "coach") {
        return BaseService.sendFailedResponse({
          error: "Unauthorized access. Only coach can access.",
        });
      }

      const verificationApplicationExists =
        await VerificationApplicationModel.findOne({ userId });

      if (verificationApplicationExists) {
        return BaseService.sendFailedResponse({
          error: "Application in process. Please reach out to the admin",
        });
      }

      const coachVerificationData = {
        status: "pending",
        governmentIssuedId: post.governmentIssuedId,
        coachCertificate: post.coachCertificate,
        submittedAt: new Date(),
        // reviewedAt: null,
      };

      await VerificationApplicationModel.create(coachVerificationData);

      return BaseService.sendSuccessResponse({
        message: "Coach verification application submitted successfully",
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async logUserWeight(req) {
    try {
      const userId = req.user.id;

      const { value, unit } = req.body;

      const validateRule = {
        value: "numeric|required|min:1",
        unit: "string|in:kg,lbs",
      };

      const validateResult = validateData(req.body, validateRule, {
        required: ":attribute is required.",
        "in.unit": "Weight unit must be either 'kg' or 'lbs'.",
      });

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return BaseService.sendFailedResponse({ error: "User not found." });
      }

      const oldWeight = user.weight?.value ? Number(user.weight.value) : null;
      const oldUnit = user.weight?.unit || "kg";

      // Convert old weight to new unit if different (optional, assuming kg and lbs conversion)
      let oldWeightInNewUnit = oldWeight;
      if (oldWeight !== null && oldUnit !== unit) {
        if (unit === "kg" && oldUnit === "lbs") {
          oldWeightInNewUnit = oldWeight / 2.20462;
        } else if (unit === "lbs" && oldUnit === "kg") {
          oldWeightInNewUnit = oldWeight * 2.20462;
        }
      }

      const newWeightValue = Number(value);

      // Calculate weight loss
      let weightLossDiff = 0;
      if (oldWeightInNewUnit !== null && oldWeightInNewUnit > newWeightValue) {
        weightLossDiff = oldWeightInNewUnit - newWeightValue;
      }

      // Update user's weightLoss field (accumulate)
      user.weightLoss = (user.weightLoss || 0) + weightLossDiff;

      // Update user's weight
      user.weight = {
        value: newWeightValue,
        unit: unit || "kg",
      };

      await user.save();

      // Prepare notification message
      let notificationTitle = "Weight Update";
      let notificationDescription;

      if (oldWeightInNewUnit === null) {
        notificationDescription = `Your weight of ${value} ${unit} has been recorded.`;
      } else {
        const diff = newWeightValue - oldWeightInNewUnit;
        if (diff > 0) {
          notificationDescription = `You have gained ${diff.toFixed(
            2
          )} ${unit}. Keep tracking your progress!`;
        } else if (diff < 0) {
          notificationDescription = `Great job! You have lost ${Math.abs(
            diff
          ).toFixed(2)} ${unit}. Keep it up!`;
        } else {
          notificationDescription = `Your weight remains the same at ${value} ${unit}. Keep maintaining it!`;
        }
      }

      // Create notification for the user
      await NotificationModel.create({
        userId,
        title: notificationTitle,
        body: notificationDescription,
        time: new Date(),
        type: "weight",
      });

      if (user.deviceToken) {
        sendPushNotification({
          deviceToken: user.deviceToken,
          title: notificationTitle,
          body: notificationDescription,
        });
      }

      return BaseService.sendSuccessResponse({
        message: "Weight updated successfully",
      });
    } catch (err) {
      console.error(err);
      return BaseService.sendFailedResponse("Internal server error");
    }
  }
  async logUserHeight(req) {
    try {
      const userId = req.user.id;

      const { value, unit } = req.body;

      const validateRule = {
        value: "numeric|required|min:1",
        unit: "string|in:cm,ft",
      };

      const validateResult = validateData(req.body, validateRule, {
        required: ":attribute is required.",
        "in.unit": "Height unit must be either 'cm' or 'ft'.",
      });

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return BaseService.sendFailedResponse({ error: "User not found." });
      }

      user.height = {
        value: Number(value),
        unit: unit || "cm",
      };

      await user.save();

      return BaseService.sendSuccessResponse({
        message: "Height updated successfully",
        data: user.height,
      });
    } catch (err) {
      console.error(err);
      return BaseService.sendFailedResponse("Internal server error");
    }
  }
  async getCoachApplications(req) {
    try {
      const { status } = req.query;
      // if (!status) {
      //   return BaseService.sendFailedResponse({
      //     error: "Status query parameter is required",
      //   });
      // }
      const filter = status ? { status } : {};

      const coaches = await VerificationApplicationModel.find(filter)
        .sort({
          submittedAt: -1,
        })
        .populate("userId");

      return BaseService.sendSuccessResponse({ data: coaches });
    } catch (error) {
      console.error(error);
      return BaseService.sendFailedResponse({
        error: "Failed to fetch coach applications",
      });
    }
  }
  async approveCoach(req, res) {
    try {
      const adminId = req.user.id; // Assuming this is an admin
      const { userId } = req.params;

      const user = await UserModel.findById(userId);
      if (!user) {
        return BaseService.sendFailedResponse({
          error: "User not found",
        });
      }

      const coachApplicationExists = await VerificationApplicationModel.findOne(
        { userId }
      );

      if (!coachApplicationExists) {
        return BaseService.sendFailedResponse({
          error: "Coach application does not exist",
        });
      }

      coachApplicationExists.status = "approved";
      coachApplicationExists.reviewedAt = new Date();
      // user.coachVerification.reviewedBy = adminId;
      await coachApplicationExists.save();

      return BaseService.sendSuccessResponse({
        message: "Coach application approved successfully",
      });
    } catch (error) {
      console.error(error);
      return BaseService.sendFailedResponse({
        error: "Failed to approve application",
      });
    }
  }
  async rejectCoach(req, res) {
    try {
      const adminId = req.user.id;
      const { userId } = req.params;

      const user = await UserModel.findById(userId);
      if (!user) {
        return BaseService.sendFailedResponse({
          error: "User not found",
        });
      }

      const coachApplicationExists = await VerificationApplicationModel.findOne(
        { userId }
      );

      if (!coachApplicationExists) {
        return BaseService.sendFailedResponse({
          error: "Coach application does not exist",
        });
      }

      coachApplicationExists.status = "rejected";
      coachApplicationExists.reviewedAt = new Date();
      // user.coachVerification.reviewedBy = adminId;
      await coachApplicationExists.save();

      return BaseService.sendSuccessResponse({
        message: "Coach application rejected successfully",
      });
    } catch (error) {
      console.error(error);
      return BaseService.sendFailedResponse({
        error: "Failed to reject application",
      });
    }
  }
  // async changePassword(req) {
  //   try {
  //     const userId = req.user.id;
  //     const { oldPassword, newPassword } = req.body;

  //     // Validate input
  //     if (!oldPassword || !newPassword) {
  //       return BaseService.sendFailedResponse({
  //         error: "All fields are required.",
  //       });
  //     }

  //     if (newPassword !== confirmPassword) {
  //       return BaseService.sendFailedResponse({
  //         error: "New password and confirmation do not match.",
  //       });
  //     }

  //     const user = await UserModel.findById(userId);

  //     if (!user) {
  //       return BaseService.sendFailedResponse({ error: "User not found." });
  //     }

  //     if (!user.password) {
  //       return BaseService.sendFailedResponse({
  //         error: "No password set for this user.",
  //       });
  //     }

  //     const isMatch = await bcrypt.compare(oldPassword, user.password);
  //     if (!isMatch) {
  //       return BaseService.sendFailedResponse({
  //         error: "Old password is incorrect.",
  //       });
  //     }

  //     user.password = newPassword;

  //     await user.save();

  //     return BaseService.sendSuccessResponse({
  //       message: "Password changed successfully.",
  //     });
  //   } catch (error) {
  //     console.log(error, "the admin error");
  //     return BaseService.sendFailedResponse({ error });
  //   }
  // }
  async getAllVerfiedCoach(req) {
    try {
      const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit, 10) || 10; // Default to limit 10 if not provided
      const skip = (page - 1) * limit; // Calculate skip based on current page and limit

      const coaches = await VerificationApplicationModel.find({
        status: "approved",
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId")
        .lean();

      return BaseService.sendSuccessResponse({
        message: coaches || [],
      });
    } catch (error) {
      console.log(error, "the admin error");
      return BaseService.sendFailedResponse({ error });
    }
  }
  async getCoachBySpecialty(req) {
    try {
      const { specialty } = req.query;
      const specialties = specialty;

      const query = {
        userType: "coach",
      };

      if (specialties) {
        query.specialty = {
          $in: Array.isArray(specialties) ? specialties : [specialties],
        };
      }
      const coaches = await UserModel.find(query);

      return BaseService.sendSuccessResponse({
        message: coaches,
      });
    } catch (error) {
      console.log(error, "the admin error");
      return BaseService.sendFailedResponse({ error });
    }
  }
  async createSubscriptionFromMetadata({
    userId,
    coachId,
    planId,
    categoryDuration, // new param to specify which category (monthly/yearly) the subscription is for
    reference,
    isGift,
    recipientEmail,
  }) {
    const user = await UserModel.findById(userId);
    if (!user) BaseService.sendFailedResponse({ error: "User not found" });

    const coach = await UserModel.findOne({ _id: coachId, userType: "coach" });
    if (!coach) BaseService.sendFailedResponse({ error: "Coach not found" });

    const plan = await PlanModel.findById(planId);
    if (!plan) BaseService.sendFailedResponse({ error: "Plan not found" });

    // Find the category object matching the requested duration
    const category = plan.categories.find(
      (cat) => cat.duration === categoryDuration
    );
    if (!category)
      BaseService.sendFailedResponse({
        error: `Plan category '${categoryDuration}' not found`,
      });

    if (isGift) {
      if (!recipientEmail)
        BaseService.sendFailedResponse({
          error: "Recipient email is required",
        });

      const couponCode =
        "MutaG-" + Math.random().toString(36).substr(2, 8).toUpperCase();

      await CouponModel.create({
        code: couponCode,
        coachId,
        planId,
        giftedByUserId: userId,
        recipientEmail,
        used: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      await sendEmail({
        from: "Muta App <no-reply@fitnessapp.com>",
        subject: `You've received a gift subscription!`,
        to: recipientEmail,
        html: `<p>You have received a ${category.duration} premium subscription from ${user.firstName}. Your coupon code is <b>${couponCode}</b>.</p>`,
      });

      return BaseService.sendSuccessResponse({ message: "Gift coupon sent" });
    }

    // Direct subscription
    let expiryDate = new Date();
    if (category.duration === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (["yearly", "annually"].includes(category.duration)) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    await SubscriptionModel.create({
      planId: plan._id,
      categoryId: category._id, // store which category this subscription is for
      reference,
      status: "active",
      startDate: new Date(),
      expiryDate,
      user: user._id,
      paystackSubscriptionId: plan.paystackSubscriptionId,
      features: category.features,
    });

    await sendEmail({
      from: "Muta App <no-reply@fitnessapp.com>",
      subject: `Subscription successful!`,
      to: user.email,
      html: `<p>You have successfully subscribed to a ${category.duration} premium plan with coach ${coach.firstName}.</p>`,
    });

    return BaseService.sendSuccessResponse({ message: "Subscription created" });
  }
  async subscribeUserToPlan(req) {
    try {
      const userId = req.user.id;

      const validateRule = {
        planId: "string|required",
        categoryDuration: "string|required|in:monthly,yearly",
        paystackPlanCode: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "in.categoryDuration":
          "categoryDuration must be one of 'monthly', 'yearly'",
      };

      const validateResult = validateData(
        req.body,
        validateRule,
        validateMessage
      );
      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const { planId, categoryDuration, paystackPlanCode } = req.body;

      const user = await UserModel.findById(userId);
      if (!user)
        return BaseService.sendFailedResponse({ error: "User not found" });

      const existingSub = await SubscriptionModel.findOne({
        user: userId,
        status: "active",
      });

      const plan = await PlanModel.findById(planId);
      if (!plan) {
        return BaseService.sendFailedResponse({ error: "Plan not found" });
      }

      const category = plan.categories.find(
        (cat) => cat.duration === categoryDuration
      );
      if (!category) {
        return BaseService.sendFailedResponse({
          error: `Plan category '${categoryDuration}' not found`,
        });
      }

      if (
        existingSub &&
        existingSub.planId.toString() === planId.toString() &&
        existingSub.categoryId.toString() === category._id.toString()
      ) {
        return BaseService.sendSuccessResponse({
          message: "Already subscribed",
          subscription: existingSub,
        });
      }

      // Assuming createPaystackSubscription throws on error
      const paystackSub = await createPaystackSubscription(
        user.email,
        paystackPlanCode
      );
      if (paystackSub.success === false) {
        return BaseService.sendFailedResponse({
          error: "Something went wrong creating a subscription with Paystack",
        });
      }

      let expiryDate = new Date();
      if (category.duration === "monthly") {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (category.duration === "yearly") {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      const newSub = await SubscriptionModel.create({
        user: userId,
        planId: planId,
        categoryId: category._id,
        reference: paystackSub.subscription_code,
        status: "active",
        startDate: new Date(),
        expiryDate,
        paystackSubscriptionId: category.paystackSubscriptionId,
      });

      return BaseService.sendSuccessResponse({
        message: "Subscription created",
        subscription: newSub,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({ error: error.message });
    }
  }

  async createPaystackSubscription(userEmail, planPaystackCode) {
    try {
      const response = await axios.post(
        "https://api.paystack.co/subscription",
        {
          customer: userEmail,
          plan: planPaystackCode, // Paystack plan code created in Paystack dashboard
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return BaseService.sendsuccessResponse({ message: response.data.data });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to create Paystack subscription",
      });
    }
  }

  async cancelPaystackSubscription(subscriptionCode) {
    const response = await axios.post(
      `https://api.paystack.co/subscription/disable`,
      {
        code: subscriptionCode,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  async upgradeOrDowngradeSubscription(userId, newPlanId, newPaystackPlanCode) {
    const existingSub = await SubscriptionModel.findOne({
      user: userId,
      status: "active",
    });

    // If user has active subscription and it's different from new plan
    if (existingSub && existingSub.plan.toString() !== newPlanId.toString()) {
      // Cancel old subscription in Paystack
      await cancelPaystackSubscription(existingSub.reference);

      // Mark old subscription as expired
      existingSub.status = "expired";
      existingSub.expiryDate = new Date();
      await existingSub.save();
    }

    // Create new subscription
    const newSub = await subscribeUserToPlan(
      userId,
      newPlanId,
      newPaystackPlanCode
    );
    return newSub;
  }

  async getSubscriptionStatus(req, res) {
    try {
      const userId = req.user.id;

      // Populate user with subscription and plan
      const user = await UserModel.findById(userId);
      // .populate("subscription") // SubscriptionModel
      // .populate("subscriptionPlan"); // PlanModel

      if (!user) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      const filter = {
        user: userId,
        status: "active",
        expiryDate: { $gt: new Date() },
      };

      const userSubscriptionPlan = await SubscriptionModel.findOne(
        filter
      ).populate("planId");
      if (!userSubscriptionPlan) {
        return BaseService.sendSuccessResponse({
          message: "No active subscription",
          subscription: null,
        });
      }

      // const subscription = user.subscription;
      // const plan = user.subscriptionPlan;

      // Auto-expire if past expiry date
      if (
        userSubscriptionPlan.status === "active" &&
        userSubscriptionPlan.expiryDate < new Date()
      ) {
        userSubscriptionPlan.status = "expired";
        await userSubscriptionPlan.save();
      }

      return BaseService.sendSuccessResponse({
        message: "Subscription state retrieved successfully",
        subscription: userSubscriptionPlan,
      });
    } catch (error) {
      console.error("Subscription error:", error);
      return BaseService.sendFailedResponse({ error: error.message });
    }
  }
  async redeemCoupon(req, res) {
    try {
      const { couponCode } = req.body;
      const userId = req.user.id;

      // Fetch user
      const user = await UserModel.findById(userId);
      if (!user) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      // Find coupon
      const coupon = await CouponModel.findOne({ code: couponCode });
      if (!coupon) {
        return BaseService.sendFailedResponse({ error: "Coupon not found" });
      }
      const customerCode = coupon.customerCode;
      const authorizationCode = coupon.authorizationCode;

      // Validate coupon expiration
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return BaseService.sendFailedResponse({ error: "Coupon has expired" });
      }

      // Validate coupon usage
      if (coupon.used) {
        return BaseService.sendFailedResponse({
          error: "Coupon has already been used",
        });
      }

      // Validate recipient
      if (
        coupon.recipientEmail?.toLowerCase() !== user.email?.toLowerCase() &&
        coupon.phoneNumber !== user.phoneNumber
      ) {
        return BaseService.sendFailedResponse({
          error: "Coupon not valid for this user",
        });
      }

      // Check if user already has an active subscription
      const existingSub = await SubscriptionModel.findOne({
        user: userId,
        status: "active",
        expiryDate: { $gt: new Date() },
      });
      if (existingSub) {
        return BaseService.sendFailedResponse({
          error: "User already has an active subscription",
        });
      }

      // Load plan from coupon
      const plan = await PlanModel.findOne({
        "categories.paystackSubscriptionId": coupon.planId,
      });

      if (!plan) {
        return BaseService.sendFailedResponse({
          error: "Associated plan not found",
        });
      }

      // Find category from coupon or fallback (assuming coupon stores categoryDuration)
      const paystackSubscriptionId = coupon.planId; // e.g., "monthly" or "yearly"
      const category = plan.categories.find(
        (cat) => cat.paystackSubscriptionId === paystackSubscriptionId
      );

      if (!category) {
        return BaseService.sendFailedResponse({
          error: `Plan category '${categoryId}' not found`,
        });
      }

      // Validate authorizationCode and customerCode presence
      if (!authorizationCode || !customerCode) {
        return BaseService.sendFailedResponse({
          error:
            "Authorization and customer codes are required to redeem subscription",
        });
      }

      // Create Paystack subscription
      // let resp;
      // try {
      //   resp = await axios.post(
      //     "https://api.paystack.co/subscription",
      //     {
      //       customer: customerCode,
      //       plan: category.paystackSubscriptionId, // use category's subscription plan id
      //       authorization: authorizationCode,
      //     },
      //     {
      //       headers: {
      //         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      //       },
      //     }
      //   );
      // } catch (error) {
      //   console.error(
      //     "Error creating Paystack subscription:",
      //     error.response?.data || error.message
      //   );
      //   return BaseService.sendFailedResponse({
      //     error: "Failed to create subscription with payment provider",
      //   });
      // }

      // if (!resp.data.status) {
      //   return BaseService.sendFailedResponse({
      //     error: "Paystack subscription creation failed",
      //   });
      // }

      // Calculate expiry date based on category duration
      let expiryDate = new Date();
      if (category.duration === "monthly") {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (["yearly", "annually"].includes(category.duration)) {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // Create subscription in your DB
      const subscription = await SubscriptionModel.create({
        user: userId,
        planId: plan._id,
        categoryId: category._id,
        status: "active",
        startDate: new Date(),
        expiryDate,
        paystackSubscriptionId: paystackSubscriptionId,
        coachId: coupon.coachId,
      });

      // Mark coupon as used
      coupon.used = true;
      coupon.usedByUserId = userId;
      await NotificationModel.create({
        userId,
        title: "Coupon Redeemed",
        body: `You have successfully redeemed your coupon for a ${category.duration} subscription.`,
        time: new Date(),
        type: "subscription",
      });

      await NotificationModel.create({
        userId: coupon.coachId,
        title: "Subscription Gift Redeemed",
        body: `Your gifted subscription coupon has been redeemed by ${user.firstName} ${user.lastName}.`,
      });
      // coupon.usedAt = new Date();
      await coupon.save();

      // const emailToken = resp.data.data.email_token || ""
      // const subscriptionCode = resp.data.data.subscription_code || "";

      // const response = await axios.post(
      //   "https://api.paystack.co/subscription/disable",
      //   {
      //     code: subscriptionCode,
      //     token: emailToken,
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      return BaseService.sendSuccessResponse({
        message: "Subscription redeemed successfully",
        subscription: {
          id: subscription._id,
          plan: plan.name,
          categoryDuration: category.duration,
          startDate: subscription.startDate,
          expiryDate: subscription.expiryDate,
          status: subscription.status,
          paystackSubscriptionId: subscription.paystackSubscriptionId,
        },
      });
    } catch (error) {
      console.error("Redeem coupon error:", error);
      return BaseService.sendFailedResponse({ error: error.message });
    }
  }

  async cancelPlan(req, res) {
    try {
      const userId = req.user.id;
      const message = req.body.message || "";

      const subscription = await SubscriptionModel.findOne({
        user: userId,
        status: "active",
      });

      if (!subscription) {
        return BaseService.sendFailedResponse({
          error: "No active subscription found",
        });
      }

      const paystackSubscriptionId = subscription.subscriptionCode;
      const token = subscription.paystackAuthorizationToken;

      if (paystackSubscriptionId) {
        const paystackService = new PaystackService();
        const cancelPaystackSubscription =
          await paystackService.disableSubscription(
            paystackSubscriptionId,
            token
          );
      }

      subscription.status = "cancelled";
      await subscription.save();

      return BaseService.sendSuccessResponse({
        message: "Subscription plan cancelled",
      });
    } catch (error) {
      console.error("Create plan error:");
      return BaseService.sendFailedResponse({ error: "Failed to cancel plan" });
    }
  }
  async createPlan(req, res) {
    try {
      const post = req.body;

      // Basic validation rules for new plan structure
      const validateRule = {
        name: "string|required",
        description: "string|required",
        categories: "array|required",
        isActive: "boolean", // optional
      };

      const validateMessage = {
        required: ":attribute is required",
        "string.name": "Please provide a valid :attribute.",
        "string.description": "Please provide a valid :attribute.",
        "array.categories": ":attribute must be an array",
        "boolean.isActive": ":attribute must be a boolean",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      // Validate each category inside categories array
      for (const [index, category] of post.categories.entries()) {
        if (
          !category.duration ||
          !["monthly", "yearly"].includes(category.duration)
        ) {
          return BaseService.sendFailedResponse({
            error: `categories[${index}].duration must be 'monthly' or 'yearly'`,
          });
        }
        if (
          category.price === undefined ||
          typeof category.price !== "number" ||
          category.price < 0
        ) {
          return BaseService.sendFailedResponse({
            error: `categories[${index}].price must be a non-negative number`,
          });
        }
        if (
          category.features !== undefined &&
          !Array.isArray(category.features)
        ) {
          return BaseService.sendFailedResponse({
            error: `categories[${index}].features must be an array if provided`,
          });
        }
        // Remove _id if sent by client, since it is auto-generated
        if ("_id" in category) {
          delete category._id;
        }
      }

      const { name, description, categories, isActive = true } = post;

      const plan = new PlanModel({
        name,
        description,
        categories,
        isActive,
      });

      await plan.save();

      return BaseService.sendSuccessResponse({ message: plan });
    } catch (error) {
      console.error("Create plan error:", error);
      return BaseService.sendFailedResponse({ error: "Failed to create plan" });
    }
  }
  async getPlans(req, res) {
    try {
      const plans = await PlanModel.find();
      return BaseService.sendSuccessResponse({ message: plans || [] });
    } catch (error) {
      return BaseService.sendFailedResponse({ error: "Failed to get plans" });
    }
  }
  async getPlan(req, res) {
    try {
      if (!req.params.id) {
        return BaseService.sendFailedResponse({ error: "Plan ID is required" });
      }
      const plan = await PlanModel.findById(req.params.id);
      if (!plan)
        return BaseService.sendFailedResponse({ error: "Plan not found" });
      return BaseService.sendSuccessResponse({ message: plan });
    } catch (error) {
      return BaseService.sendFailedResponse({ error: "Failed to get plan" });
    }
  }
  async updatePlan(req, res) {
    try {
      if (!req.params.id) {
        return BaseService.sendFailedResponse({ error: "Plan ID is required" });
      }
      const plan = await PlanModel.findById(req.params.id);

      if (!plan)
        return BaseService.sendFailedResponse({ error: "Plan not found" });

      await PlanModel.findByIdAndUpdate(req.params.id, req.body, { new: true });

      return BaseService.sendSuccessResponse({
        message: "Plan updated successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({ error: "Failed to update plan" });
    }
  }
  async deletePlan(req, res) {
    try {
      if (!req.params.id) {
        return BaseService.sendFailedResponse({ error: "Plan ID is required" });
      }
      const plan = await PlanModel.findById(req.params.id);

      if (!plan)
        return BaseService.sendFailedResponse({ error: "Plan not found" });

      await PlanModel.findByIdAndDelete(req.params.id);

      return BaseService.sendSuccessResponse({
        message: "Plan deleted successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({ error: "Failed to delete plan" });
    }
  }
  async logSleep(req) {
    try {
      const { hours } = req.body;
      const userId = req.user.id;

      if (typeof hours !== "number" || hours < 0 || hours > 24) {
        return BaseService.sendFailedResponse({ error: "Invalid hours" });
      }

      // Calculate last night (previous day at midnight)
      const now = new Date();
      const lastNight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1
      );

      // Upsert (insert if not exists, update if it does)
      const entry = await SleepEntryModel.findOneAndUpdate(
        { userId, date: lastNight },
        { hours },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Remove entries older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      await SleepEntryModel.deleteMany({ userId, date: { $lt: sevenDaysAgo } });

      return BaseService.sendSuccessResponse({
        message: "Sleep hour logged successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to log sleep hour",
      });
    }
  }
  async logWater(req) {
    try {
      const { litres } = req.body;
      const userId = req.user.id;

      if (typeof litres !== "number" || litres < 0) {
        return BaseService.sendFailedResponse({
          error: "Invalid litres value",
        });
      }

      // Get today's date (at midnight)
      const today = new Date();
      const todayMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      // Upsert: update or insert today's water record
      const entry = await WaterEntryModel.findOneAndUpdate(
        { userId, date: todayMidnight },
        { litres },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return BaseService.sendSuccessResponse({
        message: "Water intake logged successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to log sleep hour",
      });
    }
  }
  async getSleepLog(req) {
    try {
      const userId = req.user.id;

      const today = new Date();
      const past7 = [];

      // Get last 7 days in order (oldest to newest)
      for (let i = 6; i >= 0; i--) {
        const d = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - i
        );
        past7.push(d);
      }

      // Get matching entries from DB
      const entries = await SleepEntryModel.find({
        userId,
        date: {
          $gte: past7[0],
          $lte: past7[6],
        },
      });

      // Map entries by date string
      const sleepMap = {};
      entries.forEach((e) => {
        const key = e.date.toISOString().slice(0, 10); // YYYY-MM-DD
        sleepMap[key] = e.hours;
      });

      const sleepData = past7.map((d) => {
        const key = d.toISOString().slice(0, 10);
        return {
          date: key,
          hours: sleepMap[key] || 0,
        };
      });

      return BaseService.sendSuccessResponse({
        message: sleepData,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to fetch sleep hours",
      });
    }
  }
  async getWaterLog(req) {
    try {
      const userId = req.user.id;

      const today = new Date();
      const todayMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const entry = await WaterEntryModel.findOne({
        userId,
        date: todayMidnight,
      });

      return BaseService.sendSuccessResponse({
        message: entry,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to fetch water logs",
      });
    }
  }
  async getNotifications(req) {
    try {
      const userId = req.user.id;
      const isRead = req.query.isRead;

      const filter = {
        userId,
        ...(isRead && { isRead }),
      };

      const notifications = await NotificationModel.find(filter).sort({
        timestamp: -1,
      });

      const formattedNotifications = notifications.map((notif) => ({
        // id: notif._id,
        // title: notif.title,
        // body: notif.body,
        time: formatNotificationTime(notif.createdAt),
        ...notif._doc,
      }));

      return BaseService.sendSuccessResponse({
        message: formattedNotifications,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to fetch sleep hours",
      });
    }
  }
  async getUnreadNotificationsCount(req) {
    try {
      const userId = req.user.id;

      const notifications = await NotificationModel.find({
        userId,
        isRead: false,
      }).countDocuments();

      return BaseService.sendSuccessResponse({
        message: notifications,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to fetch sleep hours",
      });
    }
  }
  async broadcastNotification(req) {
    try {
      const { title, body, notificationType } = req.body;

      if (!title || !body) {
        return BaseService.sendFailedResponse({
          error: "Title and body are required",
        });
      }

      // Find all regular users (not coach or admin)
      const users = await UserModel.find({
        userType: { $nin: ["coach", "admin"] },
      }).select("_id");

      if (users.length === 0) {
        return res.status(404).json({ message: "No regular users found" });
      }

      // Prepare notification docs for bulk insert
      const notifications = users.map((user) => ({
        userId: user._id,
        title,
        body,
        createdAt: new Date(),
        type: notificationType || "system",
      }));

      await NotificationModel.insertMany(notifications);
      await sendPushNotification({ title, body, topic: "all-users" });

      return BaseService.sendSuccessResponse({
        message: "Notification broadcasted successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to fetch sleep hours",
      });
    }
  }
  async markNotificationAsRead(req) {
    try {
      const { notificationids } = req.body;

      if (!Array.isArray(notificationids)) {
        return BaseService.sendFailedResponse({
          error: "notificationids must be an array of IDs",
        });
      }

      if (notificationids.length < 1) {
        return BaseService.sendFailedResponse({
          error: "notificationids array cannot be empty",
        });
      }

      await NotificationModel.updateMany(
        { _id: { $in: notificationids } },
        { $set: { isRead: true } }
      );

      return BaseService.sendSuccessResponse({
        message: `${
          notificationids.length == 1 ? "Notification" : "Notifications"
        } marked as read successfully`,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to fetch sleep hours",
      });
    }
  }
  async markAllNotificationsAsRead(req) {
    try {
      // Assuming you want to mark all notifications for the logged-in user as read:
      await NotificationModel.updateMany(
        { userId: req.user.id, isRead: false }, // only unread notifications for that user
        { $set: { isRead: true } }
      );

      return BaseService.sendSuccessResponse({
        message: "All notifications marked as read successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to mark notifications as read",
      });
    }
  }

  async deleteNotifications(req) {
    try {
      const { notificationids } = req.body;

      if (!Array.isArray(notificationids)) {
        return BaseService.sendFailedResponse({
          error: "notificationids must be an array of IDs",
        });
      }

      if (notificationids.length < 1) {
        return BaseService.sendFailedResponse({
          error: "notificationids array cannot be empty",
        });
      }

      await NotificationModel.deleteMany({ _id: { $in: notificationids } });

      return BaseService.sendSuccessResponse({
        message: `${
          notificationids.length == 1 ? "Notification" : "Notifications"
        } deleted successfully`,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to fetch sleep hours",
      });
    }
  }
  async deleteAllNotifications(req) {
    try {
      await NotificationModel.deleteMany({});

      return BaseService.sendSuccessResponse({
        message: "Notifications deleted successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to fetch sleep hours",
      });
    }
  }
  async updateDeviceToken(req) {
    try {
      const userId = req.user.id;

      const { deviceToken } = req.body;
      if (!deviceToken) {
        return BaseService.sendFailedResponse({
          error: "Device token is required",
        });
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }
      user.deviceToken = deviceToken;
      await user.save();
      return BaseService.sendSuccessResponse({
        message: "Device token updated successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to fetch water logs",
      });
    }
  }
  async verifyPhoneNumber(req) {
    try {
      const userId = req.user.id;

      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return BaseService.sendFailedResponse({
          error: "Phone number is required",
        });
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      const otp = generateOTP();

      const message = `Your verification code is ${otp}`;

      const otpResult = await sendOTP(phoneNumber, message);
      // console.log({otpResult: otpResult.data})

      if (otpResult.code == "ok") {
        const expiresAt = new Date(Date.now() + EXPIRES_AT);

        user.otp = otp;
        user.otpExpiresAt = expiresAt;
        await user.save();

        return BaseService.sendSuccessResponse({
          message: "OTP sent successfully to this number",
        });
      } else {
        return BaseService.sendFailedResponse({
          error: "Failed to sent otp to ths number",
        });
      }
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: "Failed to generate otp",
      });
    }
  }
  async verifyCodeToPhoneNumber(req) {
    try {
      const userId = req.user.id;

      const { code, phoneNumber } = req.body;
      if (!code) {
        return BaseService.sendFailedResponse({
          error: "code is required",
        });
      }
      if (!phoneNumber) {
        return BaseService.sendFailedResponse({
          error: "phone Number is required",
        });
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      if (empty(user.otp)) {
        return BaseService.sendFailedResponse({ error: "OTP not found" });
      }

      if (user.otp !== code) {
        return BaseService.sendFailedResponse({ error: "Invalid OTP" });
      }
      if (user.otpExpiresAt < new Date()) {
        return BaseService.sendFailedResponse({ error: "OTP expired" });
      }

      user.phoneNumber = phoneNumber;
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();

      return BaseService.sendSuccessResponse({
        message: "Phone updated successfully",
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: "Failed to update phone number",
      });
    }
  }
  async coachDashboardData(req) {
    try {
      const response = {};
      const coachId = req.user.id;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // ✅ Calls today
      const todayCalls = await CallLogModel.find({
        $or: [{ callerId: coachId }, { receiverId: coachId }],
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      // ✅ Chats today (messages sent today)
      const todayChats = await MessageModel.find({
        senderId: coachId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      // Combined engagements count
      const unreadMessages = await MessageModel.find({
        receiverId: coachId,
        readBy: { $ne: coachId },
      });

      const unreadCount = unreadMessages.length;

      const newChatsToday = await MessageModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            $or: [{ senderId: coachId }, { receiverId: coachId }],
          },
        },
        {
          $project: {
            otherUser: {
              $cond: [
                { $eq: ["$senderId", coachId] },
                "$receiverId",
                "$senderId",
              ],
            },
          },
        },
        {
          $group: {
            _id: "$otherUser",
          },
        },
        {
          $count: "totalNewChatsToday",
        },
      ]);

      const totalNewChats = newChatsToday[0]?.totalNewChatsToday || 0;

      response["engagementsCountCalls"] = todayCalls.length;
      response["engagementsCountChats"] = todayChats.length;
      response["unreadCount"] = unreadCount;
      response["totalNewChats"] = totalNewChats;

      return BaseService.sendSuccessResponse({
        message: response,
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: "Failed to fetch coach dashboard",
      });
    }
  }
  async customerSupport(req) {
    try {
      const whatsappNumber = process.env.SUPPORT_WHATSAPP || "+2347074237297";
      const supportEmail = process.env.SUPPORT_EMAIL || "mutaapp8@gmail.com";
      const supportCall = process.env.SUPPORT_CALL || "+2347074237297";

      return BaseService.sendSuccessResponse({
        message: {
          whatsappNumber,
          supportEmail,
          supportCall,
        },
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({
        error: this.server_error_message,
      });
    }
  }
  async deleteUser(req) {
    try {
      const session = await mongoose.startSession();

      const userId = req.user.id;

      const user = await UserModel.findById(userId);
      if (!user) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      session.startTransaction();
      await ChallengeActionModel.deleteMany({ userId }).session(session);
      await DietActionModel.deleteMany({ userId }).session(session);
      await FavoriteProductModel.deleteMany({ userId }).session(session);
      await NotificationModel.deleteMany({ userId }).session(session);
      await OrderModel.deleteMany({ userId }).session(session);
      await SleepEntryModel.deleteMany({ userId }).session(session);
      await WaterEntryModel.deleteMany({ userId }).session(session);
      await WorkoutPlanActionModel.deleteMany({ userId }).session(session);

      await UserModel.findByIdAndDelete(userId).session(session);

      await session.commitTransaction();
      session.endSession();

      return BaseService.sendSuccessResponse({
        message: "User deleted successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return BaseService.sendFailedResponse({
        error: "Failed to fetch sleep hours",
      });
    }
  }
  async contactUsAction(req) {
    try {
      const { message, name, email, phoneNumber } = req.body;
      if (!message || !email || phoneNumber || name) {
        return BaseService.sendFailedResponse({
          error: "Please provide the required fields",
        });
      }

      const emailHtml = `
         <h1>Message from ${name}</h1>
      <p>${message}</p>
      `;
      await sendEmail({
        subject: subject,
        to: email,
        html: emailHtml,
      });

      return BaseService.sendSuccessResponse({
        message: entry,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to send email to the admin",
      });
    }
  }
  async postCoachGuidance(req) {
    try {
      const post = req.body;
      const coachId = req.user.id;

      const validateRule = {
        text: "string|required",
        userId: "string|required",
        // planType: "string|required"
      };

      const validateMessage = {
        required: ":attribute is required",
        "string": ":attribute must be a :attribute.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      if(req.user.userType !== 'coach'){
        return BaseService.sendFailedResponse({ error: "Only coaches can post guidance" });
      }

      await CoachGuidanceModel.create({
        coachId,
        text: post.text,
        userId: post.userId,
        // planType: post.planType
      });

      return BaseService.sendSuccessResponse({
        message: "coach guidance created successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to send email to the admin",
      });
    }
  }
  async updateCoachGuidance(req) {
    try {
      const post = req.body;
      const coachGuidanceId = req.params.id;

      if(req.user.userType !== 'coach'){
        return BaseService.sendFailedResponse({ error: "Only coaches can post guidance" });
      }

      const coachGuidanceIdExists = await CoachGuidanceModel.findById(coachGuidanceId);

      if(!coachGuidanceIdExists){
        return BaseService.sendFailedResponse({ error: "coach guidance not found" });
      }

      await CoachGuidanceModel.findByIdAndUpdate(coachGuidanceId, post);

      return BaseService.sendSuccessResponse({
        message: "coach guidance updated successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to send email to the admin",
      });
    }
  }
  async updateCoachGuidanceAsSeen(req) {
    try {
      const coachGuidanceId = req.params.id;
      const userId = req.user.id;

      const coachGuidanceIdExists = await CoachGuidanceModel.findById(coachGuidanceId);

      if(!coachGuidanceIdExists){
        return BaseService.sendFailedResponse({ error: "coach guidance not found" });
      }

      if(userId !== coachGuidanceIdExists.userId.toString()){
        return BaseService.sendFailedResponse({ error: "You are not authorized to update this guidance" });
      }

      await CoachGuidanceModel.findByIdAndUpdate(coachGuidanceId, {status: 'seen'});

      return BaseService.sendSuccessResponse({
        message: "coach guidance marked as seen",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to send email to the admin",
      });
    }
  }
  async updateCoachGuidanceAsDone(req) {
    try {
      const coachGuidanceId = req.params.id;
      const userId = req.user.id;

      const coachGuidanceIdExists = await CoachGuidanceModel.findById(coachGuidanceId);

      if(!coachGuidanceIdExists){
        return BaseService.sendFailedResponse({ error: "coach guidance not found" });
      }

      if(userId !== coachGuidanceIdExists.userId.toString()){
        return BaseService.sendFailedResponse({ error: "You are not authorized to update this guidance" });
      }

      await CoachGuidanceModel.findByIdAndUpdate(coachGuidanceId, {status: 'done'});

      return BaseService.sendSuccessResponse({
        message: "coach guidance marked as done",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to send email to the admin",
      });
    }
  }
  async getUserCoachGuidance(req) {
    try {
      const userId = req.user.id;

      const allCoachGuidances = await CoachGuidanceModel.findOne({userId});


      return BaseService.sendSuccessResponse({
        message: allCoachGuidances,
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to get coach guidance",
      });
    }
  }
  async setActivityReminder(req) {
    try {
      const post = req.body;

      const validateRule = {
        dayOfWeek: "string|required",
        time: "string|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        "string": ":attribute must be a :attribute.",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const user = await UserModel.findById(req.user.id);

      if(!user){
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      user.reminders = {
        dayOfWeek: post.dayOfWeek,
        time: post.time,
      }

      await user.save();

      return BaseService.sendSuccessResponse({
        message: "reminder set successfully",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({
        error: "Failed to send email to the admin",
      });
    }
  }

  static calculateExpiryDateBasedOnPlan(paystackPlanCode) {
    const now = new Date();
    if (paystackPlanCode.includes("monthly")) {
      now.setMonth(now.getMonth() + 1);
    } else if (paystackPlanCode.includes("yearly")) {
      now.setFullYear(now.getFullYear() + 1);
    }
    return now;
  }
}

module.exports = UserService;
