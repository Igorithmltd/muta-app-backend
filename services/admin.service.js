const sendEmail = require("../util/emailService");
const BaseService = require("./base");
const UserModel = require("../models/user.model");
const { empty } = require("../util");
const validateData = require("../util/validate");
const { verifyRefreshToken, signAccessToken } = require("../util/helper");
const SavingModel = require("../models/saving.model");

class UserService extends BaseService {
  async getAllUsers(req) {
    try {
      const allUsers = await UserModel.find({userType: {$ne: 'admin'}}).select('-password')

      return BaseService.sendSuccessResponse({ message: allUsers });
    } catch (error) {
      console.log(error,'the admin error')
      return BaseService.sendFailedResponse({error})
    }
  }
  async getSavings(req) {
    try {
      const response = {}
      const personalSavings = await SavingModel.find({savingType: 'personal'})
      const groupSavings = await SavingModel.find({savingType: 'group'})

      response['personal'] = personalSavings
      response['group'] = groupSavings

      return BaseService.sendSuccessResponse({ message: response });
    } catch (error) {
      console.log(error,'the admin error')
      return BaseService.sendFailedResponse({error})
    }
  }
  async dashboardStat(req) {
    try {
      const response = {}
      const totalUsers = await UserModel.find({userType: {$ne: 'admin'}}).select('-password').countDocuments()
      const personalSavings = await SavingModel.find({savingType: 'personal'})
      const activeGroupSaving = await SavingModel.find({savingType: 'group', savingProgress: {$gt: 0, $lt: 100}}).countDocuments()

      // response['totalRevenue'] = personalSavings
      // response['totalInvestments'] = totalInvestments
      response['activeGroup'] = activeGroupSaving
      response['totalUsers'] = totalUsers

      return BaseService.sendSuccessResponse({ message: response });
    } catch (error) {
      console.log(error,'the admin error')
      return BaseService.sendFailedResponse({error})
    }
  }
  // async loginUser(req, res) {
  //   try {
  //     const post = req.body;
  //     const { email, password, username } = post;

  //     const validateRule = {
  //       email: "email|required",
  //       password: "string|required",
  //     };
  //     const validateMessage = {
  //       required: ":attribute is required",
  //       string: ":attribute must be a string",
  //       "email.email": "Please provide a valid :attribute.",
  //     };

  //     const validateResult = validateData(post, validateRule, validateMessage);
  //     if (!validateResult.success) {
  //       return BaseService.sendFailedResponse({ error: validateResult.data });
  //     }

  //     const userExists = await UserModel.findOne({ $or: [{ email }, { username }] });

  //     if(empty(userExists)){
  //       return BaseService.sendFailedResponse({error: 'Admin not found. Please try again later. '})
  //     }

  //     if (!(await userExists.comparePassword(password))) {
  //       return BaseService.sendFailedResponse({
  //         error: "Wrong email or password",
  //       });
  //     }
  //     const accessToken = await userExists.generateAccessToken(
  //       process.env.ACCESS_TOKEN_SECRET || ""
  //     );
  //     const refreshToken = await userExists.generateRefreshToken(
  //       process.env.REFRESH_TOKEN_SECRET || ""
  //     );

  //     res.cookie("growe_refresh_token", refreshToken, {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === "production",
  //       path: "/",
  //       maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  //       sameSite: "strict",
  //     });

  //     return BaseService.sendSuccessResponse({ message: accessToken });
  //   } catch (error) {
  //     console.log(error,'the error')
  //     return BaseService.sendFailedResponse({error})
  //   }
  // }
  // async getUser(req) {
  //   try {
  //     const user_id = req.user.id;

  //     let user_details = {};
  //     user_details = await UserModel.findById(user_id)
  //       .select("-password -pin")
  //       .populate("category");

  //     if (empty(user_details)) {
  //       return BaseService.sendFailedResponse({
  //         error: "Something went wrong trying to fetch your account.",
  //       });
  //     }

  //     return BaseService.sendSuccessResponse({ message: user_details });
  //   } catch (error) {
  //     console.log(error);
  //     return BaseService.sendFailedResponse({
  //       error: this.server_error_message,
  //     });
  //   }
  // }
  // async refreshToken(req) {
  //   try {
  //     const refreshToken = req.cookies.growe_refresh_token;

  //     if (!refreshToken) {
  //       return BaseService.sendFailedResponse({ error: "No refresh token" });
  //     }
  //     const decoded = verifyRefreshToken(refreshToken);
  //     const newAccessToken = signAccessToken({ id: decoded.id });

  //     return BaseService.sendSuccessResponse({ message: newAccessToken });
  //   } catch (err) {
  //     return BaseService.sendFailedResponse({ error: "Invalid refresh token" });
  //   }
  // }
}

module.exports = UserService;
