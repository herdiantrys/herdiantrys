import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as "image" | "file";

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        // Upload to Sanity
        // Note: For very large files, this might still hit memory limits if Next.js buffers the whole request.
        // But it's better than Server Actions default.
        // Ideally we would pipe stream, but writeClient.assets.upload expects File/Buffer/Stream.
        // `file` from formData is a Blob/File object.
        // Sanity client can handle it.

        const asset = await writeClient.assets.upload(type === "image" ? "image" : "file", file, {
            contentType: file.type,
            filename: file.name,
        });

        return NextResponse.json({ success: true, url: asset.url, assetId: asset._id });
    } catch (error: any) {
        console.error("API Upload Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Upload failed" }, { status: 500 });
    }
}
