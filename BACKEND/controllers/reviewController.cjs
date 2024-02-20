// controllers/reviewController.js
const Review = require("../models/reviewModel.cjs");
const User = require("../models/userModel.cjs");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.cjs");
const ErrorHandler = require("../utils/errorHandler.cjs");

// POST /api/v1/astrologers/:astrologerId/reviews
exports.postReview = catchAsyncErrors(async (req, res, next) => {
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
exports.getReviews = catchAsyncErrors(async (req, res, next) => {
  const astrologerId = req.params.astrologerId;

  const reviews = await Review.find({ astrologer: astrologerId });

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
});
