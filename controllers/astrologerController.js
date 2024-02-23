// AstrologerController.js
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// Get top astrologers
export const getFeaturedAstrologers = catchAsyncErrors(
  async (req, res, next) => {
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
