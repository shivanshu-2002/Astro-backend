import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});

const Image = mongoose.model("Image", imageSchema);

export default Image;
