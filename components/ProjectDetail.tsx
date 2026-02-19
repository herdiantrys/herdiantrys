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
import { urlFor } from "@/sanity/lib/image";
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
            return urlFor(image).url();
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
        if (!session) {
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
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-teal-500/30">
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
            <header className="relative w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-[#050505] group/stage">

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
                    <div className="absolute inset-0 bg-black/40" />
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
                            className="relative flex items-center justify-center shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] group cursor-zoom-in rounded-sm md:rounded-lg overflow-hidden ring-1 ring-white/10"
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
                                        className="w-full h-full max-h-[90vh] object-contain transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                                        priority
                                    />

                                    {/* Hover Expand Hint with Glass Effect */}
                                    <div className="absolute bottom-6 right-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl text-white border border-white/20 text-sm font-semibold shadow-xl tracking-wide hover:bg-white/20 transition-colors">
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
                        className="absolute bottom-8 z-30 flex items-center gap-3 p-2.5 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl"
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
                        className="flex items-center gap-3 group opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/30 backdrop-blur-md group-hover:bg-white/10 transition-all">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="font-medium tracking-wide hidden md:block">Back to Projects</span>
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

                    <div className="bg-background/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl p-8 lg:p-16">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

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
                                        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm font-medium">
                                            <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/20 font-bold uppercase tracking-wider text-[11px]">
                                                {typeof project.category === 'string' ? project.category : project.category?.title}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {formatDate(project.uploadDate)}
                                            </span>
                                        </div>

                                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-6 text-foreground">
                                            {project.title}
                                        </h1>

                                        <div className="flex items-center gap-6 text-muted-foreground mb-8">
                                            <div className="flex items-center gap-2" title="Views">
                                                <Eye size={18} />
                                                <span className="font-semibold text-foreground">{formatViewCount(project.views)}</span>
                                            </div>
                                            <div className="flex items-center gap-2" title="Likes">
                                                <Heart size={18} className={isLiked ? "fill-rose-500 text-rose-500" : ""} />
                                                <span className={`font-semibold ${isLiked ? "text-rose-500" : "text-foreground"}`}>
                                                    {likeCount}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={fadeInUp} className="flex flex-col gap-3">
                                        <button
                                            onClick={handleLike}
                                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 border ${isLiked
                                                ? "bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-lg shadow-rose-500/10 scale-[1.02]"
                                                : "bg-muted/30 border-border hover:bg-muted text-foreground hover:scale-[1.02]"
                                                }`}
                                        >
                                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                                            <span>{isLiked ? "Liked Artwork" : "Appreciate Artwork"}</span>
                                        </button>
                                        <button
                                            onClick={() => setIsShareOpen(true)}
                                            className="w-full py-4 rounded-xl bg-background border border-border hover:bg-muted font-bold text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2"
                                        >
                                            <Share2 size={20} /> Share
                                        </button>
                                    </motion.div>

                                    {/* Tags */}
                                    {project.tags && project.tags.length > 0 && (
                                        <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 pt-6 border-t border-border/50">
                                            {project.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-muted/50 rounded-lg text-xs font-mono text-muted-foreground border border-border/50">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Content & Gallery */}
                            <div className="lg:col-span-8 space-y-16">

                                {/* Prosaic Content */}
                                <motion.article
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                    variants={fadeInUp}
                                    className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-muted-foreground/90 prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:pl-6 prose-blockquote:italic"
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
                                        className="space-y-6"
                                    >
                                        <h3 className="text-2xl font-bold flex items-center gap-3">
                                            <ZoomIn size={24} className="text-teal-500" />
                                            Close-ups & Highlights
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {allMedia.map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    variants={fadeInUp}
                                                    className={`relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-border/50 group shadow-lg hover:shadow-2xl transition-all duration-500 ${activeHeroIndex === index ? "ring-2 ring-teal-500 ring-offset-2 ring-offset-background" : ""}`}
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
                                                    <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm border border-white/20">View on Stage</span>
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
                                    className="pt-12 border-t border-border"
                                >
                                    <h3 className="text-2xl font-bold mb-8">Thought Exchange ({comments.length})</h3>

                                    {/* Input */}
                                    <div className="flex gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                                            {session?.user?.image ? (
                                                <Image src={session.user.image} alt="User" width={48} height={48} className="object-cover" />
                                            ) : (
                                                <UserIcon size={24} className="text-muted-foreground" />
                                            )}
                                        </div>
                                        <form onSubmit={handleCommentSubmit} className="flex-1 group">
                                            <div className="relative">
                                                <textarea
                                                    value={commentText}
                                                    onChange={e => setCommentText(e.target.value)}
                                                    placeholder={session ? "Write a comment..." : "Login to comment"}
                                                    disabled={!session}
                                                    className="w-full bg-muted/20 border border-border/50 rounded-2xl p-5 text-foreground focus:outline-none focus:border-teal-500/50 focus:bg-background focus:ring-4 focus:ring-teal-500/5 transition-all min-h-[80px] resize-y shadow-sm"
                                                    rows={1}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!commentText.trim() || isSubmittingComment}
                                                    className="absolute right-3 bottom-3 p-3 rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/20 disabled:opacity-0 disabled:translate-y-2 transition-all hover:scale-110 active:scale-90"
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* List */}
                                    <div className="space-y-6">
                                        {comments.length > 0 ? comments.map(comment => (
                                            <div key={comment._id} className="flex gap-4 group p-4 rounded-2xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                                                <div className="w-10 h-10 rounded-full bg-muted border border-border shrink-0 overflow-hidden">
                                                    {comment.user.image ? (
                                                        <Image src={comment.user.image} alt={comment.user.username} width={40} height={40} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold font-mono">
                                                            {comment.user.username[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm">{comment.user.username}</span>
                                                        <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                                                    </div>
                                                    <p className="text-muted-foreground/80 leading-relaxed text-sm group-hover:text-foreground transition-colors">{comment.text}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-muted-foreground italic">No comments yet.</p>
                                        )}
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
