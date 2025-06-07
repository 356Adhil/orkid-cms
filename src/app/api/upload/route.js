import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import auth from "@/middleware/auth";

// Configure the route to handle large uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1gb", // Set limit to 1GB to handle large videos
    },
  },
};

// For Next.js App Router, we need to set runtime config
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes timeout for large uploads

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

    console.log(`Uploading file: ${file.name}, Size: ${buffer.length} bytes`);

    // Configure upload options for large files
    const uploadOptions = {
      resource_type: type === "video" ? "video" : "auto",
      folder: "orkid-cms",
      use_filename: true,
      unique_filename: true,
    };

    // For large files, use unsigned upload which works better with free plans
    const result = await new Promise((resolve, reject) => {
      // Convert to base64 for upload
      const base64String = buffer.toString("base64");
      const dataURI = `data:${file.type};base64,${base64String}`;

      cloudinary.uploader.upload(
        dataURI,
        {
          ...uploadOptions,
          // These options help with large file uploads on free plans
          timeout: 600000, // 10 minute timeout
          chunk_size: 6000000, // 6MB chunks
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    console.log("Upload successful:", result.public_id);
    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
