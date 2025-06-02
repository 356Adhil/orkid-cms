"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Modern minimal icons
const CategoryIcon = ({ className }) => (
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
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
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

const SubmissionIcon = ({ className }) => (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const ArrowUpIcon = ({ className }) => (
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
      d="M7 11l5-5m0 0l5 5m-5-5v12"
    />
  </svg>
);

export default function DashboardPage() {
  const [stats, setStats] = useState({
    categories: 0,
    videos: 0,
    submissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriesRes, videosRes, submissionsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/videos"),
          fetch("/api/submissions"),
        ]);

        // Check if responses are ok
        if (!categoriesRes.ok || !videosRes.ok || !submissionsRes.ok) {
          throw new Error("Failed to fetch some data");
        }

        const [categories, videos, submissions] = await Promise.all([
          categoriesRes.json(),
          videosRes.json(),
          submissionsRes.json(),
        ]);

        // Ensure we have arrays and get their lengths, default to 0 if not
        setStats({
          categories: Array.isArray(categories) ? categories.length : 0,
          videos: Array.isArray(videos) ? videos.length : 0,
          submissions: Array.isArray(submissions) ? submissions.length : 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Failed to load dashboard data");
        // Set default values even on error
        setStats({
          categories: 0,
          videos: 0,
          submissions: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: "Categories",
      value: stats.categories || 0, // Ensure it's always a number
      icon: CategoryIcon,
      href: "/dashboard/categories",
      color: "from-blue-500/10 to-blue-600/10 border-blue-200/50",
      iconColor: "text-blue-600",
      change: "+12%",
    },
    {
      title: "Videos",
      value: stats.videos || 0, // Ensure it's always a number
      icon: VideoIcon,
      href: "/dashboard/videos",
      color: "from-purple-500/10 to-purple-600/10 border-purple-200/50",
      iconColor: "text-purple-600",
      change: "+8%",
    },
    {
      title: "Submissions",
      value: stats.submissions || 0, // Ensure it's always a number
      icon: SubmissionIcon,
      href: "/dashboard/submissions",
      color: "from-green-500/10 to-green-600/10 border-green-200/50",
      iconColor: "text-green-600",
      change: "+24%",
    },
  ];

  if (loading) {
    return (
      <div className="animate-in">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded-lg w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-64 mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-modern h-32 animate-pulse">
              <div className="p-6">
                <div className="h-4 bg-muted rounded w-20 mb-4"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-lg">
          Here&apos;s what&apos;s happening with your content today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsCards.map((card) => (
          <Link key={card.title} href={card.href} className="group">
            <div
              className={`card-modern p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${card.color} group-hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/50 ${card.iconColor}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <ArrowUpIcon className="w-3 h-3" />
                  {card.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total {card.title}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {(card.value || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/categories"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors group"
            >
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/20 transition-colors">
                <CategoryIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Manage Categories</p>
                <p className="text-sm text-muted-foreground">
                  Organize your content
                </p>
              </div>
            </Link>
            <Link
              href="/dashboard/videos"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors group"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 group-hover:bg-purple-500/20 transition-colors">
                <VideoIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Upload Videos</p>
                <p className="text-sm text-muted-foreground">Add new content</p>
              </div>
            </Link>
            <Link
              href="/dashboard/submissions"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors group"
            >
              <div className="p-2 rounded-lg bg-green-500/10 text-green-600 group-hover:bg-green-500/20 transition-colors">
                <SubmissionIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Review Submissions</p>
                <p className="text-sm text-muted-foreground">
                  Check pending items
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              {
                action: "New category created",
                time: "2 minutes ago",
                type: "category",
              },
              { action: "Video uploaded", time: "1 hour ago", type: "video" },
              {
                action: "Submission reviewed",
                time: "3 hours ago",
                type: "submission",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-accent/50"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "category"
                      ? "bg-blue-500"
                      : activity.type === "video"
                      ? "bg-purple-500"
                      : "bg-green-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
