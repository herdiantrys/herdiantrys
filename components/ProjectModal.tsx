"use client";

import { useState, useRef, useEffect, useOptimistic, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, ExternalLink, Play, Eye, Heart, ChevronLeft, ChevronRight, MessageCircle, Share2, Loader2, User } from "lucide-react";
import { toggleLike } from "@/lib/actions/like.actions";
import { incrementView } from "@/actions/incrementView";
import { formatViewCount } from "@/lib/utils";
import { ModalVideoPlayer } from "@/components/ui/ModalVideoPlayer";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { Project } from "@/components/ProjectCard";
import { ShareModal } from "@/components/ShareModal";
import { getComments, Comment, createComment } from "@/lib/actions/comment.actions"; // Imported createComment

export const ProjectModal = ({ project, onClose, dict, initialIsBookmarked }: { project: Project; onClose: () => void, dict: any, initialIsBookmarked?: boolean }) => {
    // Determine the main media type and URL.
    // If it's a video project but no video file is available, fall back to treating it as an image (thumbnail).
    const initialUrl = (project.type === 'video' && project.videoFile) ? project.videoFile : project.image;
    // Force type to 'image' if type is video but no videoFile exists, to prevent broken player.
    const initialType = (project.type === 'video' && !project.videoFile) ? 'image' : project.type;

    const allMedia = [
        {
            type: initialType,
            url: initialUrl
        },
        ...(project.gallery || []).map(item => ({ type: item.type, url: item.url }))
    ];

    const [optimisticProject, addOptimisticProject] = useOptimistic(
        project,
        (state, newLikeStatus: { likes: number; isLiked: boolean }) => ({
            ...state,
            ...newLikeStatus,
        })
    );

    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isPostingComment, setIsPostingComment] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            setIsLoadingComments(true);
            const fetchedComments = await getComments(String(project.id), "project");
            setComments(fetchedComments);
            setIsLoadingComments(false);
        };
        fetchComments();
    }, [project.id]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isPostingComment) return;

        setIsPostingComment(true);
        try {
            const result = await createComment(String(project.id), "project", newComment);
            // @ts-ignore
            if (result.success && result.comment) {
                // @ts-ignore
                setComments(prev => [result.comment, ...prev]);
                setNewComment("");
            }
        } finally {
            setIsPostingComment(false);
        }
    };

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

    const [isShareOpen, setIsShareOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeMedia = allMedia[currentIndex];

    // Helper to get slug string safely
    // Since `Project` type in `ProjectCard.tsx` says `slug: { current: string }`, 
    // but Prisma returns string, we must handle both.
    const getSlug = (slug: any) => {
        if (typeof slug === 'string') return slug;
        return slug?.current || '';
    };

    const projectSlug = getSlug(project.slug);

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
                className="w-full md:w-[75%] relative h-[40vh] md:h-auto bg-black flex flex-col group/media"
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
                className="w-full md:w-[25%] min-w-[280px] p-6 flex flex-col relative overflow-hidden bg-white/80 dark:bg-black/40 backdrop-blur-2xl border-l border-white/20 dark:border-white/10"
            >
                {/* Decorative Liquid Gradient Background */}
                <div className="absolute top-0 right-0 w-[120%] h-[120%] bg-gradient-to-br from-teal-500/5 via-primary/5 to-purple-500/5 blur-3xl opacity-50 pointer-events-none -z-10" />

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shadow-[0_0_10px_rgba(45,212,191,0.1)] uppercase tracking-wider">
                                {project.category}
                            </span>
                            {project.album && (
                                <span className="text-xs font-medium text-[var(--glass-text-muted)] bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md border border-black/5 dark:border-white/5">
                                    {project.album}
                                </span>
                            )}
                        </div>

                        <h3 className="text-3xl md:text-3xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 dark:from-teal-400 dark:via-cyan-400 dark:to-indigo-400 leading-tight">
                            {project.title}
                        </h3>

                        {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.tags.map(tag => (
                                    <span key={tag} className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-black/5 dark:bg-white/5 text-[var(--glass-text)] border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-default">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 backdrop-blur-sm space-y-3 shadow-sm dark:shadow-inner">
                            <p className="text-[var(--glass-text-muted)] leading-relaxed text-sm">
                                {project.description}
                            </p>

                            <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-y-3 justify-between items-center text-xs">
                                <div className="flex items-center gap-3 text-[var(--glass-text-muted)]">
                                    <span className="flex items-center gap-1.5"><Eye size={14} className="text-teal-600 dark:text-teal-500" /> {formatViewCount(project.views || 0)}</span>
                                    <span className="flex items-center gap-1.5"><MessageCircle size={14} className="text-purple-600 dark:text-purple-500" /> {project.comments || 0}</span>
                                </div>
                                <span className="text-[var(--glass-text-muted)] opacity-75">
                                    {project.uploadDate ? new Date(project.uploadDate).toLocaleDateString() : new Date().getFullYear()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-3">
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-[var(--glass-text)] flex items-center gap-2">
                                <MessageCircle size={14} className="text-teal-500" />
                                Latest Comments
                            </h4>

                            {/* Comment Input */}
                            <form onSubmit={handlePostComment} className="relative group">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[var(--glass-text)] focus:outline-none focus:border-teal-500/50 focus:bg-white/10 dark:focus:bg-black/10 transition-all pr-10 hover:border-black/20 dark:hover:border-white/20"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || isPostingComment}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-teal-500 hover:bg-teal-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                >
                                    {isPostingComment ? <Loader2 size={16} className="animate-spin" /> : <div className="-rotate-90"><Share2 size={16} style={{ transform: "rotate(-90deg)" }} /></div>}
                                </button>
                            </form>
                        </div>

                        {isLoadingComments ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={20} className="text-teal-500 animate-spin" />
                            </div>
                        ) : comments.length > 0 ? (
                            <div className="space-y-3">
                                {comments.slice(0, 3).map((comment) => (
                                    <div key={comment._id} className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/5 flex gap-3 text-sm shadow-sm dark:shadow-none">
                                        <div className="shrink-0 relative">
                                            {comment.user.imageURL ? (
                                                <Link href={`/user/${comment.user.username}`} onClick={(e) => e.stopPropagation()}>
                                                    <Image
                                                        src={comment.user.imageURL}
                                                        alt={comment.user.username}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full object-cover border border-black/10 dark:border-white/10"
                                                    />
                                                </Link>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30">
                                                    <User size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <Link href={`/user/${comment.user.username}`} className="font-bold text-[var(--glass-text)] hover:text-teal-500 transition-colors" onClick={(e) => e.stopPropagation()}>
                                                    {comment.user.fullName}
                                                </Link>
                                                <span className="text-[10px] text-[var(--glass-text-muted)] opacity-60">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-[var(--glass-text-muted)] leading-snug text-xs">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {comments.length > 3 && (
                                    <Link href={`/projects/${projectSlug}`} className="block text-center text-xs text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors py-2">
                                        View all {comments.length} comments
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6 px-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 border-dashed">
                                <p className="text-xs text-[var(--glass-text-muted)]">No comments yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex flex-col gap-3 relative z-20">
                    <div className="flex items-center gap-3">
                        <Link href={`/projects/${projectSlug}`} className="flex-1 group relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-600 p-[1px] shadow-lg hover:shadow-teal-500/25 transition-all active:scale-[0.98]">
                            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-in-out -skew-x-12 origin-left z-20" />
                            <div className="relative h-10 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-[11px] flex items-center justify-center gap-2 px-6 transition-colors group-hover:bg-transparent">
                                <span className="font-bold text-white relative z-10 text-sm">{dict.portfolio.view_project}</span>
                                <ExternalLink size={16} className="text-white group-hover:translate-x-1 transition-transform relative z-10" />
                            </div>
                        </Link>

                        <button
                            onClick={() => setIsShareOpen(true)}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30 text-[var(--glass-text)] transition-all hover:rotate-12 hover:scale-105 active:scale-95"
                        >
                            <Share2 size={18} />
                        </button>

                        <motion.button
                            onClick={handleLike}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`h-10 min-w-[3rem] px-3 flex items-center justify-center gap-2 rounded-xl border transition-all duration-300 ${optimisticProject.isLiked
                                ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/30 text-[var(--glass-text)]"
                                }`}
                        >
                            <div className="relative w-4 h-4 flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    {optimisticProject.isLiked ? (
                                        <motion.div
                                            key="liked"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        >
                                            <Heart size={16} className="fill-red-500 text-red-500" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="unliked"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        >
                                            <Heart size={16} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <span className="font-bold text-xs">
                                {optimisticProject.likes || 0}
                            </span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isShareOpen && (
                    <ShareModal
                        isOpen={isShareOpen}
                        onClose={() => setIsShareOpen(false)}
                        url={`/projects/${projectSlug}`}
                        title={project.title}
                        description={project.description}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};
