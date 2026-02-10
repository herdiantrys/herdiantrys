"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useEffect, useCallback, useState, useRef } from "react";
import Link from "next/link";

interface MediaItem {
    type: 'image' | 'video' | 'file';
    url: string;
}

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    media: MediaItem[];
    currentIndex: number;
    onNext: () => void;
    onPrev: () => void;
    onJump?: (index: number) => void;
}

import { ZoomableImage } from "@/components/ui/ZoomableImage";

export default function Lightbox({ isOpen, onClose, media, currentIndex, onNext, onPrev, onJump }: LightboxProps) {
    // Media Item Selection
    const currentMedia = media[currentIndex];
    const isVideo = currentMedia.type === 'video' || (currentMedia.url && currentMedia.url.endsWith('.mp4'));

    // Reset logic handled internally by sub-components or by key changing

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight") onNext();
        if (e.key === "ArrowLeft") onPrev();
    }, [isOpen, onClose, onNext, onPrev]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    if (!isOpen || !media || media.length === 0) return null;

    // Helper to resolve url
    const resolveUrl = (item: MediaItem) => item.url;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col"
                    onClick={onClose}
                >
                    {/* --- TOP CONTROL BAR --- */}
                    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-50 pointer-events-none">
                        <div className="flex items-center gap-3 pointer-events-auto">
                            <span className="text-white/80 font-medium text-sm tracking-widest uppercase">
                                Gallery
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs border border-white/5">
                                {currentIndex + 1} / {media.length}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 pointer-events-auto">
                            <Link
                                href={resolveUrl(currentMedia)}
                                target="_blank"
                                download
                                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 hover:border-white/20 group"
                                onClick={(e) => e.stopPropagation()}
                                title="Download / Open Original"
                            >
                                <Download size={18} className="opacity-70 group-hover:opacity-100" />
                            </Link>
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-full bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 transition-colors border border-white/5 hover:border-red-500/30 group"
                            >
                                <X size={18} className="opacity-70 group-hover:opacity-100" />
                            </button>
                        </div>
                    </div>

                    {/* --- MAIN STAGE --- */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden w-full">

                        {/* Prev Button (Desktop) */}
                        {media.length > 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                                className="absolute left-6 z-40 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all hidden md:flex items-center justify-center group"
                            >
                                <ChevronLeft size={40} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                        )}

                        {/* Content */}
                        <div className="w-full h-full p-4 md:p-10 flex items-center justify-center">
                            {/* Animate change */}
                            <motion.div
                                className="relative w-full h-full flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                key={currentIndex}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isVideo ? (
                                    <div className="relative w-full h-full max-w-7xl flex items-center justify-center">
                                        <video
                                            src={resolveUrl(currentMedia)}
                                            controls
                                            autoPlay
                                            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain bg-black"
                                        />
                                    </div>
                                ) : (
                                    <ZoomableImage src={resolveUrl(currentMedia)} alt="Gallery Image" />
                                )}
                            </motion.div>
                        </div>

                        {/* Next Button (Desktop) */}
                        {media.length > 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onNext(); }}
                                className="absolute right-6 z-40 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all hidden md:flex items-center justify-center group"
                            >
                                <ChevronRight size={40} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}

                        {/* Mobile Click Nav Areas */}
                        <div className="md:hidden absolute inset-y-0 left-0 w-1/4 z-30" onClick={(e) => { e.stopPropagation(); onPrev(); }} />
                        <div className="md:hidden absolute inset-y-0 right-0 w-1/4 z-30" onClick={(e) => { e.stopPropagation(); onNext(); }} />
                    </div>

                    {/* --- BOTTOM THUMBNAIL STRIP --- */}
                    {media.length > 1 && (
                        <div className="h-24 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-center px-4 py-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-3 overflow-x-auto max-w-full pb-2 custom-scrollbar px-4">
                                {media.map((item, idx) => {
                                    const isActive = idx === currentIndex;
                                    const isItemVideo = item.type === 'video' || (item.url && item.url.endsWith('.mp4'));
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => onJump?.(idx)}
                                            className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 group ${isActive ? 'border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] scale-110' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}`}
                                        >
                                            {isItemVideo ? (
                                                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center bg-black/40">
                                                        {/* Play Icon fallback */}
                                                        <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <Image
                                                    src={resolveUrl(item)}
                                                    alt={`Thumb ${idx}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
