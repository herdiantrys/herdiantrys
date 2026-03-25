"use client";

import { useCallback, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { motion } from "framer-motion";
import { Check, Loader2, RotateCcw, X, ZoomIn } from "lucide-react";
import { Portal } from "@/components/Portal";

type CropShape = "rect" | "round";
type CropperObjectFit = "contain" | "horizontal-cover" | "vertical-cover" | "cover";

type ImageCropperProps = {
    imageSrc: string;
    aspect?: number;
    cropShape?: CropShape;
    objectFit?: CropperObjectFit;
    minZoom?: number;
    maxZoom?: number;
    title?: string;
    description?: string;
    helperText?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onCancel: () => void;
    onCropComplete: (croppedImage: Blob) => void;
};

export default function ImageCropper({
    imageSrc,
    aspect = 3 / 1,
    cropShape = "rect",
    objectFit = "horizontal-cover",
    minZoom = 1,
    maxZoom = 3,
    title = "Adjust Image",
    description = "Geser posisi gambar dan atur zoom sampai framing terasa pas.",
    helperText = "Tip: gunakan slider zoom untuk menonjolkan area yang paling penting.",
    confirmLabel = "Apply Crop",
    cancelLabel = "Cancel",
    onCancel,
    onCropComplete,
}: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(minZoom);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isApplying, setIsApplying] = useState(false);

    const zoomLabel = useMemo(() => `${Math.round(zoom * 100)}%`, [zoom]);
    const cropModeLabel = cropShape === "round" ? "Round Crop" : "Free Crop";

    const handleCropComplete = useCallback((_croppedArea: Area, nextCroppedAreaPixels: Area) => {
        setCroppedAreaPixels(nextCroppedAreaPixels);
    }, []);

    const resetView = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(minZoom);
    };

    const createCroppedImage = async () => {
        if (!croppedAreaPixels) return;

        setIsApplying(true);

        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImageBlob) {
                onCropComplete(croppedImageBlob);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[11000] flex items-center justify-center p-3 sm:p-5">
                <motion.button
                    type="button"
                    aria-label="Close cropper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                    className="absolute inset-0 bg-slate-950/82 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="relative flex h-[min(92vh,760px)] w-full max-w-4xl flex-col overflow-hidden rounded-[34px] border border-white/55 bg-white/92 shadow-[0_40px_90px_rgba(15,23,42,0.3)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#071018]/94"
                >
                    <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.2),_transparent_68%)] pointer-events-none" />

                    <div className="relative flex items-start justify-between gap-4 border-b border-slate-200/70 px-5 py-5 sm:px-6 dark:border-white/10">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                                <span>{cropModeLabel}</span>
                                <span className="h-1 w-1 rounded-full bg-[var(--site-secondary)]" />
                                <span>Interactive Preview</span>
                            </div>
                            <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                                {title}
                            </h3>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                                {description}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-full border border-slate-200 bg-white/80 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="grid flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="relative min-h-[360px] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_rgba(15,23,42,0.88))] dark:bg-[radial-gradient(circle_at_top,_rgba(30,41,59,0.9),_rgba(2,6,23,1))]">
                            <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />

                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspect}
                                cropShape={cropShape}
                                showGrid={false}
                                objectFit={objectFit}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={handleCropComplete}
                            />
                        </div>

                        <div className="relative flex flex-col border-t border-slate-200/70 bg-white/78 px-5 py-5 sm:px-6 lg:border-l lg:border-t-0 dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="rounded-[26px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_16px_36px_rgba(148,163,184,0.18)] dark:border-white/10 dark:bg-[#0b1722]">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                                            Zoom
                                        </p>
                                        <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                                            {zoomLabel}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={resetView}
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
                                    >
                                        <RotateCcw size={14} />
                                        <span>Reset</span>
                                    </button>
                                </div>

                                <div className="mt-4 flex items-center gap-3">
                                    <ZoomIn size={18} className="text-[var(--site-secondary)]" />
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={minZoom}
                                        max={maxZoom}
                                        step={0.05}
                                        aria-label="Zoom"
                                        onChange={(event) => setZoom(Number(event.target.value))}
                                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[var(--site-secondary)] dark:bg-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 rounded-[26px] border border-dashed border-slate-300/80 bg-slate-50/85 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                                    Panduan
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    {helperText}
                                </p>
                                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                    Area yang ada di dalam frame akan menjadi avatar final setelah kamu menekan tombol simpan.
                                </p>
                            </div>

                            <div className="mt-auto flex flex-col gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={createCroppedImage}
                                    disabled={isApplying}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--site-secondary)] to-[var(--site-accent)] px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(var(--site-secondary-rgb),0.28)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isApplying ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    <span>{isApplying ? "Memproses..." : confirmLabel}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
                                >
                                    {cancelLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Portal>
    );
}

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
): Promise<Blob | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return null;
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((file) => {
            if (file) resolve(file);
            else reject(new Error("Canvas is empty"));
        }, "image/jpeg", 0.95);
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });
}
