import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
    createPresignedR2Upload,
    getR2MissingConfig,
    isR2Configured,
    type DirectUploadPurpose,
} from "@/lib/r2-storage";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 25 * 1024 * 1024;
const MAX_FILE_SIZE = 250 * 1024 * 1024;

const isAdminRole = (role?: string | null) => role === "ADMIN" || role === "SUPER_ADMIN";

const getPurposeFolder = (purpose: DirectUploadPurpose, folder?: unknown) => {
    if (purpose === "project-image") {
        return "project_images";
    }

    if (purpose === "project-file") {
        return "project_files";
    }

    if (typeof folder !== "string" || !folder.trim()) {
        throw new Error("Upload folder is required");
    }

    return folder;
};

const validateUploadRequest = (input: {
    purpose: DirectUploadPurpose;
    fileName: unknown;
    contentType: unknown;
    size: unknown;
    folder?: unknown;
}) => {
    const fileName = typeof input.fileName === "string" ? input.fileName.trim() : "";
    const contentType = typeof input.contentType === "string" ? input.contentType.trim() : "";
    const size = typeof input.size === "number" ? input.size : Number(input.size);

    if (!fileName) {
        throw new Error("File name is required");
    }

    if (!Number.isFinite(size) || size <= 0) {
        throw new Error("Invalid file size");
    }

    if (input.purpose === "project-image") {
        if (!contentType.startsWith("image/")) {
            throw new Error("Only image files are allowed for image uploads");
        }

        if (size > MAX_IMAGE_SIZE) {
            throw new Error("Image size must be less than 25MB");
        }
    } else if (size > MAX_FILE_SIZE) {
        if (input.purpose === "media") {
            throw new Error("Ukuran file maksimal 250MB");
        }

        throw new Error("File size must be less than 250MB");
    }

    return {
        fileName,
        contentType,
        size,
        folder: getPurposeFolder(input.purpose, input.folder),
    };
};

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const purpose = body?.purpose as DirectUploadPurpose;

        if (purpose !== "media" && purpose !== "project-image" && purpose !== "project-file") {
            return NextResponse.json({ success: false, error: "Invalid upload purpose" }, { status: 400 });
        }

        if (purpose === "media" && !isAdminRole(session.user.role)) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const validated = validateUploadRequest({
            purpose,
            fileName: body?.fileName,
            contentType: body?.contentType,
            size: body?.size,
            folder: body?.folder,
        });

        if (!isR2Configured()) {
            return NextResponse.json({
                success: true,
                provider: "local",
                missingConfig: getR2MissingConfig(),
            });
        }

        const presignedUpload = await createPresignedR2Upload({
            folder: validated.folder,
            originalName: validated.fileName,
            contentType: validated.contentType,
        });

        return NextResponse.json({
            success: true,
            ...presignedUpload,
            purpose,
        });
    } catch (error) {
        console.error("Direct upload presign error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to prepare upload" },
            { status: 500 },
        );
    }
}
