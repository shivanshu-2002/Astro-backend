// routes/appointmentRoutes.js
import express from "express";
import {
  makeAppointment,
  completeAppointment,
} from "../controllers/appointmentController.js";

import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/makeAppointment/:astrologerId",
  isAuthenticatedUser,
  makeAppointment
);

router.put(
  "/appointment/:appointmentId/complete",
  isAuthenticatedUser,
  authorizeRoles("astrologer"),
  completeAppointment
);

export default router;
