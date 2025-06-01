"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="max-w-2xl mx-auto mt-12 w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
        >
          Add
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
              <th className="py-2 px-3 font-semibold text-gray-700">Name</th>
              <th className="py-2 px-3 font-semibold text-gray-700">
                Description
              </th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id} className="border-t border-gray-100">
                <td className="py-2 px-3">{category.name}</td>
                <td className="py-2 px-3 text-gray-500">
                  {category.description}
                </td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No categories yet.
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed z-20 inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div
            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold mb-6">Add Category</h2>
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
                  className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
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
