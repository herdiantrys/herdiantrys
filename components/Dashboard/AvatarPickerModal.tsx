"use client";

import {
    type ChangeEvent,
    type DragEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    Camera,
    Check,
    ImagePlus,
    Loader2,
    RefreshCcw,
    Sparkles,
    Upload,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { Portal } from "@/components/Portal";
import ImageCropper from "@/components/ImageCropper";
import { setProfileImageFromPreset, uploadProfileImage } from "@/lib/actions/user.actions";
import {
    DEFAULT_PROFILE_PICTURES,
    getDefaultProfilePicture,
} from "@/lib/default-profile-picture";

type SerializableImage =
    | string
    | {
        asset?: {
            url?: string | null;
        } | null;
    }
    | null
    | undefined;

type AvatarPickerUser = {
    id?: string | null;
    _id?: string | null;
    email?: string | null;
    username?: string | null;
    fullName?: string | null;
    image?: string | null;
    imageURL?: string | null;
    profileImage?: SerializableImage;
};

type AvatarPickerModalProps = {
    isOpen: boolean;
    onClose: () => void;
    user: AvatarPickerUser;
};

const resolveImageUrl = (image?: SerializableImage) => {
    if (!image) return null;
    if (typeof image === "string") return image;
    if (image.asset?.url) return image.asset.url;
    return null;
};

const getUserId = (user: AvatarPickerUser) => user._id || user.id || "";

const getUserSeed = (user: AvatarPickerUser) => {
    return user.email || user.username || user.fullName || getUserId(user);
};

const revokeBlobUrl = (value: string | null) => {
    if (value?.startsWith("blob:")) {
        URL.revokeObjectURL(value);
    }
};

const sanitizeFileName = (fileName?: string | null) => {
    if (!fileName) return "avatar";

    return fileName
        .replace(/\.[^.]+$/, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "avatar";
};

export default function AvatarPickerModal({ isOpen, onClose, user }: AvatarPickerModalProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadSourceUrl, setUploadSourceUrl] = useState<string | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadFileName, setUploadFileName] = useState("");
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fallbackAvatar = useMemo(() => getDefaultProfilePicture(getUserSeed(user)), [user]);
    const currentAvatar = useMemo(() => {
        return resolveImageUrl(user.profileImage) || user.imageURL || user.image || fallbackAvatar;
    }, [fallbackAvatar, user]);
    const currentPreset = useMemo(() => {
        return DEFAULT_PROFILE_PICTURES.includes(
            currentAvatar as (typeof DEFAULT_PROFILE_PICTURES)[number]
        )
            ? currentAvatar
            : null;
    }, [currentAvatar]);

    const activePreview = previewUrl || selectedPreset || currentAvatar;
    const hasPendingChanges = Boolean(uploadFile || (selectedPreset && selectedPreset !== currentAvatar));
    const stage = cropImageSrc ? 2 : hasPendingChanges ? 3 : 1;
    const userId = getUserId(user);

    const clearPreviewUrl = () => {
        setPreviewUrl((currentValue) => {
            revokeBlobUrl(currentValue);
            return null;
        });
    };

    const clearUploadSourceUrl = () => {
        setUploadSourceUrl((currentValue) => {
            revokeBlobUrl(currentValue);
            return null;
        });
    };

    const clearUploadState = () => {
        setUploadFile(null);
        setUploadFileName("");
        clearPreviewUrl();
        clearUploadSourceUrl();
        setCropImageSrc(null);
    };

    useEffect(() => {
        if (!isOpen) return;
        setUploadFile(null);
        setUploadFileName("");
        setPreviewUrl((currentValue) => {
            revokeBlobUrl(currentValue);
            return null;
        });
        setUploadSourceUrl((currentValue) => {
            revokeBlobUrl(currentValue);
            return null;
        });
        setCropImageSrc(null);
        setSelectedPreset(currentPreset);
        setIsDragging(false);
    }, [currentPreset, isOpen]);

    useEffect(() => {
        return () => revokeBlobUrl(previewUrl);
    }, [previewUrl]);

    useEffect(() => {
        return () => revokeBlobUrl(uploadSourceUrl);
    }, [uploadSourceUrl]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape" || isSaving) return;
            if (cropImageSrc) {
                setCropImageSrc(null);
                return;
            }
            onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [cropImageSrc, isOpen, isSaving, onClose]);

    const handleClose = () => {
        if (isSaving) return;
        if (cropImageSrc) {
            setCropImageSrc(null);
            return;
        }
        onClose();
    };

    const handlePresetSelect = (preset: string) => {
        clearUploadState();
        setSelectedPreset(preset);
    };

    const startCropForFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("File harus berupa gambar");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Ukuran gambar maksimal 10MB");
            return;
        }

        const nextSourceUrl = URL.createObjectURL(file);

        setUploadSourceUrl((currentValue) => {
            revokeBlobUrl(currentValue);
            return nextSourceUrl;
        });
        clearPreviewUrl();
        setUploadFile(null);
        setUploadFileName(file.name);
        setSelectedPreset(null);
        setCropImageSrc(nextSourceUrl);
        setIsDragging(false);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        startCropForFile(file);
        event.target.value = "";
    };

    const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
            startCropForFile(file);
        }
    };

    const handleCropComplete = (croppedImage: Blob) => {
        const croppedFile = new File(
            [croppedImage],
            `${sanitizeFileName(uploadFileName)}-avatar.jpg`,
            { type: "image/jpeg" }
        );
        const nextPreviewUrl = URL.createObjectURL(croppedFile);

        setPreviewUrl((currentValue) => {
            revokeBlobUrl(currentValue);
            return nextPreviewUrl;
        });
        setUploadFile(croppedFile);
        setCropImageSrc(null);
        toast.success("Crop selesai dan preview diperbarui");
    };

    const handleReCrop = () => {
        if (uploadSourceUrl) {
            setCropImageSrc(uploadSourceUrl);
        }
    };

    const handleSave = async () => {
        if (!userId) {
            toast.error("User tidak ditemukan");
            return;
        }

        if (!uploadFile && (!selectedPreset || selectedPreset === currentAvatar)) {
            toast.info("Belum ada perubahan avatar");
            onClose();
            return;
        }

        setIsSaving(true);

        try {
            const result = uploadFile
                ? await (() => {
                    const formData = new FormData();
                    formData.append("image", uploadFile);
                    return uploadProfileImage(userId, formData);
                })()
                : await setProfileImageFromPreset(userId, selectedPreset || currentAvatar);

            if (!result?.success) {
                toast.error(result?.error || "Gagal memperbarui avatar");
                return;
            }

            toast.success("Foto profil berhasil diperbarui");
            router.refresh();
            onClose();
        } catch (error) {
            console.error("Error updating avatar:", error);
            toast.error("Terjadi kesalahan saat memperbarui avatar");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Portal>
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4">
                        <motion.button
                            type="button"
                            aria-label="Close avatar picker"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="absolute inset-0 bg-slate-950/72 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.98 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            onClick={(event) => event.stopPropagation()}
                            className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[34px] border border-white/60 bg-white/92 shadow-[0_38px_90px_rgba(15,23,42,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#081018]/94"
                        >
                            <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.24),_transparent_72%)] pointer-events-none" />

                            <div className="relative flex items-start justify-between gap-4 border-b border-slate-200/70 px-5 py-5 sm:px-6 dark:border-white/10">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--site-secondary)] shadow-sm dark:border-white/10 dark:bg-white/5">
                                        <Sparkles size={12} />
                                        <span>Profile Picture Studio</span>
                                    </div>
                                    <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-[2rem] dark:text-white">
                                        Atur foto profil dengan lebih presisi
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                        Pilih avatar preset atau upload gambar sendiri, lalu crop sampai framing-nya pas sebelum disimpan.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded-full border border-slate-200 bg-white/85 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="relative grid gap-0 overflow-y-auto lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
                                <div className="border-b border-slate-200/70 px-5 py-5 sm:px-6 lg:border-b-0 lg:border-r dark:border-white/10">
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {[
                                            ["Pilih", "Preset atau upload"],
                                            ["Crop", "Atur posisi dan zoom"],
                                            ["Simpan", "Terapkan ke profil"],
                                        ].map(([title, description], index) => {
                                            const stepIndex = index + 1;
                                            const isActive = stage === stepIndex;
                                            const isCompleted = stage > stepIndex;

                                            return (
                                                <div
                                                    key={title}
                                                    className={`rounded-[24px] border px-4 py-4 transition-all ${isActive
                                                        ? "border-[var(--site-secondary)]/35 bg-[var(--site-secondary)]/10 shadow-[0_20px_35px_rgba(var(--site-secondary-rgb),0.14)]"
                                                        : "border-slate-200/75 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${isCompleted
                                                            ? "bg-[var(--site-secondary)] text-white"
                                                            : isActive
                                                                ? "bg-white text-[var(--site-secondary)] dark:bg-slate-950"
                                                                : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
                                                            }`}>
                                                            {isCompleted ? <Check size={16} /> : stepIndex}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 dark:text-white">{title}</p>
                                                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-5 overflow-hidden rounded-[30px] border border-slate-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(240,249,255,0.78))] p-5 shadow-[0_24px_50px_rgba(148,163,184,0.18)] dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(8,16,24,0.95),rgba(13,24,34,0.92))]">
                                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-full border-[8px] border-white bg-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.18)] dark:border-[#081018] dark:bg-slate-900">
                                                    <Image
                                                        src={activePreview}
                                                        alt={user.fullName || "Avatar preview"}
                                                        fill
                                                        unoptimized
                                                        sizes="144px"
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/20 to-transparent" />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--site-secondary)] shadow-sm dark:bg-white/10">
                                                        <span>{uploadFile ? "Upload siap dipakai" : selectedPreset && selectedPreset !== currentAvatar ? "Preset baru dipilih" : "Avatar aktif"}</span>
                                                    </div>
                                                    <h4 className="mt-3 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                                        {user.fullName || user.username || "User"}
                                                    </h4>
                                                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                        {uploadFile
                                                            ? "Hasil crop sudah masuk ke preview. Kamu masih bisa crop ulang sebelum menyimpan."
                                                            : selectedPreset && selectedPreset !== currentAvatar
                                                                ? "Preset yang dipilih sudah tampil di preview dan siap disimpan."
                                                                : "Pilih preset atau upload gambar baru untuk mulai mengganti avatar."}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-3 sm:min-w-[210px]">
                                                {uploadFile ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={handleReCrop}
                                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-[var(--site-secondary)]/30 hover:text-[var(--site-secondary)] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/20"
                                                        >
                                                            <RefreshCcw size={16} />
                                                            <span>Crop Ulang</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--site-secondary)] to-[var(--site-accent)] px-4 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(var(--site-secondary-rgb),0.22)] transition hover:scale-[1.01]"
                                                        >
                                                            <Upload size={16} />
                                                            <span>Ganti File</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="rounded-[24px] border border-dashed border-slate-300/80 bg-white/60 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                                            Status
                                                        </p>
                                                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                                                            {selectedPreset ? "Preset avatar siap dipakai." : "Belum ada perubahan. Pilih preset atau upload gambar baru."}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                                setIsDragging(true);
                                            }}
                                            onDragLeave={() => setIsDragging(false)}
                                            onDrop={handleDrop}
                                            className={`group relative overflow-hidden rounded-[28px] border border-dashed px-5 py-6 text-left transition-all ${isDragging
                                                ? "border-[var(--site-secondary)] bg-[var(--site-secondary)]/10 shadow-[0_22px_40px_rgba(var(--site-secondary-rgb),0.16)]"
                                                : "border-slate-300/80 bg-white/75 hover:border-[var(--site-secondary)]/40 hover:shadow-[0_20px_40px_rgba(148,163,184,0.16)] dark:border-white/10 dark:bg-white/[0.03]"
                                                }`}
                                        >
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_70%)] opacity-0 transition-opacity group-hover:opacity-100" />
                                            <div className="relative">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--site-secondary)]/12 text-[var(--site-secondary)]">
                                                    <ImagePlus size={24} />
                                                </div>
                                                <h5 className="mt-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                                    Upload dan crop avatar
                                                </h5>
                                                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                    Drag and drop gambar ke sini atau klik untuk memilih dari device. Setelah itu gambar otomatis masuk ke mode crop.
                                                </p>
                                                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:bg-white/10 dark:text-slate-300">
                                                    <Upload size={12} />
                                                    <span>PNG, JPG, WEBP hingga 10MB</span>
                                                </div>
                                            </div>
                                        </button>

                                        <div className="rounded-[28px] border border-slate-200/75 bg-slate-50/75 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--site-accent)]/12 text-[var(--site-accent)]">
                                                    <Camera size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                                        Tips cepat
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                                                        Fokuskan wajah di tengah agar avatar tetap jelas di ukuran kecil.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                <div className="rounded-2xl bg-white/80 px-4 py-3 dark:bg-white/[0.04]">
                                                    Pilih preset kalau ingin hasil instan tanpa upload.
                                                </div>
                                                <div className="rounded-2xl bg-white/80 px-4 py-3 dark:bg-white/[0.04]">
                                                    Upload manual akan otomatis masuk ke mode crop sebelum bisa disimpan.
                                                </div>
                                                <div className="rounded-2xl bg-white/80 px-4 py-3 dark:bg-white/[0.04]">
                                                    Kalau framing belum pas, pakai tombol `Crop Ulang`.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>

                                <div className="px-5 py-5 sm:px-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                                                Preset Avatar
                                            </p>
                                            <h4 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                                Pilih gaya yang paling cocok
                                            </h4>
                                        </div>

                                        <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                                            {DEFAULT_PROFILE_PICTURES.length} pilihan
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-4">
                                        {DEFAULT_PROFILE_PICTURES.map((avatar, index) => {
                                            const isSelected = !uploadFile && selectedPreset === avatar;

                                            return (
                                                <button
                                                    key={avatar}
                                                    type="button"
                                                    onClick={() => handlePresetSelect(avatar)}
                                                    className={`group overflow-hidden rounded-[26px] border text-left transition-all ${isSelected
                                                        ? "border-[var(--site-secondary)] bg-[var(--site-secondary)]/10 shadow-[0_22px_40px_rgba(var(--site-secondary-rgb),0.18)]"
                                                        : "border-slate-200/80 bg-white/80 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_40px_rgba(148,163,184,0.18)] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
                                                        }`}
                                                >
                                                    <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900">
                                                        <Image
                                                            src={avatar}
                                                            alt={`Preset avatar ${index + 1}`}
                                                            fill
                                                            sizes="(max-width: 1024px) 50vw, 240px"
                                                            className="object-cover transition duration-300 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/28 to-transparent" />

                                                        {isSelected && (
                                                            <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--site-secondary)] text-white shadow-lg">
                                                                <Check size={16} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="px-4 py-4">
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">
                                                            Avatar {index + 1}
                                                        </p>
                                                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                                            {isSelected ? "Sedang tampil di preview." : "Klik untuk langsung pakai preset ini."}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-5 rounded-[26px] border border-dashed border-slate-300/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                        <p className="text-sm font-black text-slate-800 dark:text-white">
                                            Ingin hasil paling personal?
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                            Upload gambar sendiri untuk mendapatkan avatar yang lebih unik. Setelah upload, kamu bisa crop sampai komposisinya terasa pas.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-slate-200/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/10">
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {hasPendingChanges
                                        ? "Perubahan avatar sudah siap disimpan."
                                        : "Belum ada perubahan. Pilih preset atau upload gambar untuk mulai."}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
                                        disabled={isSaving}
                                    >
                                        Tutup
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isSaving || !hasPendingChanges}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--site-secondary)] to-[var(--site-accent)] px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(var(--site-secondary-rgb),0.26)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        <span>{isSaving ? "Menyimpan..." : "Simpan Avatar"}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {cropImageSrc && (
                            <ImageCropper
                                imageSrc={cropImageSrc}
                                aspect={1}
                                cropShape="round"
                                objectFit="cover"
                                title="Crop foto profil"
                                description="Geser foto ke posisi terbaik lalu atur zoom sampai framing wajah terasa pas."
                                helperText="Frame bulat ini akan menjadi tampilan utama foto profilmu di dashboard dan halaman profile."
                                confirmLabel="Gunakan Hasil Crop"
                                cancelLabel="Kembali ke Editor"
                                onCancel={() => setCropImageSrc(null)}
                                onCropComplete={handleCropComplete}
                            />
                        )}
                    </div>
                </Portal>
            )}
        </AnimatePresence>
    );
}
