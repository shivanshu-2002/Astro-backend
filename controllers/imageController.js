import { getDataUri } from "../utils/dataUri.js";
import Image from "../models/imageModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import cloudinary from "cloudinary";

export const uploadImage = catchAsyncErrors(async (req, res, next) => {
  try {
    const category = req.body.category;
    const file = req.file;

    if (!category || !file) {
      throw new ErrorHandler(
        "Please provide both category and image file.",
        400
      );
    }

    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    const newImage = await Image.create({
      category: category,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: newImage,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, error.statusCode || 500));
  }
});

// Get All Images
export const getAllImages = catchAsyncErrors(async (req, res, next) => {
  const images = await Image.find();

  // Extract only the image URLs from the images array
  const imageUrls = images.map((image) => image.image.url);

  res.status(200).json({
    success: true,
    images: imageUrls,
  });
});

// Get Single Image Details
export const getImageDetails = catchAsyncErrors(async (req, res, next) => {
  const image = await Image.findById(req.params.id);
  if (!image) {
    return next(
      new ErrorHandler(`Image not found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    image,
  });
});

// Update Image Category
export const updateImageCategory = catchAsyncErrors(async (req, res, next) => {
  const newCategory = req.body.category;

  const image = await Image.findByIdAndUpdate(
    req.params.id,
    { category: newCategory },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Image category updated successfully",
    image,
  });
});

// Delete Image
export const deleteImage = catchAsyncErrors(async (req, res, next) => {
  const image = await Image.findById(req.params.id);

  if (!image) {
    return next(new ErrorHandler(`Image not found with id: ${req.params.id}`));
  }

  await image.deleteOne();

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
  });
});
