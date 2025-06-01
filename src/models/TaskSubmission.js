const mongoose = require("mongoose");

const taskSubmissionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  submissionType: {
    type: String,
    enum: ["image", "video", "pdf", "text", "audio"],
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TaskSubmission =
  mongoose.models.TaskSubmission ||
  mongoose.model("TaskSubmission", taskSubmissionSchema);

module.exports = TaskSubmission;
