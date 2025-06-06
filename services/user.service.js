const { OAuth2Client } = require("google-auth-library");
const sendEmail = require("../util/emailService");
const BaseService = require("./base");
const UserModel = require("../models/user.model");
const { empty } = require("../util");
const validateData = require("../util/validate");
const {
  generateOTP,
  verifyRefreshToken,
  signAccessToken,
} = require("../util/helper");
const { EXPIRES_AT } = require("../util/constants");

class UserService extends BaseService {
  async createUser(req, res) {
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

      const userExists = await UserModel.findOne({ email: post.email });
      if (!empty(userExists)) {
        return BaseService.sendFailedResponse({
          error: "User exist. Please login",
        });
      }

      const newUser = new UserModel(post);
      await newUser.save();

      // userExists.markModified("password");
      // await userExists.save();

      const otp = generateOTP();

      const expiresAt = EXPIRES_AT;

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
      
      const username = email ? email.split('@')[0] : name?.replace(/\s+/g, '').toLowerCase();
      
      const firstName = given_name || name?.split(' ')[0] || '';
      const lastName = family_name || name?.split(' ').slice(1).join(' ') || '';
      
      // Check if user exists in DB, otherwise create (pseudo code)
      const userWithSub = await UserModel.findOne({googleId, email});

      if (userWithSub) {
        const accessToken = await userWithSub.generateAccessToken(
          process.env.ACCESS_TOKEN_SECRET || ""
        );
        const refreshToken = await userWithSub.generateRefreshToken(
          process.env.REFRESH_TOKEN_SECRET || ""
        );
        return BaseService.sendSuccessResponse({message: accessToken, user: userWithSub, refreshToken})
      }

      const userObject = {
        googleId,
        firstName,
        lastName,
        username,
        email,
        image: {imageUrl: picture, publicId: ""},
        isVerified: true
      }
      
      
      const newUser = new UserModel(userObject)

      await newUser.save()

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
        refreshToken
      });
    } catch (error) {
      console.log(error);
      return BaseService.sendFailedResponse({ error: this.server_error_message });
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
        return BaseService.sendFailedResponse(
          "User not found. Please try again later"
        );
      }

      if (empty(userExists.otp)) {
        return BaseService.sendFailedResponse("OTP not found");
      }

      if (userExists.otp !== otp) {
        return BaseService.sendFailedResponse("Invalid OTP");
      }
      if (userExists.otpExpiresAt < new Date()) {
        return BaseService.sendFailedResponse("OTP expired");
      }

      userExists.isVerified = true;
      userExists.otp = "";
      userExists.otpExpiresAt = null;
      await userExists.save();

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
        message: "OTP verified successfullly",
      });
    } catch (error) {
      return BaseService.sendFailedResponse({ error });
    }
  }
  async loginUser(req, res) {
    try {
      const post = req.body;
      const { email, password } = post;

      const validateRule = {
        email: "email|required",
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

      const userExists = await UserModel.findOne({ email });

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

      if(userExists.servicePlatform !== "local") {
        return BaseService.sendSuccessResponse({ error: `Please login using the ${userExists.servicePlatform} platform` });
      }

      if (!(await userExists.comparePassword(password))) {
        return BaseService.sendFailedResponse({
          error: "Wrong email or password"
        });
      }
      
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

      return BaseService.sendSuccessResponse({ message: accessToken, user: userExists, refreshToken });
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
      userExists.otp_expiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
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
      userExists.markModified("password");
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

      const expiresAt = EXPIRES_AT;

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

      const expiresAt = EXPIRES_AT;

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
          <p>Please reset your password</p>
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

      userExists.password = password;
      userExists.markModified("password");
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
      const refreshToken = req.headers.authorization;

      if (!refreshToken) {
        return BaseService.sendFailedResponse({ error: "No refresh token" });
      }

      if (
        refreshToken.split(" ").filter((item) => item !== "null").length < 2
      ) {
        return BaseService.sendFailedResponse({
          error: "Please provide a valid token to proceed",
        });
      }

      const token = refreshToken.split(" ")[1];
      // check if token is provided
      if (!token) {
        return BaseService.sendFailedResponse({
          error: "Unauthorized. Please log in",
        });
      }

      const decoded = verifyRefreshToken(token);
      const newAccessToken = signAccessToken({
        id: decoded.id,
        userType: decoded.userType,
      });

      res.header("Authorization", `Bearer ${newAccessToken}`);

      return BaseService.sendSuccessResponse({
        message: "New access token sent",
      });
    } catch (err) {
      console.log(err, "the err");
      return BaseService.sendFailedResponse({ error: "Invalid refresh token" });
    }
  }
  async completeOnboarding(req) {
    try {
      const post = req.body;
      const userId = req.user.id;

      const validateRule = {
        firstName: "string|required",
        lastName: "string|required",
        gender: "string|required",
        age: "int|required",
      };

      const validateMessage = {
        required: ":attribute is required",
        string: ":attribute must be a string",
        int: ":attribute must be a string",
      };

      const validateResult = validateData(post, validateRule, validateMessage);

      if (!validateResult.success) {
        return BaseService.sendFailedResponse({ error: validateResult.data });
      }

      const user = await UserModel.findById(userId);
      if (empty(user)) {
        return BaseService.sendFailedResponse({ error: "User not found" });
      }

      if(post.fitnessLevel && !["beginner", "intermediate", "advanced"].includes(post.fitnessLevel)) {
        return BaseService.sendFailedResponse({ error: "Invalid fitness level" });
      }

      if(post.focusArea && !Array.isArray(post.focusArea)) {
        return BaseService.sendFailedResponse({ error: "Focus area must be an array" });
      }

      const onboardingData = {
        age: post.age,
        gender: post.gender,
        firstName: post.firstName,
        ...(post.weight && {weight: post.weight}),
        ...(post.height && {height: post.height}),
        ...(post.focusArea && {focusArea: post.focusArea}),
        ...(post.fitnessLevel && {fitnessLevel: post.fitnessLevel})
      }
      
      await UserModel.findByIdAndUpdate(userId, onboardingData, {new: true});

      return BaseService.sendSuccessResponse({
        message: "Account details updated",
      });
    } catch (err) {
      return BaseService.sendFailedResponse({ error: "Invalid refresh token" });
    }
  }
}

module.exports = UserService;
