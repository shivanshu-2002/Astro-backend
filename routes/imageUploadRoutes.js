import express from "express";
const router = express.Router();

import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";
import { uploadImage, getAllImages } from "../controllers/imageController.js";
// Image upload route
router
  .route("/uploadImage")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    singleUpload,
    uploadImage
  );

router.route("/getAllImages").get(getAllImages);

export default router;
