"use client";

import {
    completeDirectUpload,
    prepareDirectUpload,
    uploadFileToPresignedUrl,
} from "@/lib/direct-upload-client";

export type MediaAssetKindValue = "IMAGE" | "VIDEO" | "AUDIO" | "FILE";

export type MediaAssetUploadRecord = {
    id: string;
    url: string;
    folder: string;
    filename: string;
    originalName: string;
    mimeType: string;
    kind: MediaAssetKindValue;
    size: number;
    title: string | null;
    altText: string | null;
    uploadedById: string | null;
    createdAt: string;
    updatedAt: string;
};

export type MediaAssetUploadResult = {
    success: boolean;
    data?: MediaAssetUploadRecord;
    error?: string;
};

export type MediaUploadProgressStage = "starting" | "uploading" | "processing" | "done";

export type MediaUploadProgress = {
    stage: MediaUploadProgressStage;
    progress: number;
    loaded: number;
    total: number | null;
};

type UploadMediaAssetOptions = {
    file: File;
    folder: string;
    onProgress?: (progress: MediaUploadProgress) => void;
};

const parseResponse = (xhr: XMLHttpRequest): MediaAssetUploadResult => {
    if (xhr.response && typeof xhr.response === "object") {
        return xhr.response as MediaAssetUploadResult;
    }

    if (!xhr.responseText) {
        return { success: false, error: "Empty upload response" };
    }

    try {
        return JSON.parse(xhr.responseText) as MediaAssetUploadResult;
    } catch {
        return { success: false, error: "Invalid upload response" };
    }
};

const getUploadErrorMessage = (xhr: XMLHttpRequest, payload: MediaAssetUploadResult) => {
    if (xhr.status === 413) {
        return "Upload ditolak server karena batas ukuran request di proxy/server terlalu kecil. Jika memakai Nginx, set client_max_body_size minimal 250M.";
    }

    if (xhr.status === 401) {
        return payload.error || "Sesi login habis atau akun tidak punya akses upload.";
    }

    if (xhr.status === 408 || xhr.status === 504) {
        return "Upload melewati batas waktu server. Cek timeout reverse proxy lalu coba lagi.";
    }

    if (xhr.status >= 500) {
        return payload.error || "Server gagal memproses upload file.";
    }

    if (xhr.status === 0) {
        return "Koneksi upload terputus sebelum selesai.";
    }

    return payload.error || `Upload failed with status ${xhr.status}`;
};

const uploadViaOriginWithProgress = async ({
    file,
    folder,
    onProgress,
}: UploadMediaAssetOptions): Promise<MediaAssetUploadResult> => {
    return new Promise<MediaAssetUploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        formData.append("file", file);
        formData.append("folder", folder);

        onProgress?.({
            stage: "starting",
            progress: 0,
            loaded: 0,
            total: file.size || null,
        });

        xhr.open("POST", "/api/uploads/media");
        xhr.responseType = "json";
        xhr.timeout = 30 * 60 * 1000;

        xhr.upload.addEventListener("progress", (event) => {
            if (!event.lengthComputable || event.total <= 0) {
                onProgress?.({
                    stage: "uploading",
                    progress: 0,
                    loaded: event.loaded,
                    total: file.size || null,
                });
                return;
            }

            const uploadRatio = event.loaded / event.total;
            const progress = Math.min(95, Math.round(uploadRatio * 95));

            onProgress?.({
                stage: "uploading",
                progress,
                loaded: event.loaded,
                total: event.total,
            });
        });

        xhr.upload.addEventListener("load", () => {
            onProgress?.({
                stage: "processing",
                progress: 98,
                loaded: file.size,
                total: file.size,
            });
        });

        xhr.addEventListener("load", () => {
            const payload = parseResponse(xhr);

            if (xhr.status >= 200 && xhr.status < 300 && payload.success) {
                onProgress?.({
                    stage: "done",
                    progress: 100,
                    loaded: file.size,
                    total: file.size,
                });
                resolve(payload);
                return;
            }

            reject(new Error(getUploadErrorMessage(xhr, payload)));
        });

        xhr.addEventListener("error", () => {
            reject(new Error("Network error while uploading media asset"));
        });

        xhr.addEventListener("abort", () => {
            reject(new Error("Upload dibatalkan sebelum selesai"));
        });

        xhr.addEventListener("timeout", () => {
            reject(new Error("Upload file terlalu lama dan terkena timeout. Cek timeout server/proxy lalu coba lagi."));
        });

        xhr.send(formData);
    });
};

export const uploadMediaAssetWithProgress = async ({
    file,
    folder,
    onProgress,
}: UploadMediaAssetOptions): Promise<MediaAssetUploadResult> => {
    const preparedUpload = await prepareDirectUpload({
        purpose: "media",
        file,
        folder,
    });

    if (!preparedUpload.success) {
        throw new Error(preparedUpload.error);
    }

    if (preparedUpload.provider === "local") {
        return uploadViaOriginWithProgress({ file, folder, onProgress });
    }

    onProgress?.({
        stage: "starting",
        progress: 0,
        loaded: 0,
        total: file.size || null,
    });

    await uploadFileToPresignedUrl({
        file,
        uploadUrl: preparedUpload.uploadUrl,
        contentType: preparedUpload.contentType,
        timeoutMs: 30 * 60 * 1000,
        onProgress: (loaded, total) => {
            const resolvedTotal = total && total > 0 ? total : file.size || null;
            const progress = resolvedTotal && resolvedTotal > 0
                ? Math.min(95, Math.round((loaded / resolvedTotal) * 95))
                : 0;

            onProgress?.({
                stage: "uploading",
                progress,
                loaded,
                total: resolvedTotal,
            });
        },
    });

    onProgress?.({
        stage: "processing",
        progress: 98,
        loaded: file.size,
        total: file.size,
    });

    const completedUpload = await completeDirectUpload<MediaAssetUploadRecord>({
        purpose: "media",
        file,
        objectKey: preparedUpload.objectKey,
    });

    if (!completedUpload.success) {
        throw new Error(completedUpload.error);
    }

    onProgress?.({
        stage: "done",
        progress: 100,
        loaded: file.size,
        total: file.size,
    });

    return {
        success: true,
        data: completedUpload.data,
    };
};
