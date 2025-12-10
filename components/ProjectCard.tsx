"use client";

import { useState, useEffect, useOptimistic, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Play, Eye, Heart, Video, Image as ImageIcon } from "lucide-react";
import { toggleLike } from "@/actions/toggleLike";
import { formatViewCount } from "@/lib/utils";

export type Project = {
    id: string | number;
    title: string;
    slug: { current: string };
    category: string;
    thumbnail: string;
    image: string;
    description: string;
    type: "image" | "video";
    album?: string;
    uploadDate?: string;
    views?: number;
    likes?: number;
    favorite?: boolean;
    tags?: string[];
    gallery?: { type: 'image' | 'video'; url: string }[];
    isLiked?: boolean;
};

export const ProjectCard = ({ project, onClick }: { project: Project; onClick: () => void }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; url: string }>({
        type: project.type,
        url: project.type === 'video' ? project.image : project.thumbnail
    });

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
            // If failed (e.g. not logged in), the UI will revert on next revalidation
            // But we can also show an alert
            if (result.error === "Failed to toggle like") {
                // alert("Please login to like projects");
            }
        }
    };

    // Reset active media when project changes or on unmount
    useEffect(() => {
        setActiveMedia({
            type: project.type,
            url: project.type === 'video' ? project.image : project.thumbnail
        });
    }, [project]);

    const handleThumbnailClick = (e: React.MouseEvent, media: { type: 'image' | 'video'; url: string }) => {
        e.stopPropagation(); // Prevent opening the modal
        setActiveMedia(media);
    };

    const allMedia = [
        { type: project.type, url: project.type === 'video' ? project.image : project.thumbnail },
        ...(project.gallery || []).map(item => ({ type: item.type, url: item.url }))
    ];

    return (
        <motion.div
            layoutId={`card-${project.id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            className="group relative cursor-pointer"
        >
            <div className="glass rounded-2xl overflow-hidden aspect-[4/3] relative border-[var(--glass-border)] bg-[var(--glass-bg)]">
                {/* Media Type Indicator Badge */}
                <div className="absolute top-3 right-3 z-20">
                    <div className="w-8 h-8 rounded-full glass flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 shadow-lg">
                        {project.type === 'video' ? (
                            <Video size={14} className="text-white" />
                        ) : (
                            <ImageIcon size={14} className="text-white" />
                        )}
                    </div>
                </div>

                {/* Skeleton Loader */}
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-800 animate-pulse z-10 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                    </div>
                )}

                {activeMedia.type === "video" ? (
                    <video
                        src={activeMedia.url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        onLoadedData={() => setIsLoading(false)}
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    />
                ) : (
                    <Image
                        src={activeMedia.url}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onLoad={() => setIsLoading(false)}
                        className={`object-cover transition-transform duration-700 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    />
                )}

                {/* Play Icon for Videographer (only if main thumb is video) */}
                {project.category === "Videographer" && activeMedia.type === 'video' && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="w-12 h-12 rounded-full glass flex items-center justify-center bg-black/30 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                            <Play size={20} className="text-white fill-white ml-1" />
                        </div>
                    </div>
                )}

                {/* Content Overlay */}
                <div className="absolute inset-0 p-3 md:p-6 flex flex-col justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <div className="transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-[10px] md:text-xs font-bold text-teal-400 uppercase tracking-wider mb-1 md:mb-2 block">
                            {project.category}
                        </span>
                        <h3 className="text-sm md:text-xl font-bold text-white mb-1 leading-tight">{project.title}</h3>

                        {/* Gallery Preview Thumbnails */}
                        {allMedia.length > 1 && (
                            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide" onClick={(e) => e.stopPropagation()}>
                                {allMedia.slice(0, 5).map((media, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => handleThumbnailClick(e, media)}
                                        className={`relative w-12 h-8 rounded overflow-hidden border transition-all flex-shrink-0 ${activeMedia.url === media.url ? 'border-teal-500 scale-110' : 'border-white/30 hover:border-white/80'}`}
                                    >
                                        {media.type === 'video' ? (
                                            <video src={media.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <Image src={media.url} alt={`Thumb ${idx}`} fill className="object-cover" />
                                        )}
                                    </button>
                                ))}
                                {allMedia.length > 5 && (
                                    <div className="w-12 h-8 rounded bg-black/50 border border-white/30 flex items-center justify-center text-[10px] text-white flex-shrink-0">
                                        +{allMedia.length - 5}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-300 mt-3">
                            <span className="flex items-center gap-1">
                                <Eye size={14} /> {formatViewCount(project.views || 0)}
                            </span>
                            <button
                                onClick={handleLike}
                                className="flex items-center gap-1 hover:text-red-500 transition-colors"
                            >
                                <Heart size={14} className={optimisticProject.isLiked ? "fill-red-500 text-red-500" : ""} /> {optimisticProject.likes || 0}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
