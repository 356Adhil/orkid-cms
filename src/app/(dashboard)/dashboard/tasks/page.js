"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    type: "text",
    description: "",
    content: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", formData.type);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file");
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
      let content = formData.content;

      if (formData.type !== "text") {
        const fileUrl = await handleUpload();
        if (!fileUrl) return;
        content = fileUrl;
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          content,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create task");
      }

      setShowModal(false);
      setFormData({
        type: "text",
        description: "",
        content: "",
      });
      setSelectedFile(null);
      fetchTasks();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      fetchTasks();
    } catch (error) {
      setError(error.message);
    }
  };

  const getTaskTypeLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <div className="mt-4">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-14 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 py-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
          <span>Tasks</span>
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition font-semibold"
        >
          <PlusIcon className="h-5 w-5" /> Add Task
        </button>
      </div>
      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {/* Table/Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : tasks.length === 0 ? (
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
              No tasks yet.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-1">
              <thead>
                <tr>
                  <th className="py-3 px-4 font-semibold text-gray-700 bg-gray-50 rounded-tl-xl">
                    Type
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                    Description
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                    Content
                  </th>
                  <th className="py-3 px-4 bg-gray-50 rounded-tr-xl text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => (
                  <tr
                    key={task._id}
                    className={`transition hover:bg-indigo-50 ${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900 rounded-l-xl">
                      {getTaskTypeLabel(task.type)}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {task.description}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {task.type === "text" ? (
                        <span className="bg-gray-100 rounded px-2 py-1 text-xs">
                          {task.content}
                        </span>
                      ) : (
                        <a
                          href={task.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          View File
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right rounded-r-xl flex gap-2 justify-end">
                      <button
                        onClick={() => handleDelete(task._id)}
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
      {/* Modal */}
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
                Add Task
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Type
                </label>
                <select
                  name="type"
                  id="type"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              {formData.type === "text" ? (
                <div className="mb-6">
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Content
                  </label>
                  <input
                    type="text"
                    name="content"
                    id="content"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <label
                    htmlFor="file"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    File
                  </label>
                  <input
                    type="file"
                    name="file"
                    id="file"
                    accept={formData.type + "/*"}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={handleFileChange}
                  />
                </div>
              )}
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
