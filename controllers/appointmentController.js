import User from "../models/userModel.js";
import Appointment from "../models/appointModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

export const makeAppointment = catchAsyncErrors(async (req, res, next) => {
  const astrologerId = req.params.astrologerId;
  const userId = req.user.id;

  // Perform necessary validations and create the appointment
  try {
    const newAppointment = await Appointment.create({
      astrologer: astrologerId,
      user: userId,
      // Add other appointment details like startTime, endTime, etc.
    });

    // Update the astrologer's upcoming appointments
    await User.findByIdAndUpdate(
      astrologerId,
      {
        $push: { upcomingAppointments: newAppointment._id },
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
