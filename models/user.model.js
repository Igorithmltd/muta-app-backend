// models/Post.ts
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, unique: true },
    username: { type: String, trim: true, unique: true },
    firstName: { type: String, trim: true, unique: true },
    lastName: { type: String, trim: true, unique: true },
    phoneNumber: { type: String, trim: true, unique: true },
    // accountDetails: {
    //   accountNumber: { type: String },
    //   bankName: { type: String },
    //   accountName: { type: String },
    //   status: {type: String, enum: ['verified', 'unverified'], default: 'unverified'}
    // },
    password: { type: String },
    userType: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // referralCode: { type: String },
    // referralBonus: { type: Number, default: 0 },
    // referredUsers: {type: [mongoose.Schema.Types.ObjectId], ref: 'User'},
    // identityVerification: {
    //   ninDetails: {
    //     nin: { type: String },
    //     ninImageUrl: String,
    //   },
    //   bvnDetails: {
    //     bvn: String,
    //     bvnImageUrl: String,
    //   },
    //   status: {type: String, default: 'complete', enum: ['complete', 'incomplete']},
    //   isVerified: {type: Boolean, default: false},
    // },
    isRegistrationComplete: {type: Boolean, default: false},
    otp: { type: String },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    // status: { type: String, default: "inactive", enum: ["active", "inactive", "suspended"] },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      // const user = this as IUser;
      const hashPassword = await bcrypt.hash(this.password, 10);
      this.password = hashPassword;
    }
    next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  const user = this;
  return await bcrypt.compare(password, user.password);
};
UserSchema.methods.generateAccessToken = async function (secretToken) {
  const token = jwt.sign(
    {
      id: this._id,
      userType: this.userType,
    },
    secretToken,
    { expiresIn: "1h" }
  );
  return token;
};
UserSchema.methods.generateRefreshToken = async function (secretToken) {
  const token = jwt.sign(
    {
      id: this._id,
      userType: this.userType,
    },
    secretToken,
    { expiresIn: "48h" }
  );
  return token;
};

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel

