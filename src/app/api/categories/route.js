import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import auth from "@/middleware/auth";

// GET all categories
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST new category
export async function POST(req) {
  try {
    await auth(req);
    const { name, description } = await req.json();

    await connectDB();
    const category = new Category({ name, description });
    await category.save();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(req) {
  try {
    await auth(req);
    const { id, name, description } = await req.json();

    await connectDB();
    const category = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(req) {
  try {
    await auth(req);
    const { id } = await req.json();

    await connectDB();
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
