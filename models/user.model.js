// models/Post.ts
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, unique: true },
    // username: { type: String, trim: true, unique: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    gender: { type: String },
    age: { type: Number },
    weight: { type: String },
    height: { type: String },
    focusArea: [String],
    fitnessLevel: {type: String, enum: ['beginner', 'intermediate', 'advanced']},
    // phoneNumber: { type: String, trim: true, unique: true, default: "" },
    googleId: { type: String, unique: true, sparse: true },
    password: { type: String },
    userType: {
      type: String,
      enum: ["user", "admin", "coach"],
      default: "user",
    },
    image: {
      type: {},
      default: {
        imageUrl:
          "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg",
        publicId: "",
      },
      required: true,
    },
    isRegistrationComplete: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    servicePlatform: {
      type: String,
      default: "local",
      enum: ["local", "google"],
    },
    status: { type: String, default: "inactive", enum: ["active", "inactive", "suspended"] },
    subscriptionPlan: {
      type: String,
      enum: ["basic", "premium"]
    }
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
module.exports = UserModel;
