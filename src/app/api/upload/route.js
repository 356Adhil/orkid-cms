import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import auth from "@/middleware/auth";

export async function POST(req) {
  try {
    await auth(req);
    const formData = await req.formData();
    const file = formData.get("file");
    const type = formData.get("type"); // video, image, audio, etc.

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64
    const base64String = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          resource_type: type === "video" ? "video" : "auto",
          folder: "orkid-cms",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
