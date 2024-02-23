import express from "express";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import env from "dotenv";

env.config({ path: "BACKEND/config/config.env" });

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: "*", // Allow requests from any origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 204,
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Route imports
import userRoute from "./routes/userRoutes.js";
import imageRoute from "./routes/imageUploadRoutes.js";
import errorMiddleware from "./middleware/error.js";
import payment from "./routes/paymentRoute.js";
import appointment from "./routes/appointmentRoutes.js";

app.use("/api/v1", userRoute);
app.use("/api/v1", imageRoute);
app.use("/api/v1", payment);
app.use("/api/v1", appointment);

// Middleware for errors
app.use(errorMiddleware);

export { app };
