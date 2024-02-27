// models/appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  astrologer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startTime: Date,
  endTime: Date,
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
  type: {
    type: String,
    enum: ["chat", "videoCall", "live"],
    default: "chat",
  },
  appointmentCost: {
    type: Number,
    default: 0,
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
