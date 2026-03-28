import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadLocalFile } from "@/lib/upload";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;
const MAX_FILE_SIZE = 250 * 1024 * 1024;

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const type = formData.get("type");

        if (!(file instanceof File)) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        if (type !== "image" && type !== "file") {
            return NextResponse.json({ success: false, error: "Invalid upload type" }, { status: 400 });
        }

        if (type === "image" && !file.type.startsWith("image/")) {
            return NextResponse.json({ success: false, error: "Only image files are allowed for image uploads" }, { status: 400 });
        }

        if (type === "file" && file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ success: false, error: "File size must be less than 250MB" }, { status: 400 });
        }

        if (type === "image" && file.size > MAX_IMAGE_SIZE) {
            return NextResponse.json({ success: false, error: "Image size must be less than 25MB" }, { status: 400 });
        }

        const url = await uploadLocalFile(file, type === "image" ? "project_images" : "project_files");

        return NextResponse.json({ success: true, url, assetId: url });
    } catch (error) {
        console.error("Project upload route error:", error);
        return NextResponse.json({ success: false, error: "Failed to upload project asset" }, { status: 500 });
    }
}
