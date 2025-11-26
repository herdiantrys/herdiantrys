"use client";

import { useState, useRef, useEffect, useOptimistic, startTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, ExternalLink, Play, Eye, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { toggleLike } from "@/actions/toggleLike";
import { incrementView } from "@/actions/incrementView";
import { formatViewCount } from "@/lib/utils";

const Portal = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    return mounted ? createPortal(children, document.body) : null;
};

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





const ModalVideoPlayer = ({ src }: { src: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    return (
        <div className="w-full h-full relative bg-black group">
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                controls
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer z-10"
                    onClick={handlePlayPause}
                >
                    <div className="w-20 h-20 rounded-full glass flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/30 hover:scale-110 transition-transform duration-300">
                        <Play size={32} className="text-white fill-white ml-2" />
                    </div>
                </div>
            )}
        </div>
    );
};

const ZoomableImage = ({ src, alt }: { src: string; alt: string }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [constraints, setConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const updateConstraints = (newScale: number) => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            const x = (width * newScale - width) / 2;
            const y = (height * newScale - height) / 2;
            setConstraints({ left: -x, right: x, top: -y, bottom: y });
        }
    };

    const clampPosition = (x: number, y: number, newScale: number) => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            const maxX = (width * newScale - width) / 2;
            const maxY = (height * newScale - height) / 2;
            return {
                x: Math.min(Math.max(x, -maxX), maxX),
                y: Math.min(Math.max(y, -maxY), maxY)
            };
        }
        return { x, y };
    };

    const handleZoomIn = () => {
        setScale((s) => {
            const newScale = Math.min(s + 0.5, 4);
            updateConstraints(newScale);
            return newScale;
        });
    };

    const handleZoomOut = () => {
        setScale((s) => {
            const newScale = Math.max(s - 0.5, 1);
            updateConstraints(newScale);
            if (newScale === 1) setPosition({ x: 0, y: 0 });
            return newScale;
        });
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setConstraints({ left: 0, right: 0, top: 0, bottom: 0 });
    };

    // Update constraints on mount and resize
    useEffect(() => {
        updateConstraints(scale);
        window.addEventListener('resize', () => updateConstraints(scale));
        return () => window.removeEventListener('resize', () => updateConstraints(scale));
    }, [scale]);

    // Handle scroll to zoom
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY * -0.01;
            const newScale = Math.min(Math.max(scale + delta, 1), 4);

            if (newScale === 1) {
                setPosition({ x: 0, y: 0 });
            } else {
                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left - rect.width / 2;
                const mouseY = e.clientY - rect.top - rect.height / 2;

                // Calculate new position to keep mouse over same point
                const scaleRatio = newScale / scale;
                const newX = mouseX - (mouseX - position.x) * scaleRatio;
                const newY = mouseY - (mouseY - position.y) * scaleRatio;

                const clamped = clampPosition(newX, newY, newScale);
                setPosition(clamped);
            }

            setScale(newScale);
            updateConstraints(newScale);
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [scale, position]);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center group">
            <motion.div
                drag={scale > 1}
                dragConstraints={constraints}
                dragElastic={0.2}
                animate={{ scale: scale, x: position.x, y: position.y }}
                onDragEnd={(e, { offset }) => {
                    setPosition((prev) => {
                        const newX = prev.x + offset.x;
                        const newY = prev.y + offset.y;
                        return clampPosition(newX, newY, scale);
                    });
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                style={{ cursor: scale > 1 ? "grab" : "default" }}
            >
                <div className="relative w-full h-full">
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-contain pointer-events-none"
                    />
                </div>
            </motion.div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full glass bg-black/50 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button
                    onClick={handleZoomOut}
                    className="p-2 rounded-full hover:bg-white/20 text-white transition-colors disabled:opacity-50"
                    disabled={scale <= 1}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                </button>
                <span className="text-xs font-medium text-white min-w-[3ch] text-center">
                    {Math.round(scale * 100)}%
                </span>
                <button
                    onClick={handleZoomIn}
                    className="p-2 rounded-full hover:bg-white/20 text-white transition-colors disabled:opacity-50"
                    disabled={scale >= 4}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                </button>
                <div className="w-px h-4 bg-white/20 mx-1" />
                <button
                    onClick={handleReset}
                    className="p-2 rounded-full hover:bg-white/20 text-white transition-colors text-xs font-medium"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

const ProjectCard = ({ project, onClick }: { project: Project; onClick: () => void }) => {
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
                <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 block">
                            {project.category}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>

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

const ProjectModalContent = ({ project, onClose }: { project: Project; onClose: () => void }) => {
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
            className="relative w-[80vw] h-[80vh] glass bg-[var(--glass-bg)] border-[var(--glass-border)] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
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
                className="w-full md:max-w-[80%] relative h-64 md:h-auto bg-black flex flex-col group/media"
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
                            <span className="text-[var(--glass-text-muted)]">Album</span>
                            <span className="text-[var(--glass-text)] font-medium">{project.album || "-"}</span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--glass-border)] pb-2">
                            <span className="text-[var(--glass-text-muted)]">Year</span>
                            <span className="text-[var(--glass-text)] font-medium">
                                {project.uploadDate ? new Date(project.uploadDate).getFullYear() : new Date().getFullYear()}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-[var(--glass-border)] pb-2 items-center">
                            <span className="text-[var(--glass-text-muted)]">Stats</span>
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
                    View Project <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </motion.div>
        </motion.div>
    );
};

const GlassPortfolio = ({ projects }: { projects: Project[] }) => {
    const [selectedId, setSelectedId] = useState<string | number | null>(null);
    const [activeCategory, setActiveCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    // Derive unique categories from projects
    const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

    const filteredProjects = activeCategory === "All"
        ? projects
        : projects.filter(project => project.category === activeCategory);

    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory]);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedId !== null) {
                setSelectedId(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedId]);

    return (
        <section className="py-20 relative z-10">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[var(--glass-text)]">Selected Works</h2>
                    <p className="text-[var(--glass-text-muted)] max-w-2xl mx-auto mb-8">
                        A curated collection of projects across various disciplines.
                    </p>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${activeCategory === category
                                    ? "bg-[var(--glass-text)] text-[var(--background)] border-[var(--glass-text)] shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                    : "glass text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] border-[var(--glass-border)] hover:border-[var(--glass-text)]"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {paginatedProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => setSelectedId(project.id)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-16 flex justify-center items-center gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-3 rounded-full glass hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${currentPage === page
                                        ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg"
                                        : "glass text-gray-400 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-3 rounded-full glass hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}

                <AnimatePresence>
                    {selectedId && (
                        <Portal>
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedId(null)}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                />

                                {(() => {
                                    const project = projects.find((p) => p.id === selectedId);
                                    if (!project) return null;

                                    return <ProjectModalContent project={project} onClose={() => setSelectedId(null)} />;
                                })()}
                            </div>
                        </Portal>
                    )}
                </AnimatePresence>
            </div>
        </section >
    );
};

export default GlassPortfolio;
