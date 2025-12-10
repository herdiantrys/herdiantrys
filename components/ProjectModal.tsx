"use client";

import { useState, useRef, useEffect, useOptimistic, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, ExternalLink, Play, Eye, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { toggleLike } from "@/actions/toggleLike";
import { incrementView } from "@/actions/incrementView";
import { formatViewCount } from "@/lib/utils";
import { ModalVideoPlayer } from "@/components/ui/ModalVideoPlayer";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { Project } from "@/components/ProjectCard";

export const ProjectModal = ({ project, onClose, dict }: { project: Project; onClose: () => void, dict: any }) => {
    const allMedia = [
        { type: project.type, url: project.image },
        ...(project.gallery || []).map(item => ({ type: item.type, url: item.url }))
    ];

    const [optimisticProject, addOptimisticProject] = useOptimistic(
        project,
        (state, newLikeStatus: { likes: number; isLiked: boolean }) => ({
            ...state,
            ...newLikeStatus,
        })
    );

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();

        const newIsLiked = !optimisticProject.isLiked;
        const newLikes = newIsLiked ? (optimisticProject.likes || 0) + 1 : (optimisticProject.likes || 0) - 1;

        startTransition(() => {
            addOptimisticProject({ likes: newLikes, isLiked: newIsLiked });
        });

        const result = await toggleLike(String(project.id));

        if (!result.success) {
            if (result.error === "Failed to toggle like") {
                // alert("Please login to like projects");
            }
        }
    };

    const [currentIndex, setCurrentIndex] = useState(0);
    const activeMedia = allMedia[currentIndex];

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % allMedia.length);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Increment view on mount (once)
    const hasIncremented = useRef(false);
    useEffect(() => {
        if (!hasIncremented.current) {
            incrementView(String(project.id));
            hasIncremented.current = true;
        }
    }, [project.id]);

    return (
        <motion.div
            layoutId={`card-${project.id}`}
            className="relative w-[95vw] h-[90vh] md:w-[80vw] md:h-[80vh] glass bg-[var(--glass-bg)] border-[var(--glass-border)] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors border border-white/10"
            >
                <X size={24} />
            </button>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-full md:max-w-[80%] relative h-[40vh] md:h-auto bg-black flex flex-col group/media"
            >
                <div className="flex-1 relative w-full h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeMedia.url}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full"
                        >
                            {activeMedia.type === "video" ? (
                                <ModalVideoPlayer src={activeMedia.url} />
                            ) : (
                                <ZoomableImage src={activeMedia.url} alt={project.title} />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {allMedia.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover/media:opacity-100 z-10"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover/media:opacity-100 z-10"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>

                {/* Gallery Thumbnails */}
                {allMedia.length > 1 && (
                    <div className="h-24 bg-black/80 backdrop-blur-md border-t border-white/10 p-4 flex gap-4 overflow-x-auto">
                        {allMedia.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`relative w-24 h-full rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${currentIndex === index ? "border-teal-500" : "border-transparent opacity-60 hover:opacity-100"}`}
                            >
                                {item.type === 'video' ? (
                                    <video src={item.url} className="w-full h-full object-cover" />
                                ) : (
                                    <Image src={item.url} alt={`Thumb ${index}`} fill className="object-cover" />
                                )}
                                {item.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Play size={16} className="text-white fill-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-full md:w-[20%] min-w-[350px] p-8 flex flex-col justify-between overflow-y-auto bg-[var(--glass-bg)]"
            >
                <div>
                    <span className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-3 block">
                        {project.category}
                    </span>
                    {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {project.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/80 border border-white/10">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <h3 className="text-3xl font-bold text-[var(--glass-text)] mb-6">{project.title}</h3>
                    <p className="text-[var(--glass-text-muted)] leading-relaxed mb-8 text-lg">
                        {project.description}
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between border-b border-[var(--glass-border)] pb-2">
                            <span className="text-[var(--glass-text-muted)]">{dict.portfolio.album}</span>
                            <span className="text-[var(--glass-text)] font-medium">{project.album || "-"}</span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--glass-border)] pb-2">
                            <span className="text-[var(--glass-text-muted)]">{dict.portfolio.year}</span>
                            <span className="text-[var(--glass-text)] font-medium">
                                {project.uploadDate ? new Date(project.uploadDate).getFullYear() : new Date().getFullYear()}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--glass-border)] pb-2 items-center">
                            <span className="text-[var(--glass-text-muted)]">{dict.portfolio.stats}</span>
                            <div className="flex items-center gap-4 text-[var(--glass-text)] font-medium">
                                <span className="flex items-center gap-1"><Eye size={16} /> {formatViewCount(project.views || 0)}</span>

                                <motion.button
                                    onClick={handleLike}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 group ${optimisticProject.isLiked
                                        ? "bg-red-500/10 border-red-500/50 text-red-500"
                                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"
                                        }`}
                                >
                                    <div className="relative w-5 h-5">
                                        <AnimatePresence mode="wait">
                                            {optimisticProject.isLiked ? (
                                                <motion.div
                                                    key="liked"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                                    className="absolute inset-0"
                                                >
                                                    <Heart size={20} className="fill-red-500 text-red-500" />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="unliked"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                                    className="absolute inset-0"
                                                >
                                                    <Heart size={20} className="text-[var(--glass-text)] group-hover:text-red-400 transition-colors" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <span className="text-lg font-bold min-w-[1ch] text-center">
                                        {optimisticProject.likes || 0}
                                    </span>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

                <Link href={`/projects/${project.slug?.current}`} className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 group">
                    {dict.portfolio.view_project} <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </motion.div>
        </motion.div>
    );
};
