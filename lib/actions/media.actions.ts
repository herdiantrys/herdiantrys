"use server";

import { MediaAssetKind } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { i18n } from "@/i18n-config";
import {
    listMediaAssets,
    removeMediaAssetFile,
} from "@/lib/media-library";
import prisma from "@/lib/prisma";
import { uploadLocalFile } from "@/lib/upload";

type MediaAssetFilters = {
    query?: string;
    kinds?: MediaAssetKind[];
};

const MAX_MEDIA_ASSET_SIZE = 250 * 1024 * 1024;

const isAdminRole = (role?: string | null) => role === "ADMIN" || role === "SUPER_ADMIN";

const sanitizeText = (value: unknown) => {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const revalidateMediaPaths = () => {
    revalidatePath("/admin/files");
    for (const locale of i18n.locales) {
        revalidatePath(`/${locale}/admin/files`);
    }
};

const requireAdminSession = async () => {
    const session = await auth();

    if (!session?.user?.id || !isAdminRole(session.user.role)) {
        throw new Error("Unauthorized");
    }

    return session;
};

export async function getMediaAssetsAction(filters: MediaAssetFilters = {}) {
    try {
        await requireAdminSession();

        const assets = await listMediaAssets();
        const normalizedQuery = filters.query?.trim().toLowerCase() || "";
        const kinds = filters.kinds?.length ? new Set(filters.kinds) : null;

        const filteredAssets = assets.filter((asset) => {
            if (kinds && !kinds.has(asset.kind)) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            return [
                asset.filename,
                asset.originalName,
                asset.folder,
                asset.title || "",
                asset.altText || "",
                asset.url,
            ].some((value) => value.toLowerCase().includes(normalizedQuery));
        });

        return { success: true, data: filteredAssets };
    } catch (error) {
        console.error("Failed to fetch media assets:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to fetch media assets" };
    }
}

export async function uploadMediaAssetAction(formData: FormData) {
    try {
        const session = await requireAdminSession();
        const file = formData.get("file");
        const folder = formData.get("folder");

        if (!(file instanceof File)) {
            return { success: false, error: "No file uploaded" };
        }

        if (file.size > MAX_MEDIA_ASSET_SIZE) {
            return { success: false, error: "Ukuran file maksimal 250MB" };
        }

        if (typeof folder !== "string" || !folder.trim()) {
            return { success: false, error: "Upload folder is required" };
        }

        const url = await uploadLocalFile(file, folder, { uploadedById: session.user.id });
        const asset = await prisma.mediaAsset.findUnique({ where: { url } });

        if (!asset) {
            return { success: false, error: "Failed to register uploaded file" };
        }

        revalidateMediaPaths();
        return {
            success: true,
            data: {
                ...asset,
                createdAt: asset.createdAt.toISOString(),
                updatedAt: asset.updatedAt.toISOString(),
            },
        };
    } catch (error) {
        console.error("Failed to upload media asset:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to upload media asset" };
    }
}

export async function updateMediaAssetAction(id: string, data: { title?: string | null; altText?: string | null }) {
    try {
        await requireAdminSession();

        const asset = await prisma.mediaAsset.update({
            where: { id },
            data: {
                title: sanitizeText(data.title),
                altText: sanitizeText(data.altText),
            },
        });

        revalidateMediaPaths();
        return {
            success: true,
            data: {
                ...asset,
                createdAt: asset.createdAt.toISOString(),
                updatedAt: asset.updatedAt.toISOString(),
            },
        };
    } catch (error) {
        console.error("Failed to update media asset:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update media asset" };
    }
}

export async function deleteMediaAssetAction(id: string) {
    try {
        await requireAdminSession();

        const asset = await prisma.mediaAsset.findUnique({
            where: { id },
        });

        if (!asset) {
            return { success: false, error: "Media asset not found" };
        }

        await removeMediaAssetFile(asset.url);
        await prisma.mediaAsset.delete({
            where: { id },
        });

        revalidateMediaPaths();
        return { success: true };
    } catch (error) {
        console.error("Failed to delete media asset:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete media asset" };
    }
}
