import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TaskSubmission from "@/models/TaskSubmission";
import auth from "@/middleware/auth";

// GET all submissions
export async function GET(req) {
  try {
    // Remove auth requirement for GET requests to match other APIs
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const taskId = searchParams.get("taskId");
    const videoId = searchParams.get("videoId");

    await connectDB();
    const query = {};
    if (userId) query.userId = userId;
    if (taskId) query.taskId = taskId;
    if (videoId) query.videoId = videoId;

    const submissions = await TaskSubmission.find(query)
      .populate("userId", "name email")
      .populate("taskId")
      .populate("videoId")
      .sort({ createdAt: -1 });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST new submission
export async function POST(req) {
  try {
    await auth(req);
    const { taskId, userId, videoId, submissionType, fileUrl } =
      await req.json();

    await connectDB();
    const submission = new TaskSubmission({
      taskId,
      userId,
      videoId,
      submissionType,
      fileUrl,
    });
    await submission.save();

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Create submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update submission
export async function PUT(req) {
  try {
    await auth(req);
    const { id, submissionType, fileUrl } = await req.json();

    await connectDB();
    const submission = await TaskSubmission.findByIdAndUpdate(
      id,
      { submissionType, fileUrl },
      { new: true }
    );

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Update submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE submission
export async function DELETE(req) {
  try {
    await auth(req);
    const { id } = await req.json();

    await connectDB();
    const submission = await TaskSubmission.findByIdAndDelete(id);

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.error("Delete submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
