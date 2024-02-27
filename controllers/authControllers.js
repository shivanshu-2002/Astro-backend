// AuthController.js
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import sendToken from "../utils/jwtToken.js";
import sendEmail from "../utils/sendMail.js";
import { generateOTP } from "../models/otpModel.js";
import OTPModel from "../models/otpModel.js";

export const sendOTP = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  const otpValue = generateOTP();

  try {
    // Create an OTP document
    const otpDocument = await OTPModel.create({
      email,
      otp: otpValue,
    });

    const message = `Your OTP for account verification is: ${otpValue}. This OTP will expire within 5 minutes. Use it to verify your email address.`;

    try {
      await sendEmail({
        email,
        subject: `Account Verification`,
        message,
      });

      // Note: You should use the 'res' object passed as an argument, not 'res' from the outer scope
      res.status(201).json({
        success: true,
        message: `OTP sent to ${email} for verification. Please enter the OTP to proceed.`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }

    return otpDocument;
  } catch (error) {
    return next(new ErrorHandler(`Error creating OTP: ${error.message}`, 500));
  }
});

export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, otp } = req.body;
  console.log(otp);

  try {
    // Find the OTP document by email
    const otpDocument = await OTPModel.findOne({ email });
    console.log(otpDocument);

    // Check if the OTP document is available
    if (!otpDocument || otpDocument.otp !== otp) {
      return next(new ErrorHandler("Invalid OTP or OTP expired", 400));
    }

    // Create a new user with the provided details
    const user = await User.create({
      name,
      email,
      password,
    });

    user.save();

    // Send a response to the client indicating successful registration
    res.status(201).json({
      success: true,
      message: `User registered successfully.`,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error during registration: ${error.message}`, 500)
    );
  }
});

export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email }).select("+otp");

    console.log(user);
    // Make sure the user and user.otp are available
    if (!user || !user.otp) {
      console.log("User or OTP not found");
      return next(new ErrorHandler("Invalid OTP or OTP expired", 400));
    }

    // Log the user.otp to check the ObjectId
    console.log("User OTP:", user.otp);

    // Check if the user's OTP matches the entered OTP
    if (user.otp !== otp) {
      console.log("Invalid OTP");
      // If OTP is incorrect, you can choose to delete the user
      await User.findOneAndDelete({ email });
      return next(
        new ErrorHandler("Invalid OTP. Return to the registration page", 400)
      );
    }

    // Mark the OTP as expired in the User model
    user.otp = undefined;
    await user.save();

    // Send a response to the client indicating that OTP has been verified
    res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

// Login User
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if the user has provided both (email and password)
  if (!email || !password) {
    return next(
      new ErrorHandler("Please enter the Email & Password both", 400)
    );
  }

  // in the user model we have made the selecion of password as false therefore we need to select the password filed diffferently as following
  const user = await User.findOne({ email }).select("+password");

  // if no user with the provided email if found the following condition
  if (!user) return next(new ErrorHandler("Invalid email or password", 401));

  const isPasswordMatched = await user.comparePassword(password);

  // if user with given email id is found but the password provided is wrong
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // if the password matches the return the token
  sendToken(user, 200, res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const otp = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const message = `Your OTP for password reset is: ${otp}. Use this OTP to reset your password. If you have not requested this email then please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { otp, password, confirmPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: otp,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid OTP or OTP expired", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  user.password = password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});
