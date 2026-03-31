import fs from "fs/promises";
import path from "path";

import { MediaAssetKind, Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif", ".bmp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"]);
const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".aac", ".m4a", ".flac"]);

const MIME_BY_EXTENSION: Record<string, string> = {
    ".aac": "audio/aac",
    ".avif": "image/avif",
    ".avi": "video/x-msvideo",
    ".bmp": "image/bmp",
    ".flac": "audio/flac",
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".json": "application/json",
    ".m4a": "audio/mp4",
    ".m4v": "video/mp4",
    ".mkv": "video/x-matroska",
    ".mov": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".ogg": "audio/ogg",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain",
    ".wav": "audio/wav",
    ".webm": "video/webm",
    ".webp": "image/webp",
    ".zip": "application/zip",
};

export type RegisteredMediaAssetInput = {
    url: string;
    folder: string;
    fileName: string;
    originalName: string;
    mimeType?: string | null;
    size: number;
    uploadedById?: string | null;
};

export type SerializableMediaAsset = {
    id: string;
    url: string;
    folder: string;
    filename: string;
    originalName: string;
    mimeType: string;
    kind: MediaAssetKind;
    size: number;
    title: string | null;
    altText: string | null;
    uploadedById: string | null;
    createdAt: string;
    updatedAt: string;
};

const normalizeUploadUrl = (value: string) => {
    const normalized = value.replace(/\\/g, "/").trim();
    if (!normalized.startsWith("/uploads/")) {
        throw new Error("Only /uploads URLs can be registered in the media library.");
    }

    return normalized.replace(/\/{2,}/g, "/");
};

const normalizeUploadFolder = (folder: string) => {
    const normalized = folder.replace(/\\/g, "/").trim().replace(/^\/+|\/+$/g, "");

    if (!normalized) {
        throw new Error("Upload folder is required.");
    }

    if (normalized.includes("..")) {
        throw new Error("Invalid upload folder.");
    }

    if (!/^[a-zA-Z0-9/_-]+$/.test(normalized)) {
        throw new Error("Upload folder contains invalid characters.");
    }

    return normalized;
};

const ensureUploadRoot = async () => {
    await fs.mkdir(UPLOADS_ROOT, { recursive: true });
};

const getExtension = (fileName: string) => path.extname(fileName).toLowerCase();

export const inferMediaKind = (fileName: string, mimeType?: string | null): MediaAssetKind => {
    const normalizedMimeType = mimeType?.toLowerCase() || "";
    const extension = getExtension(fileName);

    if (normalizedMimeType.startsWith("image/") || IMAGE_EXTENSIONS.has(extension)) {
        return MediaAssetKind.IMAGE;
    }

    if (normalizedMimeType.startsWith("video/") || VIDEO_EXTENSIONS.has(extension)) {
        return MediaAssetKind.VIDEO;
    }

    if (normalizedMimeType.startsWith("audio/") || AUDIO_EXTENSIONS.has(extension)) {
        return MediaAssetKind.AUDIO;
    }

    return MediaAssetKind.FILE;
};

export const inferMimeType = (fileName: string, mimeType?: string | null) => {
    if (mimeType?.trim()) {
        return mimeType.trim();
    }

    return MIME_BY_EXTENSION[getExtension(fileName)] || "application/octet-stream";
};

export const getAbsolutePathFromUploadUrl = (url: string) => {
    const normalizedUrl = normalizeUploadUrl(url);
    const relativePath = normalizedUrl.slice("/uploads/".length);
    return path.join(UPLOADS_ROOT, relativePath);
};

const toSerializableMediaAsset = (asset: {
    id: string;
    url: string;
    folder: string;
    filename: string;
    originalName: string;
    mimeType: string;
    kind: MediaAssetKind;
    size: number;
    title: string | null;
    altText: string | null;
    uploadedById: string | null;
    createdAt: Date;
    updatedAt: Date;
}): SerializableMediaAsset => ({
    ...asset,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
});

export async function registerUploadedMediaAsset(input: RegisteredMediaAssetInput) {
    const folder = normalizeUploadFolder(input.folder);
    const url = normalizeUploadUrl(input.url);
    const fileName = path.basename(input.fileName);
    const originalName = path.basename(input.originalName || input.fileName);
    const mimeType = inferMimeType(fileName, input.mimeType);
    const kind = inferMediaKind(fileName, mimeType);

    const updateData: Prisma.MediaAssetUpdateInput = {
        folder,
        filename: fileName,
        originalName,
        mimeType,
        kind,
        size: input.size,
    };

    if (input.uploadedById) {
        updateData.uploadedBy = { connect: { id: input.uploadedById } };
    }

    const asset = await prisma.mediaAsset.upsert({
        where: { url },
        update: updateData,
        create: {
            url,
            folder,
            filename: fileName,
            originalName,
            mimeType,
            kind,
            size: input.size,
            uploadedById: input.uploadedById || null,
        },
    });

    return asset;
}

const walkUploadFiles = async (currentDirectory: string): Promise<string[]> => {
    const entries = await fs.readdir(currentDirectory, { withFileTypes: true });
    const paths = await Promise.all(
        entries.map(async (entry) => {
            const absolutePath = path.join(currentDirectory, entry.name);
            if (entry.isDirectory()) {
                return walkUploadFiles(absolutePath);
            }

            if (entry.isFile()) {
                return [absolutePath];
            }

            return [];
        }),
    );

    return paths.flat();
};

export async function syncMediaLibraryWithUploads() {
    await ensureUploadRoot();

    const [absolutePaths, existingAssets] = await Promise.all([
        walkUploadFiles(UPLOADS_ROOT),
        prisma.mediaAsset.findMany({
            select: { id: true, url: true },
        }),
    ]);
    const seenUrls = new Set<string>();

    for (const absolutePath of absolutePaths) {
        const relativePath = path.relative(UPLOADS_ROOT, absolutePath).replace(/\\/g, "/");
        const url = `/uploads/${relativePath}`;
        const folder = path.dirname(relativePath).replace(/\\/g, "/") || ".";
        const stats = await fs.stat(absolutePath);
        const fileName = path.basename(absolutePath);

        seenUrls.add(url);

        await registerUploadedMediaAsset({
            url,
            folder: folder === "." ? "uploads" : folder,
            fileName,
            originalName: fileName,
            size: stats.size,
        });
    }

    const staleUrls = existingAssets
        .map((asset) => asset.url)
        .filter((url) => !seenUrls.has(url));

    if (staleUrls.length > 0) {
        await prisma.mediaAsset.deleteMany({
            where: {
                url: {
                    in: staleUrls,
                },
            },
        });
    }
}

export async function listMediaAssets() {
    await syncMediaLibraryWithUploads();

    const assets = await prisma.mediaAsset.findMany({
        orderBy: { createdAt: "desc" },
    });

    return assets.map(toSerializableMediaAsset);
}

export async function removeMediaAssetFile(url: string) {
    const absolutePath = getAbsolutePathFromUploadUrl(url);

    try {
        await fs.unlink(absolutePath);
    } catch (error) {
        const code = error instanceof Error && "code" in error ? (error as NodeJS.ErrnoException).code : null;
        if (code !== "ENOENT") {
            throw error;
        }
    }
}
