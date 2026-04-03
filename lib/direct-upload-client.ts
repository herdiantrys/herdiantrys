"use client";

import type { DirectUploadPurpose } from "@/lib/r2-storage";

type DirectUploadPrepareResult =
    | {
        success: true;
        provider: "local";
        missingConfig?: string[];
    }
    | {
        success: true;
        provider: "r2";
        uploadUrl: string;
        publicUrl: string;
        objectKey: string;
        folder: string;
        filename: string;
        contentType: string;
    }
    | {
        success: false;
        error: string;
    };

type DirectUploadCompleteResult<TData = unknown> =
    | {
        success: true;
        provider: "r2";
        url: string;
        assetId?: string;
        data?: TData;
    }
    | {
        success: false;
        error: string;
    };

const parseJson = async <T>(response: Response): Promise<T | null> => {
    try {
        return (await response.json()) as T;
    } catch {
        return null;
    }
};

export const prepareDirectUpload = async (input: {
    purpose: DirectUploadPurpose;
    file: File;
    folder?: string;
}): Promise<DirectUploadPrepareResult> => {
    try {
        const response = await fetch("/api/uploads/direct/presign", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                purpose: input.purpose,
                fileName: input.file.name,
                contentType: input.file.type,
                size: input.file.size,
                folder: input.folder,
            }),
        });

        const payload = await parseJson<DirectUploadPrepareResult & { error?: string }>(response);

        if (!response.ok || !payload) {
            return {
                success: false,
                error: payload?.error || `Failed to prepare direct upload (${response.status})`,
            };
        }

        return payload;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to prepare direct upload",
        };
    }
};

export const uploadFileToPresignedUrl = async (input: {
    file: File;
    uploadUrl: string;
    contentType: string;
    timeoutMs?: number;
    onProgress?: (loaded: number, total: number | null) => void;
}) => {
    const timeoutMs = input.timeoutMs ?? 30 * 60 * 1000;

    return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("PUT", input.uploadUrl);
        xhr.timeout = timeoutMs;
        xhr.setRequestHeader("Content-Type", input.contentType || "application/octet-stream");

        xhr.upload.addEventListener("progress", (event) => {
            input.onProgress?.(event.loaded, event.lengthComputable ? event.total : input.file.size || null);
        });

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
                return;
            }

            if (xhr.status === 403) {
                reject(new Error("Upload langsung ke R2 ditolak. Periksa presigned URL dan izin bucket."));
                return;
            }

            reject(new Error(`Upload langsung ke R2 gagal dengan status ${xhr.status}.`));
        });

        xhr.addEventListener("error", () => {
            reject(new Error("Upload langsung ke R2 gagal. Pastikan bucket R2 mengizinkan CORS untuk origin aplikasi ini."));
        });

        xhr.addEventListener("abort", () => {
            reject(new Error("Upload dibatalkan sebelum selesai"));
        });

        xhr.addEventListener("timeout", () => {
            reject(new Error("Upload file ke R2 terlalu lama dan terkena timeout. Cek koneksi lalu coba lagi."));
        });

        xhr.send(input.file);
    });
};

export const completeDirectUpload = async <TData = unknown>(input: {
    purpose: DirectUploadPurpose;
    file: File;
    objectKey: string;
}): Promise<DirectUploadCompleteResult<TData>> => {
    try {
        const response = await fetch("/api/uploads/direct/complete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                purpose: input.purpose,
                objectKey: input.objectKey,
                originalName: input.file.name,
                contentType: input.file.type,
                size: input.file.size,
            }),
        });

        const payload = await parseJson<DirectUploadCompleteResult<TData> & { error?: string }>(response);

        if (!response.ok || !payload) {
            return {
                success: false,
                error: payload?.error || `Failed to finalize direct upload (${response.status})`,
            };
        }

        return payload;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to finalize direct upload",
        };
    }
};
