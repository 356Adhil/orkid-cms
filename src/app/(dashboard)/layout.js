"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      <nav className="w-full border-b border-gray-200 py-4 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
          <Link
            href="/dashboard"
            className="text-2xl font-bold text-indigo-600"
          >
            Orkid CMS
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard/categories"
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              Categories
            </Link>
            <Link
              href="/dashboard/videos"
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              Videos
            </Link>
            <Link
              href="/dashboard/submissions"
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              Submissions
            </Link>
            <span className="text-gray-500">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto w-full px-4">{children}</main>
    </div>
  );
}
