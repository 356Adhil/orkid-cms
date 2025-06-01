const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  cloudinaryUrl: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  pauseTimes: [
    {
      timeInSeconds: {
        type: Number,
        required: true,
      },
      task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: false,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);

module.exports = Video;
