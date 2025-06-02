import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Video from "@/models/Video";
import TaskSubmission from "@/models/TaskSubmission";

export async function GET() {
  try {
    await connectDB();

    // Fetch recent items from each collection
    const [categories, videos, submissions] = await Promise.all([
      Category.find().sort({ createdAt: -1 }).limit(5),
      Video.find().sort({ createdAt: -1 }).limit(5),
      TaskSubmission.find()
        .populate("userId", "name")
        .populate("taskId")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Combine and format the activities
    const activities = [
      ...categories.map((category) => ({
        type: "category",
        action: "New category created",
        details: category.name,
        time: category.createdAt,
      })),
      ...videos.map((video) => ({
        type: "video",
        action: "Video uploaded",
        details: video.title,
        time: video.createdAt,
      })),
      ...submissions.map((submission) => ({
        type: "submission",
        action: "Submission reviewed",
        details: submission.taskId?.description || "Unknown Task",
        time: submission.createdAt,
      })),
    ];

    // Sort all activities by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Return only the 5 most recent activities
    return NextResponse.json(activities.slice(0, 5));
  } catch (error) {
    console.error("Get activity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
