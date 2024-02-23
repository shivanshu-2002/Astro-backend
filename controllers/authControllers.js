// AuthController.js
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import sendToken from "../utils/jwtToken.js";
import sendEmail from "../utils/sendMail.js";

export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    email,
    password,
    zodiacSign,
    birthDate,
    birthTime,
    birthPlace,
    gender,
  } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is a sample id",
      url: "profilePictureUrl",
    },
    zodiacSign,
    birthDate,
    birthTime,
    birthPlace,
    gender,
  });

  sendToken(user, 201, res);
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
