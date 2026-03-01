"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import {
    Calendar, Eye, Heart, MessageCircle, Share2, ArrowLeft, Send,
    ExternalLink, Download, Play, X, User as UserIcon, Film,
    ThumbsUp, Bookmark, ChevronRight, Maximize2, ZoomIn
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toggleLike, postComment } from "@/app/[lang]/(root)/projects/[slug]/actions";
import { toggleBookmark } from "@/lib/actions/bookmark.actions";
import { toast } from "sonner";
import { XPToast } from "@/components/Gamification/XPToast";
import { incrementView } from "@/actions/incrementView";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatViewCount, formatDate } from "@/lib/utils";
import Lightbox from "./Lightbox";
import { ShareModal } from "@/components/ShareModal";

interface Comment {
    _id: string;
    text: string;
    user: {
        username: string;
        image?: string;
        equippedEffect?: string | null;
    };
    createdAt: string;
}

interface ProjectDetailProps {
    project: {
        id: string;
        title: string;
        slug: { current: string } | string;
        category: { title: string } | string;
        image: any;
        videoFile?: any;
        content: any;
        repoUrl?: string | null;
        demoUrl?: string | null;
        uploadDate: string;
        views: number;
        likes: any[];
        comments: Comment[];
        tags?: string[] | null;
        type?: "IMAGE" | "VIDEO";
        gallery?: {
            type: 'image' | 'video' | 'file';
            url: string;
        }[];
        album?: string | null;
    };
    dict: any;
    initialIsBookmarked?: boolean;
}

