"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      setSubmissions(data);
    } catch (error) {
      setError("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete submission");
      }

      fetchSubmissions();
    } catch (error) {
      setError(error.message);
    }
  };

  const getSubmissionTypeLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Submissions</h1>
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
          <span>Submissions</span>
        </h1>
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
        ) : submissions.length === 0 ? (
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
              No submissions yet.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-1">
              <thead>
                <tr>
                  <th className="py-3 px-4 font-semibold text-gray-700 bg-gray-50 rounded-tl-xl">
                    Task
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                    Type
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                    Submitted At
                  </th>
                  <th className="py-3 px-4 bg-gray-50 rounded-tr-xl text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, idx) => (
                  <tr
                    key={submission._id}
                    className={`transition hover:bg-indigo-50 ${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900 rounded-l-xl">
                      {submission.taskId?.description || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {getSubmissionTypeLabel(submission.type)}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {formatDate(submission.submittedAt)}
                    </td>
                    <td className="py-3 px-4 text-right rounded-r-xl flex gap-2 justify-end">
                      <button
                        onClick={() => handleView(submission)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded transition"
                        title="View"
                      >
                        <EyeIcon className="h-5 w-5" /> View
                      </button>
                      <button
                        onClick={() => handleDelete(submission._id)}
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
      {showModal && selectedSubmission && (
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
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Submission Details
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                Task: {selectedSubmission.taskId?.description}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Type: {getSubmissionTypeLabel(selectedSubmission.type)}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Submitted At: {formatDate(selectedSubmission.submittedAt)}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Content
              </h4>
              {selectedSubmission.type === "text" ? (
                <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded p-3">
                  {selectedSubmission.content}
                </p>
              ) : (
                <a
                  href={selectedSubmission.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  View File
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
