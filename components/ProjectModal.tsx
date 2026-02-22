"use client";

import { useState, useRef, useEffect, useOptimistic, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, ExternalLink, Play, Eye, Heart, ChevronLeft, ChevronRight, MessageCircle, Share2, Loader2, User } from "lucide-react";
import { toggleLike } from "@/lib/actions/like.actions";
import { incrementView } from "@/actions/incrementView";
import { formatViewCount, formatDate } from "@/lib/utils";
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
            className="relative w-[95vw] h-[90vh] md:w-[85vw] md:h-[85vh] bg-black/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
        >
            <button
                onClick={onClose}
                className="absolute top-5 right-5 z-[50] p-2.5 rounded-full bg-black/20 hover:bg-red-500/80 text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-red-400 group/close backdrop-blur-md shadow-lg"
            >
                <X size={20} className="group-hover/close:rotate-90 transition-transform duration-300" />
            </button>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-full md:w-[70%] relative h-[40vh] md:h-auto bg-black/80 flex flex-col group/media border-r border-white/5"
            >
                <div className="flex-1 relative w-full h-full overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeMedia.url}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="w-full h-full rounded-tl-[2.5rem] md:rounded-bl-[2.5rem] overflow-hidden"
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
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/40 backdrop-blur-xl border border-white/20 p-2 rounded-2xl flex gap-3 shadow-2xl max-w-[90%] overflow-x-auto custom-scrollbar">
                        {allMedia.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`relative w-16 h-12 rounded-xl overflow-hidden transition-all duration-300 flex-shrink-0 ${currentIndex === index ? "ring-2 ring-[var(--site-secondary)] scale-110 shadow-[0_0_15px_rgba(20,184,166,0.4)]" : "opacity-50 hover:opacity-100 hover:scale-105"}`}
                            >
                                {item.type === 'video' ? (
                                    <video src={item.url} className="w-full h-full object-cover" />
                                ) : (
                                    <Image src={item.url} alt={`Thumb ${index}`} fill className="object-cover" />
                                )}
                                {item.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <Play size={14} className="text-white fill-white shadow-sm" />
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
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full md:w-[30%] min-w-[320px] p-8 flex flex-col relative overflow-hidden bg-white/5 dark:bg-white/5 backdrop-blur-3xl"
            >
                {/* Decorative Liquid Gradient Background */}
                <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-to-br from-[var(--site-secondary)]/20 via-primary/10 to-transparent blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '4s' }} />

                <div className="absolute bottom-0 left-0 w-[120%] h-[100%] bg-gradient-to-tr from-purple-500/10 via-transparent to-transparent blur-[80px] pointer-events-none -z-10" />

                <motion.div
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1, delayChildren: 0.4 }
                        }
                    }}
                    initial="hidden"
                    animate="show"
                    className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 relative z-10"
                >
                    <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}>
                        <div className="flex items-center justify-between mb-5">
                            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-[var(--site-secondary)]/20 text-[var(--site-secondary)] border border-[var(--site-secondary)]/40 shadow-[0_0_15px_rgba(20,184,166,0.2)] uppercase tracking-wider backdrop-blur-md">
                                {project.category}
                            </span>
                            {project.album && (
                                <span className="text-[11px] font-semibold text-white/70 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                    {project.album}
                                </span>
                            )}
                        </div>

                        <h3 className="text-3xl md:text-4xl font-extrabold mb-5 text-white leading-tight drop-shadow-md tracking-tight">
                            {project.title}
                        </h3>

                        {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {project.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 text-[11px] font-semibold rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300 cursor-default shadow-sm">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="p-5 rounded-2xl bg-black/20 border border-white/10 backdrop-blur-md space-y-4 shadow-inner">
                            <p className="text-gray-300 leading-relaxed text-[15px] font-medium">
                                {project.description}
                            </p>

                            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-y-3 justify-between items-center text-xs font-semibold">
                                <div className="flex items-center gap-4 text-gray-400">
                                    <span className="flex items-center gap-1.5 text-white/90"><Eye size={15} className="text-[var(--site-secondary)] drop-shadow-sm" /> {formatViewCount(project.views || 0)}</span>
                                    <span className="flex items-center gap-1.5 text-white/90"><MessageCircle size={15} className="text-purple-400 drop-shadow-sm" /> {project.comments || 0}</span>
                                </div>
                                <span className="text-gray-500 font-medium">
                                    {project.uploadDate ? formatDate(project.uploadDate) : new Date().getFullYear()}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Comments Section */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }} className="space-y-4">
                        <div className="space-y-4">
                            <h4 className="text-[13px] font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                                <MessageCircle size={15} className="text-[var(--site-secondary)]" />
                                Latest Comments
                            </h4>

                            {/* Comment Input */}
                            <form onSubmit={handlePostComment} className="relative group/form">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-[var(--site-secondary)]/60 focus:bg-black/40 focus:ring-4 focus:ring-[var(--site-secondary)]/10 transition-all pr-12 hover:border-white/20 shadow-inner placeholder:text-gray-500 font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || isPostingComment}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/5 text-[var(--site-secondary)] hover:bg-[var(--site-secondary)]/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all hover:scale-105 active:scale-95"
                                >
                                    {isPostingComment ? <Loader2 size={16} className="animate-spin" /> : <div className="-rotate-90"><Share2 size={16} style={{ transform: "rotate(-90deg)" }} /></div>}
                                </button>
                            </form>
                        </div>

                        {isLoadingComments ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 size={24} className="text-[var(--site-secondary)] animate-spin" />
                            </div>
                        ) : comments.length > 0 ? (
                            <div className="space-y-3">
                                <AnimatePresence initial={false}>
                                    {comments.slice(0, 3).map((comment) => (
                                        <motion.div
                                            key={comment._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-3.5 rounded-2xl bg-black/20 border border-white/5 flex gap-3.5 text-sm shadow-sm backdrop-blur-sm"
                                        >
                                            <div className="shrink-0 relative">
                                                {comment.user.imageURL ? (
                                                    <Link href={`/profile/${comment.user.username}`} onClick={(e) => e.stopPropagation()}>
                                                        <Image
                                                            src={comment.user.imageURL}
                                                            alt={comment.user.username}
                                                            width={36}
                                                            height={36}
                                                            className="rounded-full object-cover border border-white/10 shadow-sm"
                                                        />
                                                    </Link>
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                                                        <User size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <Link href={`/profile/${comment.user.username}`} className="font-bold text-white hover:text-[var(--site-secondary)] transition-colors" onClick={(e) => e.stopPropagation()}>
                                                        {comment.user.fullName}
                                                    </Link>
                                                    <span className="text-[10px] font-medium text-gray-500">
                                                        {formatDate(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-300 leading-snug text-[13px] font-medium">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {comments.length > 3 && (
                                    <Link href={`/projects/${projectSlug}`} className="block text-center text-[12px] font-bold text-[var(--site-secondary)] hover:text-white transition-colors py-3 bg-white/5 hover:bg-[var(--site-secondary)]/20 rounded-xl border border-white/5 hover:border-[var(--site-secondary)]/40 mt-2">
                                        View all {comments.length} comments
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 px-4 rounded-2xl bg-black/20 border border-white/5 border-dashed">
                                <p className="text-sm font-medium text-gray-500">No comments yet. Be the first!</p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-4 relative z-20"
                >
                    <div className="flex items-center gap-3">
                        <Link href={`/projects/${projectSlug}`} className="flex-1 group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--site-secondary)] to-teal-400 p-[1px] shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all duration-300 active:scale-[0.98]">
                            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-in-out -skew-x-12 origin-left z-20" />
                            <div className="relative h-12 bg-black/40 backdrop-blur-md rounded-[15px] flex items-center justify-center gap-2 px-6 transition-colors group-hover:bg-transparent">
                                <span className="font-extrabold text-white relative z-10 text-[14px] uppercase tracking-wider">{dict.portfolio.view_project}</span>
                                <ExternalLink size={18} className="text-white group-hover:translate-x-1 transition-transform relative z-10" />
                            </div>
                        </Link>

                        <button
                            onClick={() => setIsShareOpen(true)}
                            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white transition-all duration-300 hover:rotate-12 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-md"
                        >
                            <Share2 size={18} />
                        </button>

                        <motion.button
                            onClick={handleLike}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`h-12 min-w-[4rem] px-4 flex items-center justify-center gap-2.5 rounded-2xl border transition-all duration-300 backdrop-blur-md shadow-lg ${optimisticProject.isLiked
                                ? "bg-red-500/20 border-red-500/50 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                                : "bg-white/5 border-white/10 hover:bg-red-500/10 hover:border-red-400/40 text-white"
                                }`}
                        >
                            <div className="relative w-5 h-5 flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    {optimisticProject.isLiked ? (
                                        <motion.div
                                            key="liked"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        >
                                            <Heart size={20} className="fill-red-500 text-red-500 drop-shadow-md" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="unliked"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        >
                                            <Heart size={20} className="drop-shadow-sm group-hover:text-red-400 transition-colors" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <span className="font-extrabold text-[15px]">
                                {optimisticProject.likes || 0}
                            </span>
                        </motion.button>
                    </div>
                </motion.div>
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
