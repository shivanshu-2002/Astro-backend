import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [8, "Password should be at least 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  astrologerRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: "Rating must be an integer.",
    },
    select: false,
  },
  astrologerSkills: {
    type: [String],
    default: [],
    select: false,
  },
  astrologerExperience: {
    type: Number,
    default: 0,
  },
  astrologerPrice: {
    chatFees: {
      type: Number,
      default: 0,
    },
    videoCallFees: {
      type: Number,
      default: 0,
    },
  },
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],

  appointmentCompletedCount: {
    type: Number,
    default: 0,
    select: false,
  },
  astrologerStatus: {
    type: String,
    enum: ["available", "unavailable", "busy"],
    default: "unavailable",
  },
  payments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  zodiacSign: {
    type: String,
    enum: [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ],
  },
  birthDate: Date,
  birthTime: String,
  birthPlace: String,
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
});

// We have used async function for encrypting password because insde arrow function we can't use 'this' keyword
userSchema.pre("save", async function (next) {
  // if condition is when we want to update all the fields expect the password otherwise the encrypted password would be encrypted again
  if (!this.isModified("password")) next();

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  // Generating a 5-digit numeric OTP
  const otp = Math.floor(10000 + Math.random() * 90000).toString();

  // Set OTP and expiry in the user schema
  this.resetPasswordToken = otp;
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

  // Return the OTP
  return otp;
};

export default mongoose.model("User", userSchema);
