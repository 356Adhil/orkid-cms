"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [currentPauseTime, setCurrentPauseTime] = useState({
    timeInSeconds: 0,
    task: "",
  });
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
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", "video");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
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

  const addPauseTime = () => {
    if (currentPauseTime.timeInSeconds <= 0) {
      setError("Please enter a valid pause time");
      return;
    }

    setFormData({
      ...formData,
      pauseTimes: [...formData.pauseTimes, currentPauseTime],
    });
    setCurrentPauseTime({ timeInSeconds: 0, task: "" });
  };

  const removePauseTime = (index) => {
    setFormData({
      ...formData,
      pauseTimes: formData.pauseTimes.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Videos</h1>
          <div className="mt-4">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Videos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
        >
          Add Video
        </button>
      </div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-6">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-3 font-semibold text-gray-700">Title</th>
              <th className="py-2 px-3 font-semibold text-gray-700">
                Category
              </th>
              <th className="py-2 px-3 font-semibold text-gray-700">
                Duration
              </th>
              <th className="py-2 px-3 font-semibold text-gray-700">
                Pause Times
              </th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video._id} className="border-t border-gray-100">
                <td className="py-2 px-3">{video.title}</td>
                <td className="py-2 px-3 text-gray-500">
                  {video.categoryId?.name}
                </td>
                <td className="py-2 px-3 text-gray-500">
                  {video.duration} seconds
                </td>
                <td className="py-2 px-3 text-gray-500">
                  {video.pauseTimes.length} pauses
                </td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {videos.length === 0 && (
          <div className="text-center text-gray-400 py-8">No videos yet.</div>
        )}
      </div>
      {showModal && (
        <div className="fixed z-20 inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div
            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold mb-6">Add Video</h2>
              <div className="mb-4">
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows="3"
                  className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  required
                  min="0"
                  className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="video"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Video File
                </label>
                <input
                  type="file"
                  name="video"
                  id="video"
                  accept="video/*"
                  required
                  className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={handleFileChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pause Times
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="number"
                    placeholder="Time (seconds)"
                    min="0"
                    className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={currentPauseTime.timeInSeconds}
                    onChange={(e) =>
                      setCurrentPauseTime({
                        ...currentPauseTime,
                        timeInSeconds: parseInt(e.target.value),
                      })
                    }
                  />
                  <select
                    className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={currentPauseTime.task}
                    onChange={(e) =>
                      setCurrentPauseTime({
                        ...currentPauseTime,
                        task: e.target.value,
                      })
                    }
                  >
                    <option value="">No Task</option>
                    {tasks.map((task) => (
                      <option key={task._id} value={task._id}>
                        {task.description}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addPauseTime}
                    className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    Add
                  </button>
                </div>
                {formData.pauseTimes.length > 0 && (
                  <div className="mt-2">
                    <ul className="divide-y divide-gray-200">
                      {formData.pauseTimes.map((pause, index) => (
                        <li
                          key={index}
                          className="py-2 flex justify-between items-center"
                        >
                          <span>{pause.timeInSeconds} seconds</span>
                          <button
                            type="button"
                            onClick={() => removePauseTime(index)}
                            className="text-red-500 hover:underline text-sm"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  {uploading ? "Uploading..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
