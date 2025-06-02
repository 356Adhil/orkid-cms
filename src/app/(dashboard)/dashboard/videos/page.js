"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Modern minimal icons
const PlusIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

const XIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const VideoIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const PlayIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.348a1.125 1.125 0 01-1.667-.986V5.653z"
    />
  </svg>
);

const UploadIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
    />
  </svg>
);

const LoadingIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    description: "",
    duration: 0,
    pauseTimes: [],
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchVideos();
    fetchCategories();
    fetchTasks();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      setVideos(data);
    } catch (error) {
      setError("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      setError("Failed to fetch categories");
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      setError("Failed to fetch tasks");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a video file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("type", "video");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload video");
      }

      const { url } = await uploadRes.json();
      return url;
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const cloudinaryUrl = await handleUpload();
      if (!cloudinaryUrl) return;

      const res = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          cloudinaryUrl,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create video");
      }

      setShowModal(false);
      setFormData({
        categoryId: "",
        title: "",
        description: "",
        duration: 0,
        pauseTimes: [],
      });
      setSelectedFile(null);
      fetchVideos();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      const res = await fetch("/api/videos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete video");
      }

      fetchVideos();
    } catch (error) {
      setError(error.message);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const addPauseTime = () => {
    setFormData({
      ...formData,
      pauseTimes: [...formData.pauseTimes, { timeInSeconds: 0, task: "" }],
    });
  };

  const removePauseTime = (index) => {
    const newPauseTimes = [...formData.pauseTimes];
    newPauseTimes.splice(index, 1);
    setFormData({
      ...formData,
      pauseTimes: newPauseTimes,
    });
  };

  const updatePauseTime = (index, field, value) => {
    const newPauseTimes = [...formData.pauseTimes];
    newPauseTimes[index] = {
      ...newPauseTimes[index],
      [field]: field === "timeInSeconds" ? parseInt(value) || 0 : value,
    };
    setFormData({
      ...formData,
      pauseTimes: newPauseTimes,
    });
  };

  if (loading) {
    return (
      <div className="animate-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 bg-muted rounded-lg w-48 animate-pulse mb-2"></div>
            <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-10 bg-muted rounded-xl w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-modern h-64 animate-pulse">
              <div className="p-6">
                <div className="h-32 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Videos</h1>
          <p className="text-muted-foreground">
            Manage your video content library
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Upload Video
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          {error}
        </div>
      )}

      {/* Content */}
      {videos.length === 0 ? (
        <div className="card-modern">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <VideoIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Start building your video library by uploading your first video.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <UploadIcon className="w-4 h-4" />
              Upload Video
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="card-modern p-6 group hover:shadow-lg transition-all duration-300"
            >
              <div className="relative mb-4">
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                  <VideoIcon className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={video.cloudinaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-2 shadow-lg"
                  >
                    <PlayIcon className="w-4 h-4" />
                    Play
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {categories.find((c) => c._id === video.categoryId)?.name ||
                    "Uncategorized"}
                </p>
                {video.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatDuration(video.duration)}
                  </span>
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Upload Video
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  className="input-modern w-full"
                  placeholder="Enter video title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Category *
                </label>
                <select
                  id="categoryId"
                  required
                  className="input-modern w-full"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows="3"
                  className="input-modern w-full resize-none"
                  placeholder="Enter video description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  id="duration"
                  min="0"
                  className="input-modern w-full"
                  placeholder="Enter duration in seconds"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">
                    Pause Times
                  </label>
                  <button
                    type="button"
                    onClick={addPauseTime}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    + Add Pause Time
                  </button>
                </div>

                {formData.pauseTimes.map((pauseTime, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        max={formData.duration}
                        className="input-modern w-full"
                        placeholder="Time in seconds"
                        value={pauseTime.timeInSeconds}
                        onChange={(e) =>
                          updatePauseTime(
                            index,
                            "timeInSeconds",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <select
                        className="input-modern w-full"
                        value={pauseTime.task}
                        onChange={(e) =>
                          updatePauseTime(index, "task", e.target.value)
                        }
                      >
                        <option value="">Select a task</option>
                        {tasks.map((task) => (
                          <option key={task._id} value={task._id}>
                            {task.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePauseTime(index)}
                      className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Video File *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="file"
                    accept="video/*"
                    required
                    className="input-modern w-full"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <LoadingIcon className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-4 h-4" />
                      Upload Video
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
