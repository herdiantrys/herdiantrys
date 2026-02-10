"use client";

import { useState, useEffect, useOptimistic, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Play, Eye, Heart, Video, Image as ImageIcon, MessageCircle, Bookmark } from "lucide-react";
import { toggleLike } from "@/actions/toggleLike";
import { toggleBookmark } from "@/lib/actions/bookmark.actions";
import { formatViewCount } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { urlFor } from "@/sanity/lib/image";

export type Project = {
    id: string | number;
    title: string;
    slug: { current: string } | string;
    category: string;
    thumbnail: string;
    image: string;
    videoFile?: string; // Added videoFile
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
    comments?: number;
};

export const ProjectCard = ({ project, onClick, initialIsBookmarked = false }: { project: Project; onClick: () => void, initialIsBookmarked?: boolean }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

    // Priority: Thumbnail -> Image -> VideoFile -> First gallery item -> Empty
    const getInitialMedia = () => {
        if (project.thumbnail) return { type: 'image' as const, url: project.thumbnail };
        if (project.image) return { type: 'image' as const, url: project.image };
        if (project.videoFile) return { type: 'video' as const, url: project.videoFile };
        return { type: 'image' as const, url: "" };
    };

    const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; url: string }>(getInitialMedia());

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

    const handleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session) {
            return;
        }

        const newIsBookmarked = !isBookmarked;
        setIsBookmarked(newIsBookmarked);

        if (session.user?.id) {
            const result = await toggleBookmark(session.user.id, String(project.id));
            if (!result.success) {
                setIsBookmarked(!newIsBookmarked);
            }
        }
    };

    // Reset active media when project changes
    useEffect(() => {
        const initial = getInitialMedia();
        setActiveMedia(initial);
        // If no URL to load, stop loading immediately
        if (!initial.url && !project.thumbnail && !project.image) {
            setIsLoading(false);
        }
    }, [project]);

    // Handle hover to show video preview if available
    const [isHovered, setIsHovered] = useState(false);

    const handleThumbnailClick = (e: React.MouseEvent, media: { type: 'image' | 'video'; url: string }) => {
        e.stopPropagation();
        setActiveMedia(media);
    };

    const allMedia = [
        // Main Media
        {
            type: project.type,
            url: project.type === 'video' && project.videoFile ? project.videoFile : (project.thumbnail || project.image || project.videoFile || "")
        },
        ...(project.gallery || []).map(item => ({ type: item.type, url: item.url }))
    ];

    const showVideoPreview = isHovered && project.type === 'video' && project.videoFile;

    return (
        <motion.div
            layoutId={`card-${project.id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative cursor-pointer"
        >
            <div
                className="glass-liquid relative shadow-sm transition-all hover:shadow-md hover:scale-[1.01] overflow-hidden break-inside-avoid mb-6 rounded-xl"
            >
                {/* Media Type Indicator Badge */}
                <div className="absolute top-3 right-3 z-20 flex gap-2">
                    <button
                        onClick={handleBookmark}
                        className={`w-8 h-8 rounded-full glass flex items-center justify-center backdrop-blur-md border shadow-lg transition-colors ${isBookmarked
                            ? "bg-teal-500 border-teal-400 text-white"
                            : "bg-black/40 border-white/20 text-white hover:bg-black/60"
                            }`}
                    >
                        <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
                    </button>
                    <div className="w-8 h-8 rounded-full glass flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 shadow-lg text-white">
                        {project.type === 'video' ? (
                            <Video size={14} />
                        ) : (
                            <ImageIcon size={14} />
                        )}
                    </div>
                </div>

                {/* Skeleton Loader */}
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-800 animate-pulse z-10 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Always render Image (or fallback) to set dimensions and prevent layout shift */}
                {activeMedia.url && activeMedia.type !== 'video' ? (
                    <img
                        src={activeMedia.url}
                        alt={project.title}
                        onLoad={() => setIsLoading(false)}
                        className="w-full h-auto object-cover"
                    />
                ) : project.thumbnail || project.image ? (
                    // If active media is video, we still render the thumbnail image underneath to hold height
                    <img
                        src={project.thumbnail || project.image}
                        alt={project.title}
                        onLoad={() => setIsLoading(false)}
                        className="w-full h-auto object-cover"
                    />
                ) : (
                    <div className="w-full h-64 bg-gray-900 flex items-center justify-center">
                        <ImageIcon className="text-gray-700" size={48} />
                    </div>
                )}


                {/* Video Preview Overlay */}
                {((activeMedia.type === "video" && activeMedia.url) || (showVideoPreview && project.videoFile)) && (
                    <div className="absolute inset-0 z-10 bg-black">
                        <video
                            src={activeMedia.type === 'video' ? activeMedia.url : project.videoFile}
                            autoPlay
                            muted
                            loop
                            playsInline
                            onLoadedData={() => setIsLoading(false)}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                )}

                {/* Play Icon for Videographer (only if not playing) */}
                {project.type === 'video' && !showVideoPreview && activeMedia.type !== 'video' && !isLoading && (
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
                            <span className="flex items-center gap-1">
                                <MessageCircle size={14} /> {project.comments || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
