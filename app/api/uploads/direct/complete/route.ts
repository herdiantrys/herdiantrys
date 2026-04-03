import path from "path";

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { i18n } from "@/i18n-config";
import { registerUploadedMediaAsset } from "@/lib/media-library";
import {
    buildR2PublicUrl,
    headR2Object,
    isR2Configured,
    type DirectUploadPurpose,
} from "@/lib/r2-storage";

export const runtime = "nodejs";

const isAdminRole = (role?: string | null) => role === "ADMIN" || role === "SUPER_ADMIN";

const revalidateMediaPaths = () => {
    revalidatePath("/admin/files");
    for (const locale of i18n.locales) {
        revalidatePath(`/${locale}/admin/files`);
    }
};

const serializeMediaAsset = (asset: {
    id: string;
    url: string;
    folder: string;
    filename: string;
    originalName: string;
    mimeType: string;
    kind: string;
    size: number;
    title: string | null;
    altText: string | null;
    uploadedById: string | null;
    createdAt: Date;
    updatedAt: Date;
}) => ({
    ...asset,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
});

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const purpose = body?.purpose as DirectUploadPurpose;
        const objectKey = typeof body?.objectKey === "string" ? body.objectKey.trim() : "";
        const originalName = typeof body?.originalName === "string" ? body.originalName.trim() : "";
        const contentType = typeof body?.contentType === "string" ? body.contentType.trim() : undefined;
        const size = typeof body?.size === "number" ? body.size : Number(body?.size);

        if (purpose !== "media" && purpose !== "project-image" && purpose !== "project-file") {
            return NextResponse.json({ success: false, error: "Invalid upload purpose" }, { status: 400 });
        }

        if (purpose === "media" && !isAdminRole(session.user.role)) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (!objectKey) {
            return NextResponse.json({ success: false, error: "Object key is required" }, { status: 400 });
        }

        if (!originalName) {
            return NextResponse.json({ success: false, error: "Original file name is required" }, { status: 400 });
        }

        if (!Number.isFinite(size) || size <= 0) {
            return NextResponse.json({ success: false, error: "Invalid file size" }, { status: 400 });
        }

        if (!isR2Configured()) {
            return NextResponse.json(
                { success: false, error: "R2 direct upload is not configured on this server" },
                { status: 503 },
            );
        }

        const objectHead = await headR2Object(objectKey);
        const objectSize = Number(objectHead.ContentLength || 0);

        if (objectSize <= 0) {
            return NextResponse.json({ success: false, error: "Uploaded object was not found" }, { status: 404 });
        }

        if (objectSize !== size) {
            return NextResponse.json(
                { success: false, error: "Uploaded file size does not match the expected size" },
                { status: 400 },
            );
        }

        const fileName = path.posix.basename(objectKey);
        const folder = path.posix.dirname(objectKey);
        const asset = await registerUploadedMediaAsset({
            url: buildR2PublicUrl(objectKey),
            folder,
            fileName,
            originalName,
            mimeType: contentType,
            size,
            uploadedById: session.user.id,
        });

        revalidateMediaPaths();

        return NextResponse.json({
            success: true,
            provider: "r2",
            url: asset.url,
            assetId: asset.url,
            data: serializeMediaAsset(asset),
        });
    } catch (error) {
        console.error("Direct upload complete error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to finalize upload" },
            { status: 500 },
        );
    }
}
