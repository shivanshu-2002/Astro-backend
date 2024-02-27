// controllers/reviewController.js
import Review from "../models/reviewModel.js";
import User from "../models/userModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// POST /api/v1/astrologers/:astrologerId/reviews
export const postReview = catchAsyncErrors(async (req, res, next) => {
  console.log(req.user.name);
  const { ratings, review } = req.body;
  const astrologerId = req.params.astrologerId;

  // Find the astrologer based on the provided ID
  const astrologer = await User.findById(astrologerId);

  // Check if the astrologer exists
  if (!astrologer) {
    return next(new ErrorHandler("Astrologer not found", 404));
  }

  // Create a new review instance
  const newReview = new Review({
    username: req.user.name, // Username of the logged-in user
    ratings,
    review,
    astrologer: astrologerId, // ID of the astrologer being reviewed
  });

  // Save the new review to the database
  await newReview.save();

  // Respond with a success message
  res.status(201).json({
    success: true,
    message: "Review submitted successfully",
  });
});

// GET /api/v1/astrologers/:astrologerId/reviews
export const getReviews = catchAsyncErrors(async (req, res, next) => {
  const astrologerId = req.params.astrologerId;

  const reviews = await Review.find({ astrologer: astrologerId });

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
});

export const getTopReviews = catchAsyncErrors(async (req, res, next) => {
  try {
    // Get the top 10 reviews with the highest ratings
    const topReviews = await Review.find({})
      .sort({ ratings: -1 }) // Sorting by ratings in descending order
      .limit(10); // Limiting to the top 10 reviews

    res.status(200).json({
      success: true,
      count: topReviews.length,
      topReviews,
    });
  } catch (error) {
    next(error);
  }
});
