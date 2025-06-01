import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import auth from "@/middleware/auth";

// GET all tasks
export async function GET() {
  try {
    await connectDB();
    const tasks = await Task.find().sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST new task
export async function POST(req) {
  try {
    await auth(req);
    const { type, description, content } = await req.json();

    await connectDB();
    const task = new Task({ type, description, content });
    await task.save();

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update task
export async function PUT(req) {
  try {
    await auth(req);
    const { id, type, description, content } = await req.json();

    await connectDB();
    const task = await Task.findByIdAndUpdate(
      id,
      { type, description, content },
      { new: true }
    );

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(req) {
  try {
    await auth(req);
    const { id } = await req.json();

    await connectDB();
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
