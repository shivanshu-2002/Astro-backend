const User = require("../models/userModel.cjs");
const ErrorHandler = require("../utils/errorHandler.cjs");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.cjs");
const sendToken = require("../utils/jwtToken.cjs");
const sendEmail = require("../utils/sendMail.cjs");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const uriParser = require("../utils/dataUri.cjs");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
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
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
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

exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
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

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
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

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords don't match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    zodiacSign: req.body.zodiacSign,
    birthDate: req.body.birthDate,
    birthTime: req.body.birthTime,
    birthPlace: req.body.birthPlace,
    gender: req.body.gender,
  };

  // Check if there's an uploaded image
  if (req.file) {
    const fileUri = uriParser.getDataUri(req.file);
    const myCloud = await cloudinary.uploader.upload(fileUri.content);

    // Update the user's avatar in the database
    req.user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "User details updated successfully",
    user,
  });
});

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

exports.getAnyUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with id ${req.body.params}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.user.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    user,
  });
});

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with the id: ${req.params.id}`)
    );
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// Get top astrologers
exports.getFeaturedAstrologers = async (req, res, next) => {
  try {
    const topAstrologers = await User.find({ role: "astrologer" })
      .sort({ astrologerRating: -1 }) // Sorting by rating in descending order
      .limit(10); // Limiting to the top 10 astrologers

    const featuredAstrologerData = topAstrologers.map((astrologer) => ({
      AstrologerName: astrologer.name,
      AstrologerRating: astrologer.astrologerRating,
      AstrologerSkills: astrologer.astrologerSkills,
      AstrologerExperience: astrologer.astrologerExperience,
    }));

    res.status(200).json({
      success: true,
      featuredAstrologerData,
    });
  } catch (error) {
    next(error);
  }
};
