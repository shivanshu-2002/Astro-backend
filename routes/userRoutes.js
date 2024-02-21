import express from "express";

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
  getUserDetails,
  getAllUsers,
  getAnyUser,
  updateUserProfile,
  updatePassword,
  getFeaturedAstrologers,
} from "../controllers/userController.js";

import { postReview, getReviews } from "../controllers/reviewController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset", resetPassword);
router.get("/logout", logout);

router.get("/me", isAuthenticatedUser, getUserDetails);
router.put("/password/update", isAuthenticatedUser, updatePassword);
router.put("/me/update", isAuthenticatedUser, singleUpload, updateUserProfile);

// Admin Routes
router.get(
  "/admin/users",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAllUsers
);

router.post("/admin/login", loginUser);

router.post("/astrologer/login", loginUser);

router.get(
  "/getFeaturedAstrologerData",
  isAuthenticatedUser,
  getFeaturedAstrologers
);

// Get all reviews for a particular astrologer
router.get("/getRatings/:astrologerId", getReviews);

// Post a review for a particular astrologer
router.post("/postRating/:astrologerId", isAuthenticatedUser, postReview);

export default router;
