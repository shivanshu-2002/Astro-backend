// AstrologerController.js
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import sendEmail from "../utils/sendMail.js";

export const registerAstrologer = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Generate OTP for registration
  const regOTP = generateOTP();

  // Create a new astrologer with role set to "astrologer"
  const astrologer = await User.create({
    name,
    email,
    password,
    otp: regOTP,
    role: "astrologer",
  });

  // Send OTP to the astrologer's email
  const message = `Your OTP for account verification is: ${regOTP}. This OTP will expire within 5 minutes. Use it to verify your email address.`;

  try {
    await sendEmail({
      email: astrologer.email,
      subject: `Account Verification`,
      message,
    });

    // Send a response to the client indicating that OTP has been sent
    res.status(201).json({
      success: true,
      message: `OTP sent to ${astrologer.email} for verification. Please enter the OTP to proceed.`,
    });
  } catch (error) {
    // If there's an error, delete the astrologer and OTP
    await astrologer.remove();

    return next(new ErrorHandler(error.message, 500));
  }
});

export const getTopAstrologers = async (req, res, next) => {
  try {
    const topAstrologers = await User.find({ role: "astrologer" })
      .sort({ "astrologerPrice.chatFees": 1 }) // Sorting by chat fees in ascending order
      .limit(20); // Limiting to the top 20 astrologers

    const astrologerData = topAstrologers.map((astrologer) => ({
      AstrologerName: astrologer.name,
      AstrologerRating: astrologer.astrologerRating,
      AstrologerExperience: astrologer.astrologerExperience,
      ChatFees: astrologer.astrologerPrice.chatFees,
      VideoCallFees: astrologer.astrologerPrice.videoCallFees,
    }));

    res.status(200).json({
      success: true,
      astrologerData,
    });
  } catch (error) {
    next(error);
  }
};

// Get top astrologers
export const getFeaturedAstrologers = catchAsyncErrors(
  async (req, res, next) => {
    try {
      // Build the filter object based on the database fields
      const filter = {
        role: "astrologer",
        astrologerRating: { $gte: 0 }, // Assuming minimum rating is 0
        astrologerExperience: { $gte: 0 }, // Assuming minimum experience is 0
        astrologerPrice: { $gte: 0 }, // Assuming minimum price is 0
      };

      // Get top astrologers based on the filters
      const topAstrologers = await User.find(filter)
        .sort({ astrologerRating: -1 }) // Sorting by rating in descending order
        .limit(20); // Limiting to the top 20 astrologers

      const featuredAstrologerData = topAstrologers.map((astrologer) => ({
        AstrologerName: astrologer.name,
        AstrologerRating: astrologer.astrologerRating,
        AstrologerSkills: astrologer.astrologerSkills,
        AstrologerExperience: astrologer.astrologerExperience,
        AstrologerPrice: astrologer.astrologerPrice,
      }));

      res.status(200).json({
        success: true,
        featuredAstrologerData,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const getAstrologersList = catchAsyncErrors(async (req, res, next) => {
  // Fetch astrologers who are available (isAvailable set to true)
  const astrologers = await User.find({
    role: "astrologer",
  }).select(
    "name avatar isAvailable astrologerRating astrologerExperience astrologerSkills isAvailable"
  );

  // Map the fetched data to the required format
  const astrologerList = astrologers.map((astrologer) => ({
    name: astrologer.name,
    avatar: astrologer.avatar,
    astrologerRating: astrologer.astrologerRating,
    astrologerExperience: astrologer.astrologerExperience,
    astrologerSkills: astrologer.astrologerSkills,
    isAvailable: astrologer.isAvailable,
  }));

  res.status(200).json({
    success: true,
    astrologers: astrologerList,
  });
});

export const getAstrologerDetails = catchAsyncErrors(async (req, res, next) => {
  const astrologerId = req.params.astrologerId;

  // Fetch the astrologer by ID
  const astrologer = await User.findById(astrologerId).select(
    "name avatar isAvailable astrologerRating astrologerExperience astrologerSkills"
  );

  // Check if the astrologer with the specified ID exists
  if (!astrologer) {
    return next(
      new ErrorHandler(`Astrologer not found with id ${astrologerId}`, 404)
    );
  }

  // Prepare the response data
  const astrologerDetails = {
    name: astrologer.name,
    avatar: astrologer.avatar,
    astrologerRating: astrologer.astrologerRating,
    astrologerExperience: astrologer.astrologerExperience,
    astrologerSkills: astrologer.astrologerSkills,
    isAvailable: astrologer.isAvailable,
  };

  res.status(200).json({
    success: true,
    astrologer: astrologerDetails,
  });
});
