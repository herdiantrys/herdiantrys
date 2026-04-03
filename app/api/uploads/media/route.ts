import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { i18n } from "@/i18n-config";
import prisma from "@/lib/prisma";
import { uploadLocalFile } from "@/lib/upload";

export const runtime = "nodejs";

const MAX_MEDIA_ASSET_SIZE = 250 * 1024 * 1024;

const isAdminRole = (role?: string | null) => role === "ADMIN" || role === "SUPER_ADMIN";

const revalidateMediaPaths = () => {
    revalidatePath("/admin/files");
    for (const locale of i18n.locales) {
        revalidatePath(`/${locale}/admin/files`);
    }
};

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id || !isAdminRole(session.user.role)) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const folder = formData.get("folder");

        if (!(file instanceof File)) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        if (file.size > MAX_MEDIA_ASSET_SIZE) {
            return NextResponse.json({ success: false, error: "Ukuran file maksimal 250MB" }, { status: 400 });
        }

        if (typeof folder !== "string" || !folder.trim()) {
            return NextResponse.json({ success: false, error: "Upload folder is required" }, { status: 400 });
        }

        const url = await uploadLocalFile(file, folder, { uploadedById: session.user.id });
        const asset = await prisma.mediaAsset.findUnique({ where: { url } });

        if (!asset) {
            return NextResponse.json({ success: false, error: "Failed to register uploaded file" }, { status: 500 });
        }

        revalidateMediaPaths();

        return NextResponse.json({
            success: true,
            data: {
                ...asset,
                createdAt: asset.createdAt.toISOString(),
                updatedAt: asset.updatedAt.toISOString(),
            },
        });
    } catch (error) {
        console.error("Media upload route error:", error);
        return NextResponse.json({ success: false, error: "Failed to upload media asset" }, { status: 500 });
    }
}
