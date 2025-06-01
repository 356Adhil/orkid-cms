import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Video from "@/models/Video";
import auth from "@/middleware/auth";

// GET all videos
export async function GET() {
  try {
    await connectDB();
    const videos = await Video.find()
      .populate("categoryId")
      .sort({ createdAt: -1 });
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Get videos error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST new video
export async function POST(req) {
  try {
    await auth(req);
    const {
      categoryId,
      title,
      description,
      cloudinaryUrl,
      duration,
      pauseTimes,
    } = await req.json();

    await connectDB();
    const video = new Video({
      categoryId,
      title,
      description,
      cloudinaryUrl,
      duration,
      pauseTimes,
    });
    await video.save();

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Create video error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update video
export async function PUT(req) {
  try {
    await auth(req);
    const {
      id,
      categoryId,
      title,
      description,
      cloudinaryUrl,
      duration,
      pauseTimes,
    } = await req.json();

    await connectDB();
    const video = await Video.findByIdAndUpdate(
      id,
      { categoryId, title, description, cloudinaryUrl, duration, pauseTimes },
      { new: true }
    );

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Update video error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE video
export async function DELETE(req) {
  try {
    await auth(req);
    const { id } = await req.json();

    await connectDB();
    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete video error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
