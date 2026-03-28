import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".pdf": "application/pdf",
};

export async function GET(
    _request: Request,
    context: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: requestedPath } = await context.params;

        if (!requestedPath?.length || requestedPath.some((segment) => segment === "..")) {
            return new NextResponse("Invalid media path", { status: 400 });
        }

        const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
        const filePath = path.resolve(path.join(uploadsRoot, ...requestedPath));

        if (!filePath.startsWith(uploadsRoot)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const fileBuffer = await fs.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error: any) {
        if (error?.code === "ENOENT") {
            return new NextResponse("Not found", { status: 404 });
        }

        console.error("Media route error:", error);
        return new NextResponse("Failed to load media", { status: 500 });
    }
}