export default function ProjectDetail({ project, dict, initialIsBookmarked = false }: ProjectDetailProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

    const initialLikeCount = typeof project.likes === 'number'
        ? project.likes
        : (Array.isArray(project.likes) ? project.likes.length : 0);

    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [comments, setComments] = useState<Comment[]>(project.comments || []);
    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Share Modal
    const [isShareOpen, setIsShareOpen] = useState(false);

    // Scroll Animations for Parallax
    const { scrollY } = useScroll();

    // Smooth spring physics for scroll values
    const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

    const heroOpacity = useTransform(scrollY, [0, 800], [1, 0]);
    // Parallax: Artwork moves slower than scroll (0.5 speed)
    const artworkY = useTransform(scrollY, [0, 1000], [0, 400]);
    // Background scales up and moves slightly
    const bgScale = useTransform(scrollY, [0, 1000], [1.2, 1.4]);
    const bgY = useTransform(scrollY, [0, 1000], [0, 200]);

    // Helpers
    const resolveImageUrl = (image: any) => {
        if (!image) return "/placeholder.jpg"; // Fallback
        if (typeof image === "string") return image;
        if (image.url) return image.url;
        if (image.asset?.url) return image.asset.url;
        try {
            return image;
        } catch (e) {
            return "";
        }
    };

    const mainMedia = project.videoFile ? {
        type: 'video' as const,
        url: typeof project.videoFile === 'string' ? project.videoFile : ""
    } : {
        type: 'image' as const,
        url: resolveImageUrl(project.image)
    };

    const galleryItems = (project.gallery || []).map(item => ({
        type: (item.type === 'video' ? 'video' : 'image') as 'image' | 'video',
        url: item.url
    }));

    const allMedia = [mainMedia, ...galleryItems];

    // State for Hero Display
    const [activeHeroIndex, setActiveHeroIndex] = useState(0);
    const activeMedia = allMedia[activeHeroIndex];

    // Effects
    useEffect(() => {
        if ((project as any).isLiked !== undefined) {
            setIsLiked((project as any).isLiked);
        } else if (session?.user?.id && Array.isArray(project.likes)) {
            setIsLiked(project.likes.some((like: any) => (like._ref || like.id) === session.user?.id));
        }
    }, [session, project]);

    const hasIncremented = useRef(false);
    useEffect(() => {
        if (!hasIncremented.current) {
            incrementView(project.id);
            hasIncremented.current = true;
        }
    }, [project.id]);

    const getSlug = () => {
        if (typeof project.slug === 'string') return project.slug;
        return project.slug?.current || '';
    }

    // Handlers
    const handleLike = async () => {
        if (!session) {
            router.push("/login");
            return;
        }
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

        const result = await toggleLike(project.id, getSlug());
        if (result.success) {
            const finalIsLiked = result.hasLiked ?? false;
            setIsLiked(finalIsLiked); // Ensure state matches backend
            if (finalIsLiked) {
                toast.custom((t) => <XPToast amount={10} reason="Liked Project" />);
            } else {
                toast.success("Project unliked");
            }
        } else {
            // Revert optimistic update if action fails
            setIsLiked(!newIsLiked);
            setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
            toast.error(result.error || "Failed to toggle like");
        }
    };

    const handleBookmark = async () => {
        if (!session?.user?.id) {
            router.push("/login");
            return;
        }
        const newIsBookmarked = !isBookmarked;
        setIsBookmarked(newIsBookmarked);

        const result = await toggleBookmark(session.user.id, project.id);
        if (result.success) {
            const finalIsBookmarked = result.isBookmarked ?? false;
            setIsBookmarked(finalIsBookmarked); // Ensure state matches backend
            if (finalIsBookmarked) {
                toast.custom((t) => <XPToast amount={10} reason="Bookmarked Project" />);
            } else {
                toast.success("Project removed from bookmarks");
            }
        } else {
            // Revert optimistic update if action fails
            setIsBookmarked(!newIsBookmarked);
            toast.error(result.error || "Failed to toggle bookmark");
        }
    }

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session || (session.user as any).status === "LIMITED") {
            router.push("/login");
            return;
        }
        if (!commentText.trim()) return;

        setIsSubmittingComment(true);

        const newComment: Comment = {
            _id: Math.random().toString(36).substr(2, 9),
            text: commentText,
            user: {
                username: session.user?.name || "User",
                image: session.user?.image || undefined,
                equippedEffect: null
            },
            createdAt: new Date().toISOString()
        };

        setComments(prev => [newComment, ...prev]);
        setCommentText("");

        const result = await postComment(project.id, getSlug(), commentText);

        if (result.error) {
            setComments(prev => prev.filter(c => c._id !== newComment._id));
        }

        setIsSubmittingComment(false);
    };

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-[var(--site-sidebar-bg)] text-[var(--glass-text)] font-sans selection:bg-[var(--site-secondary)]/30">
            <Lightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                media={allMedia}
                currentIndex={lightboxIndex}
                onNext={() => setLightboxIndex((prev) => (prev + 1) % allMedia.length)}
                onPrev={() => setLightboxIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length)}
                onJump={(index) => setLightboxIndex(index)}
            />

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                url={`/projects/${getSlug()}`}
                title={project.title}
                description={String(project.category)}
            />

            {/* --- MUSEUM STAGE HERO --- */}
            {/* Parallax Container */}
            <header className="relative w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-black dark:bg-[#050505] group/stage">

                {/* 1. Ambient Background (Parallax + Scale) */}
                <motion.div
                    key={`ambient-${activeHeroIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0 blur-[120px] saturate-150 pointer-events-none"
                    style={{ opacity: heroOpacity, scale: bgScale, y: bgY }}
                >
                    {activeMedia.type === 'video' ? (
                        <video
                            src={activeMedia.url}
                            className="w-full h-full object-cover"
                            muted loop autoPlay
                        />
                    ) : (
                        <Image
                            src={activeMedia.url}
                            alt="Ambient"
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                    <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
                </motion.div>

                {/* 2. Main Artwork Container (Parallax Y) */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeHeroIndex}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        style={{ y: artworkY }} // Controlled parallax
                        className="relative z-10 w-full h-full p-2 flex items-center justify-center"
                    >
                        <div
                            className="relative flex items-center justify-center shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] group cursor-zoom-in rounded-sm md:rounded-lg overflow-hidden ring-1 ring-white/10 dark:ring-white/5"
                            onClick={() => openLightbox(activeHeroIndex)}
                        >
                            {activeMedia.type === 'video' ? (
                                <div className="relative bg-black flex items-center justify-center h-full w-full">
                                    <video
                                        src={activeMedia.url}
                                        className="w-full h-full max-h-[90vh] object-contain"
                                        autoPlay loop muted playsInline
                                    />
                                </div>
                            ) : (
                                <div className="relative flex items-center justify-center w-full h-full bg-black/5 backdrop-blur-sm">
                                    <Image
                                        src={activeMedia.url}
                                        alt={project.title}
                                        width={1920}
                                        height={1080}
                                        className="w-full h-full max-h-[90vh] object-contain transition-transform duration-1000 ease-out group-hover:scale-[1.01]"
                                        priority
                                    />

                                    {/* Hover Expand Hint with Glass Effect */}
                                    <div className="absolute bottom-6 right-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-xl text-white border border-white/20 text-sm font-bold shadow-xl tracking-wide hover:bg-black/60 transition-colors">
                                            <Maximize2 size={16} /> Expand
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* 3. Hero Thumbnail Navigation */}
                {allMedia.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        style={{ y: useTransform(scrollY, [0, 400], [0, 100]) }} // Move out faster on scroll
                        className="absolute bottom-8 z-30 flex items-center gap-3 p-2.5 rounded-2xl bg-black/40 dark:bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl"
                    >
                        {allMedia.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveHeroIndex(index)}
                                className={`relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeHeroIndex === index
                                    ? "border-teal-500 scale-110 shadow-[0_0_20px_rgba(20,184,166,0.5)] z-10"
                                    : "border-transparent opacity-50 hover:opacity-100 hover:scale-105 grayscale hover:grayscale-0"
                                    }`}
                            >
                                {item.type === 'video' ? (
                                    <video src={item.url} className="w-full h-full object-cover" muted />
                                ) : (
                                    <Image
                                        src={item.url}
                                        alt={`Thumb ${index}`}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Navigation (Floating) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute top-24 left-8 z-30 mix-blend-difference text-white"
                >
                    <Link
                        href="/projects"
                        className="flex items-center gap-3 group transition-opacity"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/30 backdrop-blur-md bg-black/20 group-hover:bg-black/40 transition-all">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="font-bold tracking-wide hidden md:block drop-shadow-lg">Back to Projects</span>
                    </Link>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    style={{ opacity: heroOpacity }}
                    className="absolute bottom-10 left-8 flex flex-col gap-2 items-center hidden lg:flex"
                >
                    <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 rotate-180" style={{ writingMode: 'vertical-rl' }}>Scroll</span>
                </motion.div>
            </header>

            {/* --- DETAILS SECTION --- */}
            {/* Raised content block creates overlap effect */}
            <main className="relative z-20 mt-0">
                <div className="container mx-auto px-4 lg:px-8 pb-32">

                    {/* Liquid Glass Container */}
                    <div className="relative bg-[var(--glass-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl p-8 lg:p-16 overflow-hidden ring-1 ring-[var(--glass-border)]">

                        {/* Decorative Liquid Gradient Backgrounds */}
                        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-gradient-to-br from-[var(--site-secondary)]/10 via-[var(--site-accent)]/5 to-transparent blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
                        <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-gradient-to-tr from-[var(--site-secondary)]/10 via-transparent to-transparent blur-[100px] pointer-events-none -z-10" />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">

                            {/* Title & Metadata (Sticky) */}
                            <div className="lg:col-span-4">
                                <motion.div
                                    className="lg:sticky lg:top-32 space-y-8"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={staggerContainer}
                                >
                                    <motion.div variants={fadeInUp}>
                                        <div className="flex flex-wrap items-center gap-3 mb-5 text-sm font-medium">
                                            <span className="px-3.5 py-1.5 rounded-full bg-[var(--site-secondary)]/20 text-[var(--site-secondary)] border border-[var(--site-secondary)]/30 font-bold uppercase tracking-wider text-[11px] shadow-[0_0_15px_rgba(20,184,166,0.15)] backdrop-blur-md">
                                                {typeof project.category === 'string' ? project.category : project.category?.title}
                                            </span>
                                            <span className="text-gray-400 text-xs font-semibold">
                                                {formatDate(project.uploadDate)}
                                            </span>
                                        </div>

                                        <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-[var(--glass-text)]">
                                            {project.title}
                                        </h1>

                                        <div className="flex items-center gap-6 text-gray-400 mb-8 font-semibold text-sm">
                                            <div className="flex items-center gap-2.5" title="Views">
                                                <Eye size={18} className="text-[var(--site-secondary)] drop-shadow-sm" />
                                                <span className="text-white/90">{formatViewCount(project.views)}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5" title="Likes">
                                                <Heart size={18} className={isLiked ? "fill-red-500 text-red-500 drop-shadow-md" : "text-gray-400 drop-shadow-sm"} />
                                                <span className={isLiked ? "text-red-400" : "text-white/90"}>
                                                    {likeCount}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={fadeInUp} className="flex flex-col gap-4 pt-4">
                                        <button
                                            onClick={handleLike}
                                            className={`w-full py-4 rounded-2xl font-extrabold flex items-center justify-center gap-3 transition-all duration-300 border backdrop-blur-md shadow-lg ${isLiked
                                                ? "bg-red-500/20 border-red-500/40 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)] scale-[1.02]"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white hover:scale-[1.02]"
                                                }`}
                                        >
                                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "drop-shadow-sm" : ""} />
                                            <span className="tracking-wide">{isLiked ? "Liked Artwork" : "Appreciate Artwork"}</span>
                                        </button>
                                        <button
                                            onClick={() => setIsShareOpen(true)}
                                            className="w-full py-4 rounded-2xl bg-[var(--site-sidebar-active)]/50 border border-[var(--site-sidebar-border)] hover:bg-[var(--site-sidebar-active)] font-extrabold text-[var(--glass-text)] tracking-wide transition-all flex items-center justify-center gap-3 backdrop-blur-md shadow-lg hover:scale-[1.02]"
                                        >
                                            <Share2 size={20} /> Share Project
                                        </button>
                                    </motion.div>

                                    {/* Tags */}
                                    {project.tags && project.tags.length > 0 && (
                                        <motion.div variants={fadeInUp} className="flex flex-wrap gap-2.5 pt-8 border-t border-[var(--site-sidebar-border)]">
                                            {project.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1.5 bg-[var(--site-sidebar-active)]/60 rounded-lg text-[11px] font-bold text-[var(--glass-text-muted)] border border-[var(--site-sidebar-border)] hover:border-[var(--site-secondary)]/30 hover:text-[var(--site-secondary)] transition-colors cursor-default shadow-sm tracking-wide">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Content & Gallery */}
                            <div className="lg:col-span-8 space-y-20">

                                {/* Prosaic Content */}
                                <motion.article
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                    variants={fadeInUp}
                                    className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:text-[var(--glass-text)] prose-p:leading-relaxed prose-p:text-[var(--glass-text-muted)] prose-p:font-medium prose-blockquote:border-l-4 prose-blockquote:border-[var(--site-secondary)] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-[var(--glass-text-muted)] prose-blockquote:bg-[var(--site-sidebar-active)]/40 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-strong:text-[var(--glass-text)] prose-a:text-[var(--site-secondary)] hover:prose-a:text-[var(--site-accent)] prose-li:text-[var(--glass-text-muted)]"
                                >
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {typeof project.content === 'string' ? project.content : ""}
                                    </ReactMarkdown>
                                </motion.article>

                                {/* Additional Gallery */}
                                {allMedia.length > 1 && (
                                    <motion.div
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-50px" }}
                                        variants={staggerContainer}
                                        className="space-y-8"
                                    >
                                        <h3 className="text-2xl font-black flex items-center gap-3 text-[var(--glass-text)] tracking-tight">
                                            <ZoomIn size={24} className="text-[var(--site-secondary)]" />
                                            Close-ups & Highlights
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {allMedia.map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    variants={fadeInUp}
                                                    className={`relative aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden cursor-pointer border border-[var(--site-sidebar-border)] group shadow-lg hover:shadow-[0_0_30px_rgba(var(--site-secondary-rgb),0.1)] hover:border-[var(--site-secondary)]/30 transition-all duration-500 ${activeHeroIndex === index ? "ring-2 ring-[var(--site-secondary)] shadow-[0_0_20px_rgba(20,184,166,0.3)]" : ""}`}
                                                    onClick={() => {
                                                        setActiveHeroIndex(index);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                >
                                                    {item.type === 'video' ? (
                                                        <video src={item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" muted />
                                                    ) : (
                                                        <Image
                                                            src={item.url}
                                                            alt={`Gallery ${index}`}
                                                            fill
                                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                                        />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/50 dark:bg-black/70 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <span className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-sm border border-white/20 font-bold">View on Stage</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Comments */}
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                    className="pt-16 border-t border-white/10"
                                >
                                    <h3 className="text-2xl font-black mb-10 text-[var(--glass-text)] tracking-tight flex items-center gap-3">
                                        <MessageCircle size={24} className="text-[var(--site-secondary)]" />
                                        Thought Exchange <span className="text-[var(--glass-text-muted)] text-lg font-bold">({comments.length})</span>
                                    </h3>

                                    {/* Input */}
                                    <div className="flex gap-5 mb-12">
                                        <div className="w-12 h-12 rounded-full bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)] flex items-center justify-center shrink-0 overflow-hidden shadow-sm backdrop-blur-md">
                                            {session?.user?.id ? (
                                                <img src={session.user.image || "/placeholder.jpg"} alt="User" onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={24} className="text-[var(--glass-text-muted)]" />
                                            )}
                                        </div>
                                        <form onSubmit={handleCommentSubmit} className="flex-1 group">
                                            <div className="relative">
                                                <textarea
                                                    value={commentText}
                                                    onChange={e => setCommentText(e.target.value)}
                                                    placeholder={!session ? (dict.projects?.login_to_comment || "Login to share your thoughts") : ((session as any).user?.status === "LIMITED" ? (dict.projects?.commenting_restricted || "Commenting restricted") : (dict.projects?.write_thoughts || "Write your thoughts..."))}
                                                    disabled={!session || (session as any).user?.status === "LIMITED"}
                                                    className="w-full bg-[var(--site-sidebar-bg)] border border-[var(--site-sidebar-border)] rounded-[1.5rem] p-5 lg:p-6 text-[var(--glass-text)] focus:outline-none focus:border-[var(--site-secondary)]/60 focus:bg-[var(--glass-bg)] focus:ring-4 focus:ring-[var(--site-secondary)]/10 transition-all min-h-[90px] resize-y shadow-inner font-bold placeholder:text-[var(--glass-text-muted)] pr-16 disabled:opacity-50"
                                                    rows={1}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!commentText.trim() || isSubmittingComment || (session as any)?.user?.status === "LIMITED"}
                                                    className="absolute right-4 bottom-4 p-3.5 rounded-xl bg-[var(--site-sidebar-active)] text-[var(--site-secondary)] border border-[var(--site-sidebar-border)] hover:bg-[var(--site-secondary)] hover:text-white shadow-lg disabled:opacity-30 disabled:translate-y-2 disabled:hover:bg-[var(--site-sidebar-active)] transition-all hover:scale-105 active:scale-95 backdrop-blur-md disabled:grayscale"
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* List */}
                                    <div className="space-y-5">
                                        <AnimatePresence>
                                            {comments.length > 0 ? comments.map(comment => (
                                                <motion.div
                                                    key={comment._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex gap-4 group p-5 rounded-2xl bg-[var(--site-sidebar-active)]/40 border border-[var(--site-sidebar-border)] hover:border-[var(--site-secondary)]/20 hover:bg-[var(--site-sidebar-active)]/60 transition-all shadow-sm backdrop-blur-sm"
                                                >
                                                    <div className="w-11 h-11 rounded-full bg-[var(--site-sidebar-bg)] border border-[var(--site-sidebar-border)] shrink-0 overflow-hidden shadow-sm">
                                                        {comment.user.image ? (
                                                            <img src={comment.user.image} alt={comment.user.username} onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold font-mono text-[var(--glass-text-muted)]">
                                                                {comment.user.username[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5 flex-1">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="font-black text-[15px] text-[var(--glass-text)] tracking-wide">{comment.user.username}</span>
                                                            <span className="text-[11px] font-bold text-[var(--glass-text-muted)]">{formatDate(comment.createdAt)}</span>
                                                        </div>
                                                        <p className="text-[var(--glass-text-muted)] leading-relaxed text-sm group-hover:text-[var(--glass-text)] transition-colors font-bold">{comment.text}</p>
                                                    </div>
                                                </motion.div>
                                            )) : (
                                                <p className="text-sm font-bold text-[var(--glass-text-muted)] bg-[var(--site-sidebar-active)]/20 border border-[var(--site-sidebar-border)] p-8 rounded-2xl text-center border-dashed">No comments yet. Be the first to share your thoughts!</p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>

                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
