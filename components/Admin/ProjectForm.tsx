"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    AlertCircle,
    CheckCircle2,
    Folder,
    Image as ImageIcon,
    Link as LinkIcon,
    Loader2,
    Save,
    Star,
    Tag,
    Upload,
    User as UserIcon,
    Video,
    X,
} from "lucide-react";
import ImageCropper, {
    type ImageCropperAspectOption,
    type ImageCropperAspectSelection,
} from "@/components/ImageCropper";
import { createProject, getAuthors, getCategories, updateProject } from "@/lib/actions/project.actions";
import { resolveAssetUrl } from "@/lib/media";
import {
    uploadProjectAssetWithProgress,
    type ProjectUploadProgress,
} from "@/lib/project-upload-client";
import { MediaLibraryModal, type MediaAssetRecord } from "@/components/Admin/MediaLibrary";

interface ProjectFormProps {
    initialData?: ProjectFormInitialData;
    isNew?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
}

type GalleryItem = {
    type: "image" | "video";
    url: string;
};

type ProjectFormData = {
    title: string;
    slug: string;
    description: string;
    content: string;
    type: "IMAGE" | "VIDEO";
    image: string;
    videoFile: string;
    demoUrl: string;
    repoUrl: string;
    tags: string;
    categoryId: string;
    authorId: string;
    favorite: boolean;
    status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
    gallery: GalleryItem[];
};

type ProjectFormInitialData = {
    id?: string;
    title?: unknown;
    slug?: unknown;
    description?: unknown;
    content?: unknown;
    type?: unknown;
    image?: unknown;
    videoFile?: unknown;
    demoUrl?: unknown;
    repoUrl?: unknown;
    tags?: unknown;
    categoryId?: unknown;
    authorId?: unknown;
    favorite?: unknown;
    status?: unknown;
    gallery?: unknown;
    category?: unknown;
} | null;

type UploadFeedbackStatus = "queued" | "uploading" | "processing" | "success" | "error";

type UploadFeedback = {
    id: string;
    fileName: string;
    size: number;
    progress: number;
    status: UploadFeedbackStatus;
    message: string;
    mediaType: "image" | "video";
};

type UploadProgressMessages = {
    starting: string;
    uploading: string;
    processing: string;
    done: string;
};

const MAX_PROJECT_IMAGE_SIZE = 25 * 1024 * 1024;
const MAX_PROJECT_FILE_SIZE = 250 * 1024 * 1024;

const COVER_ASPECT_OPTIONS: ImageCropperAspectOption[] = [
    { value: "21:9", label: "21:9", width: 21, height: 9, description: "Ultra wide hero" },
    { value: "16:9", label: "16:9", width: 16, height: 9, description: "Landscape default" },
    { value: "4:3", label: "4:3", width: 4, height: 3, description: "Presentation" },
    { value: "3:2", label: "3:2", width: 3, height: 2, description: "Photo showcase" },
    { value: "1:1", label: "1:1", width: 1, height: 1, description: "Square grid" },
    { value: "4:5", label: "4:5", width: 4, height: 5, description: "Tall card" },
    { value: "3:4", label: "3:4", width: 3, height: 4, description: "Poster portrait" },
    { value: "9:16", label: "9:16", width: 9, height: 16, description: "Story portrait" },
    { value: "3:1", label: "3:1", width: 3, height: 1, description: "Wide banner" },
];

const DEFAULT_COVER_ASPECT = COVER_ASPECT_OPTIONS[1];

