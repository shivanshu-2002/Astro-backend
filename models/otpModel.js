import mongoose from "mongoose";
import sendEmail from "../utils/sendMail.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes in seconds (5 * 60)
  },
});

export const generateOTP = () => {
  // Generating a 4-digit numeric OTP
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const OTPModel = mongoose.model("OTP", OTPSchema);

export default OTPModel;
