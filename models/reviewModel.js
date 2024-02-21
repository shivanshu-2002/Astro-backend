// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  username: { type: String, required: true },
  ratings: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  astrologer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Referring to the User model
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