const createUploadId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const sanitizeFileName = (fileName?: string | null) => {
    if (!fileName) return "project-cover";

    return fileName
        .replace(/\.[^.]+$/, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "project-cover";
};

const revokeBlobUrl = (value?: string | null) => {
    if (value?.startsWith("blob:")) {
        URL.revokeObjectURL(value);
    }
};

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = ["KB", "MB", "GB"];
    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const readString = (value: unknown) => (typeof value === "string" ? value : "");

const readBoolean = (value: unknown) => (typeof value === "boolean" ? value : false);

const readProjectType = (value: unknown): ProjectFormData["type"] =>
    value === "VIDEO" ? "VIDEO" : "IMAGE";

const readProjectStatus = (value: unknown): ProjectFormData["status"] => {
    if (value === "DRAFT" || value === "ARCHIVED" || value === "PUBLISHED") {
        return value;
    }

    return "PUBLISHED";
};

const isGalleryItem = (value: unknown): value is GalleryItem =>
    isRecord(value)
    && (value.type === "image" || value.type === "video")
    && typeof value.url === "string";

const readGallery = (value: unknown): GalleryItem[] =>
    Array.isArray(value) ? value.filter(isGalleryItem) : [];

const createUploadFeedback = (file: File, mediaType: UploadFeedback["mediaType"], message: string): UploadFeedback => ({
    id: createUploadId(),
    fileName: file.name,
    size: file.size,
    progress: 0,
    status: "queued",
    message,
    mediaType,
});

const isUploadBusy = (upload?: UploadFeedback | null) =>
    upload ? ["queued", "uploading", "processing"].includes(upload.status) : false;

const mapUploadProgressToFeedback = (
    progress: ProjectUploadProgress,
    messages: UploadProgressMessages,
): Pick<UploadFeedback, "status" | "progress" | "message"> => {
    switch (progress.stage) {
        case "starting":
            return { status: "queued", progress: 0, message: messages.starting };
        case "uploading":
            return { status: "uploading", progress: progress.progress, message: messages.uploading };
        case "processing":
            return { status: "processing", progress: Math.max(progress.progress, 98), message: messages.processing };
        case "done":
            return { status: "success", progress: 100, message: messages.done };
        default:
            return { status: "queued", progress: 0, message: messages.starting };
    }
};

const getImageValidationError = (file: File) => {
    if (!file.type.startsWith("image/")) {
        return "File harus berupa gambar.";
    }

    if (file.size > MAX_PROJECT_IMAGE_SIZE) {
        return "Ukuran gambar maksimal 25MB.";
    }

    return null;
};

const getVideoValidationError = (file: File) => {
    if (!file.type.startsWith("video/")) {
        return "File harus berupa video.";
    }

    if (file.size > MAX_PROJECT_FILE_SIZE) {
        return "Ukuran video maksimal 250MB.";
    }

    return null;
};

const getUploadStatusLabel = (status: UploadFeedbackStatus) => {
    switch (status) {
        case "queued":
            return "Queued";
        case "uploading":
            return "Uploading";
        case "processing":
            return "Finalizing";
        case "success":
            return "Done";
        case "error":
            return "Failed";
        default:
            return "Queued";
    }
};

const getUploadStyles = (status: UploadFeedbackStatus) => {
    switch (status) {
        case "uploading":
            return {
                card: "border-cyan-200 bg-cyan-50/80 dark:border-cyan-500/20 dark:bg-cyan-500/10",
                icon: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
                badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-200",
                bar: "bg-cyan-500",
                text: "text-cyan-700 dark:text-cyan-200",
            };
        case "processing":
            return {
                card: "border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10",
                icon: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
                badge: "bg-amber-500/10 text-amber-700 dark:text-amber-200",
                bar: "bg-amber-500",
                text: "text-amber-700 dark:text-amber-200",
            };
        case "success":
            return {
                card: "border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10",
                icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
                badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
                bar: "bg-emerald-500",
                text: "text-emerald-700 dark:text-emerald-200",
            };
        case "error":
            return {
                card: "border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10",
                icon: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
                badge: "bg-rose-500/10 text-rose-700 dark:text-rose-200",
                bar: "bg-rose-500",
                text: "text-rose-700 dark:text-rose-200",
            };
        default:
            return {
                card: "border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-white/5",
                icon: "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-200",
                badge: "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200",
                bar: "bg-slate-500",
                text: "text-slate-700 dark:text-slate-200",
            };
    }
};

function UploadFeedbackCard({
    upload,
    onDismiss,
}: {
    upload: UploadFeedback;
    onDismiss?: () => void;
}) {
    const styles = getUploadStyles(upload.status);
    const statusLabel = getUploadStatusLabel(upload.status);
    const isBusy = isUploadBusy(upload);
    const progressLabel = upload.status === "error" ? "Needs retry" : `${upload.progress}%`;

    return (
        <div className={`rounded-2xl border px-4 py-4 ${styles.card}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                    <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}>
                        {upload.mediaType === "video" ? <Video size={18} /> : <ImageIcon size={18} />}
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{upload.fileName}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] ${styles.badge}`}>
                                {statusLabel}
                            </span>
                        </div>
                        <p className={`mt-1 text-xs ${styles.text}`}>{upload.message}</p>
                        <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{formatFileSize(upload.size)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {upload.status === "success" ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : upload.status === "error" ? (
                        <AlertCircle size={18} className="text-rose-500" />
                    ) : (
                        <Loader2 size={18} className={`animate-spin ${styles.text}`} />
                    )}

                    {onDismiss && !isBusy && (
                        <button
                            type="button"
                            onClick={onDismiss}
                            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    <span>{upload.status === "processing" ? "Processing on server" : "Upload progress"}</span>
                    <span>{progressLabel}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/70 dark:bg-black/20">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${styles.bar}`}
                        style={{ width: `${Math.max(6, upload.progress)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function ProjectForm({ initialData, isNew = false, onSuccess, onCancel }: ProjectFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [authors, setAuthors] = useState<{ id: string; name: string | null }[]>([]);
    const [categories, setCategories] = useState<{ id: string; title: string }[]>([]);
    const [coverCropImageSrc, setCoverCropImageSrc] = useState<string | null>(null);
    const [coverCropFileName, setCoverCropFileName] = useState("");
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
    const [coverAspectSelection, setCoverAspectSelection] = useState<ImageCropperAspectSelection>({
        mode: "preset",
        value: DEFAULT_COVER_ASPECT.value,
        label: DEFAULT_COVER_ASPECT.label,
        width: DEFAULT_COVER_ASPECT.width,
        height: DEFAULT_COVER_ASPECT.height,
        aspect: DEFAULT_COVER_ASPECT.width / DEFAULT_COVER_ASPECT.height,
    });
    const [coverUpload, setCoverUpload] = useState<UploadFeedback | null>(null);
    const [videoUpload, setVideoUpload] = useState<UploadFeedback | null>(null);
    const [galleryUploads, setGalleryUploads] = useState<UploadFeedback[]>([]);
    const [activeMediaPicker, setActiveMediaPicker] = useState<null | "cover" | "video" | "gallery">(null);

    const [formData, setFormData] = useState<ProjectFormData>({
        title: readString(initialData?.title),
        slug: readString(initialData?.slug),
        description: readString(initialData?.description),
        content: readString(initialData?.content),
        type: readProjectType(initialData?.type),
        image: readString(initialData?.image),
        videoFile: readString(initialData?.videoFile),
        demoUrl: readString(initialData?.demoUrl),
        repoUrl: readString(initialData?.repoUrl),
        tags: readString(initialData?.tags),
        categoryId: readString(initialData?.categoryId),
        authorId: readString(initialData?.authorId),
        favorite: readBoolean(initialData?.favorite),
        status: readProjectStatus(initialData?.status),
        gallery: readGallery(initialData?.gallery),
    });

    useEffect(() => {
        getAuthors().then((res) => {
            if (res.success && res.data) {
                setAuthors(res.data);
            }
        });
    }, []);

    useEffect(() => {
        getCategories().then((res) => {
            if (res.success && res.data) {
                setCategories(res.data);
            }
        });
    }, []);

    useEffect(() => {
        if (isNew && formData.title && !initialData) {
            setFormData((prev) => ({
                ...prev,
                slug: prev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            }));
        }
    }, [formData.title, initialData, isNew]);

    useEffect(() => {
        return () => revokeBlobUrl(coverCropImageSrc);
    }, [coverCropImageSrc]);

    useEffect(() => {
        return () => revokeBlobUrl(coverPreviewUrl);
    }, [coverPreviewUrl]);

    const hasCoverUploadInFlight = isUploadBusy(coverUpload);
    const hasVideoUploadInFlight = isUploadBusy(videoUpload);
    const hasGalleryUploadInFlight = galleryUploads.some((upload) => isUploadBusy(upload));
    const activeUploadCount = [coverUpload, videoUpload, ...galleryUploads].filter((upload) => isUploadBusy(upload)).length;
    const hasPendingUploads = activeUploadCount > 0;
    const initialProjectId = typeof initialData?.id === "string" ? initialData.id : "";
    const displayedCoverUrl = coverPreviewUrl || (formData.image ? resolveAssetUrl(formData.image) : null);
    const galleryUploadFeed = useMemo(
        () => galleryUploads.filter((upload) => isUploadBusy(upload) || upload.status === "error" || upload.status === "success"),
        [galleryUploads],
    );

    const updateFormData = (updates: Partial<ProjectFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
        setIsDirty(true);
    };

    const appendGalleryItem = (item: GalleryItem) => {
        setFormData((prev) => ({
            ...prev,
            gallery: [...(prev.gallery || []), item],
        }));
        setIsDirty(true);
    };

    const updateGalleryUpload = (id: string, updates: Partial<UploadFeedback>) => {
        setGalleryUploads((prev) =>
            prev.map((upload) => (upload.id === id ? { ...upload, ...updates } : upload)),
        );
    };

    const handleMediaLibrarySelection = (assets: MediaAssetRecord[]) => {
        if (!activeMediaPicker || assets.length === 0) {
            setActiveMediaPicker(null);
            return;
        }

        if (activeMediaPicker === "cover") {
            updateFormData({ image: assets[0].url });
            setCoverPreviewUrl(null);
        }

        if (activeMediaPicker === "video") {
            updateFormData({
                type: "VIDEO",
                videoFile: assets[0].url,
            });
        }

        if (activeMediaPicker === "gallery") {
            const nextItems = assets
                .filter((asset) => asset.kind === "IMAGE" || asset.kind === "VIDEO")
                .map((asset) => ({
                    type: asset.kind === "VIDEO" ? "video" : "image",
                    url: asset.url,
                })) as GalleryItem[];

            updateFormData({
                gallery: [...formData.gallery, ...nextItems],
            });
        }

        setActiveMediaPicker(null);
    };

    const handleSave = async (forceStatus?: "DRAFT") => {
        if (hasPendingUploads) {
            toast.error("Selesaikan upload yang masih berjalan sebelum menyimpan project.");
            return;
        }

        if (!forceStatus && (!formData.title || !formData.slug)) {
            toast.error("Title and Slug are required");
            return;
        }

        if (!isNew && !initialProjectId) {
            toast.error("Project ID is missing");
            return;
        }

        setLoading(true);

        try {
            const dataToSave = { ...formData };
            if (forceStatus) {
                dataToSave.status = forceStatus;
            }

            const result = isNew
                ? await createProject(dataToSave)
                : await updateProject(initialProjectId, dataToSave);

            if (result.success) {
                toast.success(forceStatus === "DRAFT" ? "Changes saved to Draft" : `Project ${isNew ? "created" : "updated"} successfully`);

                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/admin/projects");
                    router.refresh();
                }
            } else {
                toast.error(result.error || "Failed to save project");
            }
        } catch (error) {
            console.error("Project save error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseAttempt = async () => {
        if (hasPendingUploads) {
            toast.info("Tunggu upload selesai dulu sebelum menutup form.");
            return;
        }

        if (isDirty && !loading) {
            await handleSave("DRAFT");
            return;
        }

        if (onCancel) {
            onCancel();
        }
    };

    const handleCoverImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const validationError = getImageValidationError(file);
        if (validationError) {
            toast.error(validationError);
            event.target.value = "";
            return;
        }

        setCoverCropFileName(file.name);
        setCoverCropImageSrc((currentValue) => {
            revokeBlobUrl(currentValue);
            return URL.createObjectURL(file);
        });
        event.target.value = "";
    };

    const closeCoverCropper = () => {
        setCoverCropImageSrc((currentValue) => {
            revokeBlobUrl(currentValue);
            return null;
        });
    };

    const uploadCoverImage = async (file: File, previewUrl: string) => {
        const nextUpload = createUploadFeedback(file, "image", "Menyiapkan cover image...");
        const messages: UploadProgressMessages = {
            starting: "Menyiapkan cover image...",
            uploading: "Mengupload cover image ke project...",
            processing: "Menyimpan cover image di server...",
            done: "Cover image siap dipakai.",
        };

        setCoverUpload(nextUpload);
        setCoverPreviewUrl((currentValue) => {
            revokeBlobUrl(currentValue);
            return previewUrl;
        });

        try {
            const result = await uploadProjectAssetWithProgress({
                file,
                type: "image",
                onProgress: (progress) => {
                    setCoverUpload((currentValue) =>
                        currentValue?.id === nextUpload.id
                            ? { ...currentValue, ...mapUploadProgressToFeedback(progress, messages) }
                            : currentValue,
                    );
                },
            });

            if (!result.success || !result.url) {
                throw new Error(result.error || "Failed to upload cover image");
            }

            updateFormData({ image: result.url });
            setCoverUpload((currentValue) =>
                currentValue?.id === nextUpload.id
                    ? { ...currentValue, status: "success", progress: 100, message: messages.done }
                    : currentValue,
            );
            toast.success("Cover image berhasil diupload");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to upload cover image";

            setCoverUpload((currentValue) =>
                currentValue?.id === nextUpload.id
                    ? { ...currentValue, status: "error", message, progress: currentValue.progress || 0 }
                    : currentValue,
            );
            toast.error(message);
        } finally {
            setCoverPreviewUrl((currentValue) => {
                revokeBlobUrl(currentValue);
                return null;
            });
        }
    };

    const handleCoverCropComplete = async (croppedImage: Blob) => {
        closeCoverCropper();

        const fileName = `${sanitizeFileName(coverCropFileName)}-cover.jpg`;
        const croppedFile = new File([croppedImage], fileName, { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(croppedFile);

        await uploadCoverImage(croppedFile, previewUrl);
    };

    const handleVideoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const validationError = getVideoValidationError(file);
        if (validationError) {
            toast.error(validationError);
            event.target.value = "";
            return;
        }

        const nextUpload = createUploadFeedback(file, "video", "Menyiapkan video project...");
        const messages: UploadProgressMessages = {
            starting: "Menyiapkan video project...",
            uploading: "Mengupload video project...",
            processing: "Memfinalkan video di server...",
            done: "Video project siap dipakai.",
        };

        setVideoUpload(nextUpload);

        try {
            const result = await uploadProjectAssetWithProgress({
                file,
                type: "file",
                onProgress: (progress) => {
                    setVideoUpload((currentValue) =>
                        currentValue?.id === nextUpload.id
                            ? { ...currentValue, ...mapUploadProgressToFeedback(progress, messages) }
                            : currentValue,
                    );
                },
            });

            if (!result.success || !result.url) {
                throw new Error(result.error || "Failed to upload project video");
            }

            updateFormData({ videoFile: result.url });
            setVideoUpload((currentValue) =>
                currentValue?.id === nextUpload.id
                    ? { ...currentValue, status: "success", progress: 100, message: messages.done }
                    : currentValue,
            );
            toast.success("Video project berhasil diupload");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to upload project video";

            setVideoUpload((currentValue) =>
                currentValue?.id === nextUpload.id
                    ? { ...currentValue, status: "error", message, progress: currentValue.progress || 0 }
                    : currentValue,
            );
            toast.error(message);
        } finally {
            event.target.value = "";
        }
    };

    const handleGalleryUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        event.target.value = "";

        if (!selectedFiles.length) {
            return;
        }

        const uploadQueue = selectedFiles.reduce<Array<{ file: File; mediaType: "image" | "video"; feedback: UploadFeedback }>>(
            (queue, file) => {
                const mediaType = file.type.startsWith("image/")
                    ? "image"
                    : file.type.startsWith("video/")
                        ? "video"
                        : null;

                if (!mediaType) {
                    toast.error(`${file.name}: hanya gambar dan video yang didukung.`);
                    return queue;
                }

                const validationError = mediaType === "image"
                    ? getImageValidationError(file)
                    : getVideoValidationError(file);

                if (validationError) {
                    toast.error(`${file.name}: ${validationError}`);
                    return queue;
                }

                queue.push({
                    file,
                    mediaType,
                    feedback: createUploadFeedback(file, mediaType, "Masuk antrean upload gallery..."),
                });
                return queue;
            },
            [],
        );

        if (!uploadQueue.length) {
            return;
        }

        setGalleryUploads((prev) => [...uploadQueue.map((item) => item.feedback), ...prev]);

        let successCount = 0;
        let failureCount = 0;

        for (const item of uploadQueue) {
            const messages: UploadProgressMessages = item.mediaType === "image"
                ? {
                    starting: "Menyiapkan gambar gallery...",
                    uploading: "Mengupload gambar ke gallery...",
                    processing: "Menyimpan gambar gallery di server...",
                    done: "Gambar masuk ke gallery.",
                }
                : {
                    starting: "Menyiapkan video gallery...",
                    uploading: "Mengupload video ke gallery...",
                    processing: "Memfinalkan video gallery di server...",
                    done: "Video masuk ke gallery.",
                };

            try {
                const result = await uploadProjectAssetWithProgress({
                    file: item.file,
                    type: item.mediaType === "image" ? "image" : "file",
                    onProgress: (progress) => {
                        updateGalleryUpload(
                            item.feedback.id,
                            mapUploadProgressToFeedback(progress, messages),
                        );
                    },
                });

                if (!result.success || !result.url) {
                    throw new Error(result.error || "Failed to upload gallery item");
                }

                appendGalleryItem({
                    type: item.mediaType,
                    url: result.url,
                });
                updateGalleryUpload(item.feedback.id, {
                    status: "success",
                    progress: 100,
                    message: messages.done,
                });
                successCount += 1;
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to upload gallery item";

                updateGalleryUpload(item.feedback.id, {
                    status: "error",
                    message,
                });
                failureCount += 1;
            }
        }

        if (successCount > 0) {
            toast.success(`${successCount} media berhasil ditambahkan ke gallery`);
        }

        if (failureCount > 0) {
            toast.error(`${failureCount} media gagal diupload ke gallery`);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="absolute inset-0" onClick={handleCloseAttempt} />

                <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-3xl bg-white shadow-2xl animate-in zoom-in-50 duration-200 scrollbar-hide dark:bg-[#1A1A1A]">
                    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/80 px-8 py-5 backdrop-blur-lg dark:border-white/5 dark:bg-[#1A1A1A]/80">
                        <div>
                            <h2 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                                {isNew ? "Create Project" : "Edit Project"}
                                {isDirty && (
                                    <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-normal text-amber-500">
                                        Unsaved Changes
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {isNew ? "Add a new project to your portfolio." : "Update project details and assets."}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => updateFormData({ favorite: !formData.favorite })}
                                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all ${formData.favorite
                                    ? "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
                                    : "border-gray-200 bg-gray-50 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                                    }`}
                            >
                                <Star size={16} className={formData.favorite ? "fill-current" : ""} />
                                <span className="text-xs font-medium">{formData.favorite ? "Favorited" : "Favorite"}</span>
                            </button>

                            <button
                                onClick={handleCloseAttempt}
                                disabled={loading || hasPendingUploads}
                                className="rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-8 p-8">
                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-[var(--site-secondary)] dark:text-gray-400">
                                        Project Title
                                    </label>
                                    <input
                                        value={formData.title}
                                        onChange={(event) => updateFormData({ title: event.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all duration-300 placeholder-gray-400 focus:border-[var(--site-secondary)] focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                                        placeholder="e.g. Modern E-commerce Platform"
                                    />
                                </div>

                                <div className="group">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-teal-500 dark:text-gray-400">
                                        Slug (URL)
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                            <LinkIcon size={16} />
                                        </div>
                                        <input
                                            value={formData.slug}
                                            onChange={(event) => updateFormData({ slug: event.target.value })}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 font-mono text-sm text-gray-900 outline-none transition-all duration-300 placeholder-gray-400 focus:border-[var(--site-secondary)] focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-[var(--site-accent)] dark:focus:bg-black/40"
                                            placeholder="project-slug"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => updateFormData({ type: "IMAGE" })}
                                        className={`flex items-center justify-center gap-2 rounded-xl border py-3 transition-all duration-300 ${formData.type === "IMAGE"
                                            ? "border-[var(--site-accent)] bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20"
                                            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:bg-black/20 dark:text-gray-400 dark:hover:bg-white/5"
                                            }`}
                                    >
                                        <ImageIcon size={18} />
                                        <span className="font-medium">Image Based</span>
                                    </button>

                                    <button
                                        onClick={() => updateFormData({ type: "VIDEO" })}
                                        className={`flex items-center justify-center gap-2 rounded-xl border py-3 transition-all duration-300 ${formData.type === "VIDEO"
                                            ? "border-[var(--site-accent)] bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20"
                                            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:bg-black/20 dark:text-gray-400 dark:hover:bg-white/5"
                                            }`}
                                    >
                                        <Video size={18} />
                                        <span className="font-medium">Video Based</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Project Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.status}
                                        onChange={(event) => updateFormData({ status: event.target.value as ProjectFormData["status"] })}
                                        className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all duration-300 focus:border-[var(--site-secondary)] focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                                    >
                                        <option value="PUBLISHED">Published</option>
                                        <option value="DRAFT">Draft</option>
                                        <option value="ARCHIVED">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-purple-500 dark:text-gray-400">
                                    Category
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                        <Folder size={16} />
                                    </div>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(event) => updateFormData({ categoryId: event.target.value })}
                                        className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 outline-none transition-all duration-300 focus:border-purple-500 focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                                        title="Project Category"
                                    >
                                        <option value="">No Category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-teal-500 dark:text-gray-400">
                                    Author (Admin Select)
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                        <UserIcon size={16} />
                                    </div>
                                    <select
                                        value={formData.authorId}
                                        onChange={(event) => updateFormData({ authorId: event.target.value })}
                                        className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 outline-none transition-all duration-300 focus:border-[var(--site-secondary)] focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                                        title="Project Author"
                                    >
                                        <option value="">Current User</option>
                                        {authors.map((author) => (
                                            <option key={author.id} value={author.id}>
                                                {author.name || "Unknown User"}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="group md:col-span-2">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-teal-500 dark:text-gray-400">
                                    Tags
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                        <Tag size={16} />
                                    </div>
                                    <input
                                        value={formData.tags}
                                        onChange={(event) => updateFormData({ tags: event.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 outline-none transition-all duration-300 placeholder-gray-400 focus:border-[var(--site-secondary)] focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                                        placeholder="Comma separated tags (e.g. React, Design, UI/UX)"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Cover Media
                                    </label>
                                    <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                                        Upload cover image lewat mode crop agar framing lebih rapi. Rasio preset tersedia lengkap mulai dari landscape, square, portrait, sampai custom.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveMediaPicker("cover")}
                                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-gray-600 transition-colors hover:border-teal-500 hover:text-teal-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-teal-500/50 dark:hover:text-teal-300"
                                    >
                                        Open Library
                                    </button>
                                    <div className="rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-700 dark:text-teal-200">
                                        Ratio {coverAspectSelection.label}
                                    </div>
                                </div>
                            </div>

                            <div className="relative h-64 w-full overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all duration-300 hover:border-teal-500 dark:border-white/10 dark:bg-black/40 dark:hover:border-teal-500/50">
                                {displayedCoverUrl ? (
                                    <>
                                        <Image
                                            src={displayedCoverUrl}
                                            alt="Cover"
                                            fill
                                            unoptimized={displayedCoverUrl.startsWith("blob:")}
                                            className="object-cover transition-transform duration-700 hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-300 hover:opacity-100">
                                            <p className="flex items-center gap-2 font-medium text-white">
                                                <Upload size={18} />
                                                Crop & Upload Ulang Cover
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 transition-colors hover:text-teal-500 dark:text-gray-500">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-teal-500/10 dark:bg-white/5">
                                            <Upload size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium">Klik untuk upload cover image</p>
                                            <p className="mt-1 text-xs">File akan masuk ke editor crop sebelum diupload</p>
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                                    accept="image/*"
                                    disabled={hasCoverUploadInFlight}
                                    onChange={handleCoverImageSelection}
                                />

                                {hasCoverUploadInFlight && coverUpload && (
                                    <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-black/55 p-4 backdrop-blur-md">
                                        <div className="flex items-center justify-between gap-3 text-white">
                                            <div>
                                                <p className="text-sm font-semibold">{coverUpload.message}</p>
                                                <p className="mt-1 text-xs text-white/70">{coverUpload.fileName}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-bold">
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>{coverUpload.progress}%</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                                            <div
                                                className="h-full rounded-full bg-white transition-all duration-300"
                                                style={{ width: `${Math.max(8, coverUpload.progress)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
                                {coverUpload && <UploadFeedbackCard upload={coverUpload} />}

                                <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                                        Crop tips
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                        Pakai `16:9` untuk cover default, `1:1` untuk kartu grid, `9:16` untuk layout portrait, atau aktifkan `Custom` bila butuh rasio spesifik.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-8 border-t border-gray-100 pt-4 md:grid-cols-2 dark:border-white/5">
                            <div className="group">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-purple-500 dark:text-gray-400">
                                    External Link (ArtStation / Behance)
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                        <LinkIcon size={16} />
                                    </div>
                                    <input
                                        value={formData.repoUrl}
                                        onChange={(event) => updateFormData({ repoUrl: event.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 outline-none transition-all duration-300 placeholder-gray-400 focus:border-purple-500 focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                                        placeholder="https://artstation.com/artwork/..."
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-blue-500 dark:text-gray-400">
                                    Download / High-Res Link
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                        <Upload size={16} />
                                    </div>
                                    <input
                                        value={formData.demoUrl}
                                        onChange={(event) => updateFormData({ demoUrl: event.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 outline-none transition-all duration-300 placeholder-gray-400 focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                                        placeholder="https://drive.google.com/..."
                                    />
                                </div>
                            </div>

                            {formData.type === "VIDEO" && (
                                <div className="group space-y-4 md:col-span-2">
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-red-500 dark:text-gray-400">
                                            Video Source URL
                                        </label>
                                        <div className="mb-2 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setActiveMediaPicker("video")}
                                                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-gray-600 transition-colors hover:border-red-500 hover:text-red-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-red-500/50 dark:hover:text-red-300"
                                            >
                                                Video Library
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                                <Video size={16} />
                                            </div>
                                            <input
                                                value={formData.videoFile}
                                                onChange={(event) => updateFormData({ videoFile: event.target.value })}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-12 text-gray-900 outline-none transition-all duration-300 placeholder-gray-400 focus:border-red-500 focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                                                placeholder="https://... atau upload video langsung"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <label
                                                    className={`cursor-pointer rounded-full p-2 transition-colors ${hasVideoUploadInFlight
                                                        ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                                                        : "text-gray-400 hover:text-red-500"
                                                        }`}
                                                    title="Upload video from your device"
                                                >
                                                    <Upload size={18} />
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        className="hidden"
                                                        disabled={hasVideoUploadInFlight}
                                                        onChange={handleVideoUpload}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            Upload video akan menampilkan progres real-time sampai file selesai diproses server.
                                        </p>
                                    </div>

                                    {videoUpload && <UploadFeedbackCard upload={videoUpload} />}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 border-t border-gray-100 pt-4 dark:border-white/5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Project Gallery</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Tambahkan image atau video pendukung. Setiap item akan menampilkan feedback status upload, sehingga lebih jelas kalau ada file yang masih berjalan atau gagal.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveMediaPicker("gallery")}
                                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-gray-600 transition-colors hover:border-teal-500 hover:text-teal-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-teal-500/50 dark:hover:text-teal-300"
                                    >
                                        Gallery Library
                                    </button>
                                    <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                                        {formData.gallery.length} items
                                    </div>
                                </div>
                            </div>

                            {galleryUploadFeed.length > 0 && (
                                <div className="grid gap-3 lg:grid-cols-2">
                                    {galleryUploadFeed.map((upload) => (
                                        <UploadFeedbackCard
                                            key={upload.id}
                                            upload={upload}
                                            onDismiss={() => setGalleryUploads((prev) => prev.filter((item) => item.id !== upload.id))}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <label
                                    className={`aspect-video rounded-xl border-2 border-dashed bg-gray-50 transition-colors group dark:bg-black/20 ${hasGalleryUploadInFlight
                                        ? "cursor-not-allowed border-gray-200/70 opacity-70 dark:border-white/10"
                                        : "cursor-pointer border-gray-200 hover:border-teal-500 dark:border-white/10 dark:hover:border-teal-500/50"
                                        }`}
                                >
                                    <div className="flex h-full flex-col items-center justify-center">
                                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-teal-500/10 dark:bg-white/5">
                                            {hasGalleryUploadInFlight ? (
                                                <Loader2 size={20} className="animate-spin text-teal-500" />
                                            ) : (
                                                <Upload size={20} className="text-gray-400 transition-colors group-hover:text-teal-500 dark:text-gray-500" />
                                            )}
                                        </div>
                                        <span className="text-center text-xs font-semibold text-gray-500 transition-colors group-hover:text-teal-500 dark:text-gray-400">
                                            {hasGalleryUploadInFlight ? "Uploading..." : "Add Media"}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        className="hidden"
                                        disabled={hasGalleryUploadInFlight}
                                        onChange={handleGalleryUpload}
                                    />
                                </label>

                                {formData.gallery.map((item, index) => (
                                    <div
                                        key={`${item.url}-${index}`}
                                        className="group relative aspect-video overflow-hidden rounded-xl border border-gray-200 bg-black dark:border-white/10"
                                    >
                                        {item.type === "video" ? (
                                            <video
                                                src={resolveAssetUrl(item.url)}
                                                className="h-full w-full object-cover opacity-80"
                                            />
                                        ) : (
                                            <Image
                                                src={resolveAssetUrl(item.url)}
                                                alt={`Gallery ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        )}

                                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                                onClick={() => {
                                                    const nextGallery = [...formData.gallery];
                                                    nextGallery.splice(index, 1);
                                                    updateFormData({ gallery: nextGallery });
                                                }}
                                                className="rounded-full border border-red-500/50 bg-red-500/10 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        {item.type === "video" && (
                                            <div className="pointer-events-none absolute right-2 top-2">
                                                <Video size={14} className="text-white drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6 border-t border-gray-100 pt-4 dark:border-white/5">
                            <div className="group">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-teal-500 dark:text-gray-400">
                                    Short Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(event) => updateFormData({ description: event.target.value })}
                                    className="h-24 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all duration-300 placeholder-gray-400 focus:border-teal-500 focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                                    placeholder="A brief summary of the project..."
                                />
                            </div>

                            <div className="group">
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-teal-500 dark:text-gray-400">
                                        Detailed Content
                                    </label>
                                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-400 dark:bg-white/5">
                                        Markdown Supported
                                    </span>
                                </div>
                                <textarea
                                    value={formData.content}
                                    onChange={(event) => updateFormData({ content: event.target.value })}
                                    className="h-80 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900 outline-none transition-all duration-300 placeholder-gray-400 focus:border-teal-500 focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-gray-200 dark:focus:bg-black/40"
                                    placeholder="# Project Details&#10;&#10;Describe your project features, tech stack, and challenges..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 z-20 flex items-center justify-between gap-3 border-t border-gray-100 bg-white/80 px-8 py-5 backdrop-blur-lg dark:border-white/5 dark:bg-[#1A1A1A]/80">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {hasPendingUploads
                                ? `${activeUploadCount} upload masih berjalan. Simpan akan aktif setelah semuanya selesai.`
                                : isDirty
                                    ? "Perubahan siap disimpan atau dipublish."
                                    : "Belum ada perubahan baru."}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCloseAttempt}
                                disabled={loading || hasPendingUploads}
                                className="rounded-xl border border-gray-200 px-6 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                            >
                                {isDirty ? "Save as Draft & Close" : "Cancel"}
                            </button>

                            <button
                                onClick={() => handleSave()}
                                disabled={loading || hasPendingUploads}
                                className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--site-accent-prev)] to-[var(--site-accent-next)] px-8 py-3 font-bold text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20 transition-all ${loading || hasPendingUploads
                                    ? "cursor-not-allowed opacity-70"
                                    : "hover:scale-[1.02] active:scale-[0.98]"
                                    }`}
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                <span>
                                    {loading
                                        ? "Saving..."
                                        : hasPendingUploads
                                            ? "Finish Uploads First"
                                            : "Publish Project"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <MediaLibraryModal
                open={activeMediaPicker !== null}
                onClose={() => setActiveMediaPicker(null)}
                onConfirmSelection={handleMediaLibrarySelection}
                title={
                    activeMediaPicker === "cover"
                        ? "Pilih Cover Project"
                        : activeMediaPicker === "video"
                            ? "Pilih Video Project"
                            : "Pilih Gallery Project"
                }
                description="Pilih aset yang sudah pernah diupload atau upload file baru langsung dari popup ini."
                preferredFolder={activeMediaPicker === "cover" ? "project_images" : "project_files"}
                allowedKinds={
                    activeMediaPicker === "cover"
                        ? ["IMAGE"]
                        : activeMediaPicker === "video"
                            ? ["VIDEO"]
                            : ["IMAGE", "VIDEO"]
                }
                multiple={activeMediaPicker === "gallery"}
            />

            {coverCropImageSrc && (
                <ImageCropper
                    imageSrc={coverCropImageSrc}
                    aspect={DEFAULT_COVER_ASPECT.width / DEFAULT_COVER_ASPECT.height}
                    aspectOptions={COVER_ASPECT_OPTIONS}
                    defaultAspectValue={DEFAULT_COVER_ASPECT.value}
                    allowCustomAspect
                    customAspectDefault={{
                        width: DEFAULT_COVER_ASPECT.width,
                        height: DEFAULT_COVER_ASPECT.height,
                    }}
                    objectFit="cover"
                    title="Crop project cover"
                    description="Atur framing cover sebelum diupload. Kamu bisa ganti rasio landscape, square, portrait, sampai custom agar cocok dengan layout project."
                    helperText="Gunakan rasio lebar untuk hero default, square untuk kartu grid, atau portrait bila cover akan dipakai di komposisi yang lebih tinggi."
                    confirmLabel="Upload Hasil Crop"
                    cancelLabel="Batal"
                    resultDescription="Area di dalam frame akan menjadi cover image project setelah upload selesai."
                    onAspectChange={setCoverAspectSelection}
                    onCancel={closeCoverCropper}
                    onCropComplete={handleCoverCropComplete}
                />
            )}
        </>
    );
}
