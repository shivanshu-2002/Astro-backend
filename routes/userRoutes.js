import express from "express";

import {
  postReview,
  getReviews,
  getTopReviews,
} from "../controllers/reviewController.js";

import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";

import { singleUpload } from "../middleware/multer.js";

import {
  forgotPassword,
  loginUser,
  logout,
  registerUser,
  resetPassword,
  sendOTP,
} from "../controllers/authControllers.js";

import {
  getAstrologerDetails,
  getAstrologersList,
  getFeaturedAstrologers,
  getTopAstrologers,
  registerAstrologer,
} from "../controllers/astrologerController.js";

import {
  getAllUsers,
  getUserDetails,
  updatePassword,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/sendOTP", sendOTP);

router.post("/registerAsAstrologer", registerAstrologer);

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

router.get("/getTopAstrologers", isAuthenticatedUser, getTopAstrologers);

router.get(
  "/getFeaturedAstrologerData",
  isAuthenticatedUser,
  getFeaturedAstrologers
);

// Get all reviews for a particular astrologer
router.get("/getRatings/:astrologerId", getReviews);

// Post a review for a particular astrologer
router.post("/postRating/:astrologerId", isAuthenticatedUser, postReview);

// Get the top reviews
router.get("/getTopReviews", isAuthenticatedUser, getTopReviews);

router.get("/astrologers", isAuthenticatedUser, getAstrologersList);

router.get(
  "/astrologers/:astrologerId",
  isAuthenticatedUser,
  getAstrologerDetails
);

export default router;
