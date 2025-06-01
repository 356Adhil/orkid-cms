const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "video", "pdf", "text", "audio"],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String, // URL or text content depending on type
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

module.exports = Task;
