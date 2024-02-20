const express = require("express");
const userController = require("../controllers/userController.cjs");
const reviewController = require("../controllers/reviewController.cjs");
const authMiddleware = require("../middleware/auth.cjs");
const router = express.Router();
const uploadMiddleware = require("../middleware/multer.cjs");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/password/forgot", userController.forgotPassword);
router.put("/password/reset", userController.resetPassword);
router.get("/logout", userController.logout);

router.get(
  "/me",
  authMiddleware.isAuthenticatedUser,
  userController.getUserDetails
);
router.put(
  "/password/update",
  authMiddleware.isAuthenticatedUser,
  userController.updatePassword
);
router.put(
  "/me/update",
  authMiddleware.isAuthenticatedUser,
  uploadMiddleware.singleUpload,
  userController.updateUserProfile
);

// Admin Routes
router.get(
  "/admin/users",
  authMiddleware.isAuthenticatedUser,
  authMiddleware.authorizeRoles("admin"),
  userController.getAllUsers
);

router.post("/admin/login", userController.loginUser);

router.post("/astrologer/login", userController.loginUser);

router.get(
  "/getFeaturedAstrologerData",
  authMiddleware.isAuthenticatedUser,
  userController.getFeaturedAstrologers
);

// Get all reviews for a particular astrologer
router.get("/getRatings/:astrologerId", reviewController.getReviews);

// Post a review for a particular astrologer
router.post(
  "/postRating/:astrologerId",
  authMiddleware.isAuthenticatedUser,
  reviewController.postReview
);

module.exports = router;
