// controllers/appointmentController.js
import User from "../models/userModel.js";
import Appointment from "../models/appointModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

export const makeAppointment = catchAsyncErrors(async (req, res, next) => {
  const astrologerId = req.params.astrologerId;
  const userId = req.user.id;

  // Extract appointmentType from the request body or query parameters
  const { appointmentType } = req.body; // Change this based on your request structure

  // Validate appointmentType (you can add more validations as needed)
  if (!appointmentType || !["chat", "video"].includes(appointmentType)) {
    return next(
      new ErrorHandler(
        "Invalid appointment type. Must be 'chat' or 'video'",
        400
      )
    );
  }

  try {
    // Retrieve astrologer details including chatFees and videoCallFees
    const astrologer = await User.findById(astrologerId).select(
      "astrologerPrice"
    );

    // Set appointment cost based on the type
    const appointmentCost =
      appointmentType === "chat"
        ? astrologer.astrologerPrice.chatFees
        : astrologer.astrologerPrice.videoCallFees;

    const newAppointment = await Appointment.create({
      astrologer: astrologerId,
      user: userId,
      type: appointmentType,
      appointmentCost,
      // Add other appointment details like startTime, endTime, etc.
    });

    // Update the astrologer's upcoming appointments and earnings
    await User.findByIdAndUpdate(
      astrologerId,
      {
        $push: { upcomingAppointments: newAppointment._id },
        $inc: { earnings: appointmentCost },
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    // Handle errors
    console.error("Error creating appointment:", error);

    // Check if the error is a validation error from Mongoose
    if (error.name === "ValidationError") {
      const errorMessage = Object.values(error.errors).map(
        (value) => value.message
      );
      next(new ErrorHandler(errorMessage, 400));
    } else {
      next(error);
    }
  }
});

// Rest of the code remains unchanged

export const completeAppointment = catchAsyncErrors(async (req, res, next) => {
  const appointmentId = req.params.appointmentId;

  // Find the appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(
      new ErrorHandler(`Appointment not found with id ${appointmentId}`, 404)
    );
  }

  // Check if the user making the request is the astrologer assigned to the appointment
  const astrologerId = req.user.id;
  if (appointment.astrologer.toString() !== astrologerId) {
    return next(
      new ErrorHandler(
        "Unauthorized. You are not the assigned astrologer for this appointment.",
        403
      )
    );
  }

  // Check if the appointment is already marked as completed
  if (appointment.status === "completed") {
    return next(
      new ErrorHandler("This appointment is already marked as completed.", 400)
    );
  }

  // Update the appointment status to completed
  appointment.status = "completed";
  await appointment.save();

  // Increase the astrologer's experience
  try {
    const astrologer = await User.findById(astrologerId);
    if (astrologer) {
      astrologer.astrologerExperience += 1; // You can adjust the experience increment as needed
      await astrologer.save();
    }

    res.status(200).json({
      success: true,
      message: "Appointment completed successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error increasing astrologer's experience:", error);
    next(new ErrorHandler("Error completing appointment", 500));
  }
});
