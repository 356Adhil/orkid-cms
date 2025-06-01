"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Submissions</h1>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Task
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Submitted At
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {submissions.map((submission) => (
                      <tr key={submission._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {submission.taskId?.description || "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {getSubmissionTypeLabel(submission.type)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(submission.submittedAt)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleView(submission)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(submission._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedSubmission && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Submission Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Task: {selectedSubmission.taskId?.description}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Type: {getSubmissionTypeLabel(selectedSubmission.type)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Submitted At: {formatDate(selectedSubmission.submittedAt)}
                  </p>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Content</h4>
                  {selectedSubmission.type === "text" ? (
                    <p className="mt-2 text-sm text-gray-500">
                      {selectedSubmission.content}
                    </p>
                  ) : (
                    <div className="mt-2">
                      {selectedSubmission.type === "image" && (
                        <img
                          src={selectedSubmission.content}
                          alt="Submission"
                          className="max-w-full h-auto rounded-lg"
                        />
                      )}
                      {selectedSubmission.type === "video" && (
                        <video
                          src={selectedSubmission.content}
                          controls
                          className="max-w-full rounded-lg"
                        />
                      )}
                      {selectedSubmission.type === "audio" && (
                        <audio
                          src={selectedSubmission.content}
                          controls
                          className="w-full"
                        />
                      )}
                      {selectedSubmission.type === "pdf" && (
                        <a
                          href={selectedSubmission.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View PDF
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
