"use client";

export type ProjectAssetUploadType = "image" | "file";

export type ProjectAssetUploadResult = {
    success: boolean;
    url?: string;
    assetId?: string;
    error?: string;
};

export type ProjectUploadProgressStage = "starting" | "uploading" | "processing" | "done";

export type ProjectUploadProgress = {
    stage: ProjectUploadProgressStage;
    progress: number;
    loaded: number;
    total: number | null;
};

type UploadProjectAssetOptions = {
    file: Blob | File;
    type: ProjectAssetUploadType;
    fileName?: string;
    onProgress?: (progress: ProjectUploadProgress) => void;
};

const toFile = (file: Blob | File, fileName: string, fallbackType: ProjectAssetUploadType) => {
    if (file instanceof File) {
        return file;
    }

    const extension = fallbackType === "image" ? "jpg" : "bin";

    return new File([file], fileName || `project-asset.${extension}`, {
        type: file.type || (fallbackType === "image" ? "image/jpeg" : "application/octet-stream"),
    });
};

const parseResponse = (xhr: XMLHttpRequest): ProjectAssetUploadResult => {
    if (xhr.response && typeof xhr.response === "object") {
        return xhr.response as ProjectAssetUploadResult;
    }

    if (!xhr.responseText) {
        return { success: false, error: "Empty upload response" };
    }

    try {
        return JSON.parse(xhr.responseText) as ProjectAssetUploadResult;
    } catch {
        return { success: false, error: "Invalid upload response" };
    }
};

export const uploadProjectAssetWithProgress = async ({
    file,
    type,
    fileName,
    onProgress,
}: UploadProjectAssetOptions): Promise<ProjectAssetUploadResult> => {
    const fileToUpload = toFile(file, fileName || "project-asset", type);

    return new Promise<ProjectAssetUploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        formData.append("file", fileToUpload);
        formData.append("type", type);

        onProgress?.({
            stage: "starting",
            progress: 0,
            loaded: 0,
            total: fileToUpload.size || null,
        });

        xhr.open("POST", "/api/uploads/project");
        xhr.responseType = "json";

        xhr.upload.addEventListener("progress", (event) => {
            if (!event.lengthComputable || event.total <= 0) {
                onProgress?.({
                    stage: "uploading",
                    progress: 0,
                    loaded: event.loaded,
                    total: fileToUpload.size || null,
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
                loaded: fileToUpload.size,
                total: fileToUpload.size,
            });
        });

        xhr.addEventListener("load", () => {
            const payload = parseResponse(xhr);

            if (xhr.status >= 200 && xhr.status < 300 && payload.success) {
                onProgress?.({
                    stage: "done",
                    progress: 100,
                    loaded: fileToUpload.size,
                    total: fileToUpload.size,
                });
                resolve(payload);
                return;
            }

            reject(new Error(payload.error || "Upload failed"));
        });

        xhr.addEventListener("error", () => {
            reject(new Error("Network error while uploading project asset"));
        });

        xhr.addEventListener("timeout", () => {
            reject(new Error("Project asset upload timed out"));
        });

        xhr.send(formData);
    });
};
