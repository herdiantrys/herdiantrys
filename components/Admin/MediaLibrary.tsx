"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
    Check,
    Copy,
    File as FileIcon,
    Image as ImageIcon,
    Loader2,
    Music,
    Pencil,
    RefreshCw,
    Search,
    Trash2,
    Upload,
    Video,
    X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import {
    deleteMediaAssetAction,
    getMediaAssetsAction,
    updateMediaAssetAction,
    uploadMediaAssetAction,
} from "@/lib/actions/media.actions";
import { resolveAssetUrl } from "@/lib/media";

export type MediaAssetKindValue = "IMAGE" | "VIDEO" | "AUDIO" | "FILE";

export type MediaAssetRecord = {
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

type MediaLibraryBaseProps = {
    mode: "picker" | "manager";
    title: string;
    description?: string;
    preferredFolder: string;
    allowedKinds?: MediaAssetKindValue[];
    multiple?: boolean;
    initialSelectedUrls?: string[];
    onClose?: () => void;
    onConfirmSelection?: (assets: MediaAssetRecord[]) => void;
};

type MediaLibraryModalProps = Omit<MediaLibraryBaseProps, "mode"> & {
    open: boolean;
};

const ALL_KINDS: MediaAssetKindValue[] = ["IMAGE", "VIDEO", "AUDIO", "FILE"];

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const formatKindLabel = (kind: MediaAssetKindValue) => {
    switch (kind) {
        case "IMAGE":
            return "Image";
        case "VIDEO":
            return "Video";
        case "AUDIO":
            return "Audio";
        default:
            return "File";
    }
};

const getAcceptValue = (kinds: MediaAssetKindValue[]) => {
    const accepts: string[] = [];

    if (kinds.includes("IMAGE")) accepts.push("image/*");
    if (kinds.includes("VIDEO")) accepts.push("video/*");
    if (kinds.includes("AUDIO")) accepts.push("audio/*");
    if (kinds.includes("FILE")) accepts.push("*/*");

    return accepts.join(",");
};

const getKindIcon = (kind: MediaAssetKindValue) => {
    switch (kind) {
        case "IMAGE":
            return ImageIcon;
        case "VIDEO":
            return Video;
        case "AUDIO":
            return Music;
        default:
            return FileIcon;
    }
};

function MediaLibraryBase({
    mode,
    title,
    description,
    preferredFolder,
    allowedKinds = ["IMAGE", "VIDEO"],
    multiple = false,
    initialSelectedUrls = [],
    onClose,
    onConfirmSelection,
}: MediaLibraryBaseProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const availableKinds = useMemo(() => {
        const normalizedKinds = allowedKinds.length ? allowedKinds : ALL_KINDS;
        return Array.from(new Set(normalizedKinds));
    }, [allowedKinds]);

    const [assets, setAssets] = useState<MediaAssetRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeKind, setActiveKind] = useState<MediaAssetKindValue | "ALL">(
        availableKinds.length === 1 ? availableKinds[0] : "ALL",
    );
    const [selectedUrls, setSelectedUrls] = useState<string[]>(initialSelectedUrls);
    const [editingAsset, setEditingAsset] = useState<MediaAssetRecord | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [editingAltText, setEditingAltText] = useState("");
    const [savingMetadata, setSavingMetadata] = useState(false);

    useEffect(() => {
        setSelectedUrls(initialSelectedUrls);
    }, [initialSelectedUrls]);

    const loadAssets = useCallback(async () => {
        setLoading(true);
        const result = await getMediaAssetsAction({ kinds: availableKinds });
        if (result.success && result.data) {
            setAssets(result.data as MediaAssetRecord[]);
        } else {
            toast.error(result.error || "Failed to load media library");
        }
        setLoading(false);
    }, [availableKinds]);

    useEffect(() => {
        void loadAssets();
    }, [loadAssets]);

    const visibleAssets = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return assets.filter((asset) => {
            if (activeKind !== "ALL" && asset.kind !== activeKind) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            return [
                asset.filename,
                asset.originalName,
                asset.folder,
                asset.url,
                asset.title || "",
                asset.altText || "",
            ].some((value) => value.toLowerCase().includes(normalizedQuery));
        });
    }, [activeKind, assets, searchQuery]);

    const selectedAssets = useMemo(
        () => assets.filter((asset) => selectedUrls.includes(asset.url)),
        [assets, selectedUrls],
    );

    const toggleSelection = (asset: MediaAssetRecord) => {
        if (mode !== "picker") {
            return;
        }

        setSelectedUrls((currentValue) => {
            if (multiple) {
                return currentValue.includes(asset.url)
                    ? currentValue.filter((url) => url !== asset.url)
                    : [...currentValue, asset.url];
            }

            return currentValue[0] === asset.url ? [] : [asset.url];
        });
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        setUploading(true);
        const uploadedAssets: MediaAssetRecord[] = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", preferredFolder);

            const result = await uploadMediaAssetAction(formData);
            if (result.success && result.data) {
                uploadedAssets.push(result.data as MediaAssetRecord);
            } else {
                toast.error(result.error || `Failed to upload ${file.name}`);
            }
        }

        if (uploadedAssets.length > 0) {
            setAssets((currentValue) => {
                const remainingAssets = currentValue.filter(
                    (asset) => !uploadedAssets.some((uploadedAsset) => uploadedAsset.url === asset.url),
                );
                return [...uploadedAssets, ...remainingAssets];
            });

            if (mode === "picker") {
                setSelectedUrls((currentValue) => {
                    if (multiple) {
                        return Array.from(new Set([...currentValue, ...uploadedAssets.map((asset) => asset.url)]));
                    }

                    return [uploadedAssets[0].url];
                });
            }

            toast.success(`${uploadedAssets.length} file berhasil diupload`);
        }

        setUploading(false);
        event.target.value = "";
    };

    const handleCopyUrl = async (asset: MediaAssetRecord) => {
        try {
            await navigator.clipboard.writeText(asset.url);
            toast.success("URL berhasil disalin");
        } catch {
            toast.error("Gagal menyalin URL");
        }
    };

    const handleDelete = async (asset: MediaAssetRecord) => {
        const isConfirmed = window.confirm(`Hapus file "${asset.originalName}" dari server?`);
        if (!isConfirmed) {
            return;
        }

        const result = await deleteMediaAssetAction(asset.id);
        if (!result.success) {
            toast.error(result.error || "Failed to delete file");
            return;
        }

        setAssets((currentValue) => currentValue.filter((currentAsset) => currentAsset.id !== asset.id));
        setSelectedUrls((currentValue) => currentValue.filter((url) => url !== asset.url));
        toast.success("File berhasil dihapus");
    };

    const openEditModal = (asset: MediaAssetRecord) => {
        setEditingAsset(asset);
        setEditingTitle(asset.title || "");
        setEditingAltText(asset.altText || "");
    };

    const handleSaveMetadata = async () => {
        if (!editingAsset) return;

        setSavingMetadata(true);
        const result = await updateMediaAssetAction(editingAsset.id, {
            title: editingTitle,
            altText: editingAltText,
        });

        if (result.success && result.data) {
            const updatedAsset = result.data as MediaAssetRecord;
            setAssets((currentValue) =>
                currentValue.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset)),
            );
            setEditingAsset(null);
            toast.success("Metadata file berhasil disimpan");
        } else {
            toast.error(result.error || "Failed to update file");
        }
        setSavingMetadata(false);
    };

    const renderPreview = (asset: MediaAssetRecord) => {
        const PreviewIcon = getKindIcon(asset.kind);

        if (asset.kind === "IMAGE") {
            return (
                <Image
                    src={resolveAssetUrl(asset.url)}
                    alt={asset.altText || asset.title || asset.originalName}
                    fill
                    className="object-cover"
                />
            );
        }

        if (asset.kind === "VIDEO") {
            return (
                <video
                    src={resolveAssetUrl(asset.url)}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                />
            );
        }

        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),rgba(15,23,42,0.9))] text-slate-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <PreviewIcon size={26} />
                </div>
                <p className="px-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    {formatKindLabel(asset.kind)}
                </p>
            </div>
        );
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex flex-col gap-5 border-b border-slate-200/80 px-6 py-5 dark:border-white/10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                        {description && (
                            <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => void loadAssets()}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="inline-flex items-center gap-2 rounded-xl bg-[var(--site-button)] px-4 py-2.5 text-sm font-semibold text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            {uploading ? "Uploading..." : "Upload Baru"}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={getAcceptValue(availableKinds)}
                            multiple={multiple || mode === "manager"}
                            className="hidden"
                            onChange={handleUpload}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Cari file, folder, judul, atau URL..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-[var(--site-accent)]/50 focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {availableKinds.length > 1 && (
                            <button
                                type="button"
                                onClick={() => setActiveKind("ALL")}
                                className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] transition-all ${activeKind === "ALL"
                                    ? "bg-[var(--site-accent)] text-white shadow-lg shadow-[var(--site-accent)]/25"
                                    : "border border-slate-200 bg-white text-slate-500 hover:text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                                    }`}
                            >
                                All
                            </button>
                        )}
                        {availableKinds.map((kind) => (
                            <button
                                key={kind}
                                type="button"
                                onClick={() => setActiveKind(kind)}
                                className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] transition-all ${activeKind === kind
                                    ? "bg-[var(--site-accent)] text-white shadow-lg shadow-[var(--site-accent)]/25"
                                    : "border border-slate-200 bg-white text-slate-500 hover:text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                                    }`}
                            >
                                {formatKindLabel(kind)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                {mode === "picker" && (
                    <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                        <span>{selectedAssets.length} file dipilih</span>
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Folder upload baru: {preferredFolder}
                        </span>
                    </div>
                )}

                {loading ? (
                    <div className="flex h-72 items-center justify-center">
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-300">
                            <Loader2 size={18} className="animate-spin" />
                            Loading media library...
                        </div>
                    </div>
                ) : visibleAssets.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleAssets.map((asset) => {
                            const isSelected = selectedUrls.includes(asset.url);
                            return (
                                <div
                                    key={asset.id}
                                    className={`group overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition-all dark:bg-[#0b1320] ${isSelected
                                        ? "border-[var(--site-accent)] shadow-[0_18px_44px_rgba(20,184,166,0.18)]"
                                        : "border-slate-200/80 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10"
                                        }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleSelection(asset)}
                                        className="block w-full text-left"
                                        disabled={mode !== "picker"}
                                    >
                                        <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                                            {renderPreview(asset)}
                                            {mode === "picker" && (
                                                <div className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border text-white transition-all ${isSelected
                                                    ? "border-[var(--site-accent)] bg-[var(--site-accent)]"
                                                    : "border-white/30 bg-black/35 opacity-0 group-hover:opacity-100"
                                                    }`}>
                                                    <Check size={16} />
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    <div className="space-y-3 p-4">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                                {asset.title || asset.originalName}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                                                {asset.folder}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                                            <span className="rounded-full border border-slate-200 px-2.5 py-1 dark:border-white/10">
                                                {formatKindLabel(asset.kind)}
                                            </span>
                                            <span>{formatFileSize(asset.size)}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => void handleCopyUrl(asset)}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                                            >
                                                <Copy size={14} />
                                                Copy URL
                                            </button>
                                            {mode === "manager" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(asset)}
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleDelete(asset)}
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition-colors hover:bg-red-500 hover:text-white dark:border-red-500/30 dark:bg-red-500/10"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex h-72 flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 text-center dark:border-white/10 dark:bg-white/5">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-white/10">
                            <ImageIcon size={28} className="text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-100">Belum ada file yang cocok</p>
                        <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                            Upload file baru atau ubah filter pencarian untuk melihat aset lain di library.
                        </p>
                    </div>
                )}
            </div>

            {mode === "picker" && (
                <div className="flex items-center justify-between gap-3 border-t border-slate-200/80 px-6 py-5 dark:border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirmSelection?.(selectedAssets)}
                        disabled={selectedAssets.length === 0}
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--site-button)] px-5 py-2.5 text-sm font-semibold text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Check size={16} />
                        Gunakan {selectedAssets.length > 0 ? `${selectedAssets.length} File` : "File"}
                    </button>
                </div>
            )}

            <AnimatePresence>
                {editingAsset && (
                    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
                        <motion.button
                            type="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingAsset(null)}
                            className="absolute inset-0 bg-[rgba(8,12,24,0.6)] backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 16, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.96 }}
                            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-[#0b1320]"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5 dark:border-white/10">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Metadata File</h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{editingAsset.originalName}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingAsset(null)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4 px-6 py-6">
                                <div>
                                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editingTitle}
                                        onChange={(event) => setEditingTitle(event.target.value)}
                                        placeholder="Judul file untuk memudahkan pencarian"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[var(--site-accent)]/50 focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                        Alt Text
                                    </label>
                                    <textarea
                                        value={editingAltText}
                                        onChange={(event) => setEditingAltText(event.target.value)}
                                        placeholder="Deskripsi singkat untuk kebutuhan aksesibilitas"
                                        rows={4}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[var(--site-accent)]/50 focus:bg-white dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-slate-200/80 px-6 py-5 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingAsset(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleSaveMetadata()}
                                    disabled={savingMetadata}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--site-button)] px-5 py-2.5 text-sm font-semibold text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20 transition-all hover:opacity-90 disabled:opacity-60"
                                >
                                    {savingMetadata ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    Simpan
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function MediaLibraryManager(
    props: Omit<MediaLibraryBaseProps, "mode" | "onConfirmSelection" | "onClose">,
) {
    return <MediaLibraryBase {...props} mode="manager" />;
}

export function MediaLibraryModal({
    open,
    ...props
}: MediaLibraryModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-6">
            <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={props.onClose}
                className="absolute inset-0 bg-[rgba(8,12,24,0.7)] backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.97 }}
                className="relative z-10 flex h-[min(92vh,980px)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-[#071018]"
            >
                <MediaLibraryBase {...props} mode="picker" />
            </motion.div>
        </div>
    );
}
