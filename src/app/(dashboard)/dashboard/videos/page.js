"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

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
    <div className="max-w-5xl mx-auto mt-14 w-full">
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 py-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
          <span>Videos</span>
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition font-semibold"
        >
          <PlusIcon className="h-5 w-5" /> Add Video
        </button>
      </div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="h-12 w-12 text-gray-200 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6"
              />
            </svg>
            <div className="text-gray-400 text-lg font-medium">
              No videos yet.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-1">
              <thead>
                <tr>
                  <th className="py-3 px-4 font-semibold text-gray-700 bg-gray-50 rounded-tl-xl">
                    Title
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                    Category
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                    Duration
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                    Description
                  </th>
                  <th className="py-3 px-4 bg-gray-50 rounded-tr-xl text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video, idx) => (
                  <tr
                    key={video._id}
                    className={`transition hover:bg-indigo-50 ${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900 rounded-l-xl">
                      {video.title}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {categories.find((c) => c._id === video.categoryId)
                        ?.name || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {video.duration ? `${video.duration} sec` : "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {video.description}
                    </td>
                    <td className="py-3 px-4 text-right rounded-r-xl flex gap-2 justify-end">
                      <a
                        href={video.cloudinaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded transition"
                        title="View"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(video._id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded transition"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed z-30 inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close"
              type="button"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <form onSubmit={handleSubmit} className="mt-2">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Add Video
              </h2>
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  name="categoryId"
                  id="categoryId"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
                  rows="2"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Video File
                </label>
                <input
                  type="file"
                  name="file"
                  id="file"
                  accept="video/*"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-semibold"
                  disabled={uploading}
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
