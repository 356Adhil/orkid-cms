"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Debug: log showModal state changes
function useDebugShowModal(showModal) {
  useEffect(() => {
    console.log("[DEBUG] showModal:", showModal);
  }, [showModal]);
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useDebugShowModal(showModal);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to create category");
      }

      setShowModal(false);
      setFormData({ name: "", description: "" });
      fetchCategories();
    } catch (error) {
      setShowModal(false);
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete category");
      }

      fetchCategories();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <div className="mt-4">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-14 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 py-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
          <span>Categories</span>
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition font-semibold"
        >
          <PlusIcon className="h-5 w-5" /> Add
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
        ) : categories.length === 0 ? (
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
              No categories yet.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-1">
              <thead>
                <tr>
                  <th className="py-3 px-4 font-semibold text-gray-700 bg-gray-50 rounded-tl-xl">
                    Name
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                    Description
                  </th>
                  <th className="py-3 px-4 bg-gray-50 rounded-tr-xl"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, idx) => (
                  <tr
                    key={category._id}
                    className={`transition hover:bg-indigo-50 ${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900 rounded-l-xl">
                      {category.name}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {category.description}
                    </td>
                    <td className="py-3 px-4 text-right rounded-r-xl">
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded transition"
                        title="Delete"
                      >
                        Delete
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
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn"
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
                Add Category
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-6">
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
