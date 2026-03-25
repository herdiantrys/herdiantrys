"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import {
    Calendar, Eye, Heart, MessageCircle, Share2, ArrowLeft, Send,
    ExternalLink, Play, User as UserIcon, Film,
    Bookmark, ChevronRight, Maximize2, ZoomIn
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

interface ProjectLike {
    _ref?: string;
    id?: string;
}

interface ProjectGalleryItem {
    type: "image" | "video" | "file";
    url: string;
}

interface ProjectDictionary {
    projects?: {
        login_to_comment?: string;
        commenting_restricted?: string;
        write_thoughts?: string;
    };
}

interface ProjectRecord {
    id: string;
    title: string;
    slug: { current: string } | string;
    category: { title: string } | string;
    image: unknown;
    videoFile?: unknown;
    content: unknown;
    repoUrl?: string | null;
    demoUrl?: string | null;
    uploadDate: string;
    views: number;
    likes: ProjectLike[] | number;
    comments: Comment[];
    tags?: string[] | null;
    type?: "IMAGE" | "VIDEO";
    gallery?: ProjectGalleryItem[];
    album?: string | null;
    isLiked?: boolean;
}

interface ProjectDetailProps {
    project: ProjectRecord;
    dict: ProjectDictionary;
    initialIsBookmarked?: boolean;
}

export default function ProjectDetail({ project, dict, initialIsBookmarked = false }: ProjectDetailProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [likedOverride, setLikedOverride] = useState<boolean | null>(null);
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

    const heroOpacity = useSpring(useTransform(scrollY, [0, 800], [1, 0]), springConfig);
    // Parallax: Artwork moves slower than scroll (0.5 speed)
    const artworkY = useSpring(useTransform(scrollY, [0, 1000], [0, 400]), springConfig);
    // Background scales up and moves slightly
    const bgScale = useSpring(useTransform(scrollY, [0, 1000], [1.2, 1.38]), springConfig);
    const bgY = useSpring(useTransform(scrollY, [0, 1000], [0, 200]), springConfig);
    const heroRailY = useSpring(useTransform(scrollY, [0, 400], [0, 96]), springConfig);
    const stagePanelY = useSpring(useTransform(scrollY, [0, 450], [0, 120]), springConfig);

    const isObjectRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

    // Helpers
    const resolveImageUrl = (image: unknown) => {
        if (!image) return "/placeholder.jpg";
        if (typeof image === "string") return image;
        if (isObjectRecord(image) && typeof image.url === "string") return image.url;
        if (isObjectRecord(image) && isObjectRecord(image.asset) && typeof image.asset.url === "string") {
            return image.asset.url;
        }
        return "";
    };

    const mainMedia = typeof project.videoFile === "string" && project.videoFile ? {
        type: 'video' as const,
        url: project.videoFile
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
    const hasMultipleMedia = allMedia.length > 1;

    const stageRef = useRef<HTMLElement | null>(null);
    const overviewRef = useRef<HTMLElement | null>(null);
    const storyRef = useRef<HTMLElement | null>(null);
    const galleryRef = useRef<HTMLElement | null>(null);
    const commentsRef = useRef<HTMLElement | null>(null);

    const projectCategory = typeof project.category === "string" ? project.category : project.category?.title || "Project";
    const projectBody = typeof project.content === "string" ? project.content : "";
    const projectPlainText = projectBody
        .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[`>#*_~-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const projectSynopsis = projectPlainText
        ? (projectPlainText.length > 220 ? `${projectPlainText.slice(0, 217).trimEnd()}...` : projectPlainText)
        : "A crafted project stage that blends concept, execution, and presentation into one polished showcase.";
    const readingTime = `${Math.max(1, Math.ceil(Math.max(projectPlainText.split(" ").filter(Boolean).length, 90) / 180))} min read`;
    const mediaProgressLabel = `${String(activeHeroIndex + 1).padStart(2, "0")} / ${String(allMedia.length).padStart(2, "0")}`;
    const activeMediaLabel = activeMedia.type === "video" ? "Motion stage" : "Artwork stage";
    const sessionStatus = (session?.user as { status?: string } | undefined)?.status;
    const computedIsLiked = project.isLiked !== undefined
        ? project.isLiked
        : (session?.user?.id && Array.isArray(project.likes)
            ? project.likes.some((like) => (like._ref || like.id) === session.user?.id)
            : false);
    const isLiked = likedOverride ?? computedIsLiked;

    const projectFacts = [
        { label: "Published", value: formatDate(project.uploadDate), Icon: Calendar },
        { label: "Stage Type", value: activeMediaLabel, Icon: Film },
        { label: "Media Count", value: `${allMedia.length} item${allMedia.length === 1 ? "" : "s"}`, Icon: ZoomIn },
        { label: "Engagement", value: `${formatViewCount(project.views)} views`, Icon: Eye }
    ];

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
        const previousIsLiked = isLiked;
        const newIsLiked = !isLiked;
        setLikedOverride(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

        const result = await toggleLike(project.id, getSlug());
        if (result.success) {
            const finalIsLiked = result.hasLiked ?? false;
            setLikedOverride(finalIsLiked);
            if (finalIsLiked) {
                toast.custom(() => <XPToast amount={10} reason="Liked Project" />);
            } else {
                toast.success("Project unliked");
            }
        } else {
            setLikedOverride(previousIsLiked);
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
                toast.custom(() => <XPToast amount={10} reason="Bookmarked Project" />);
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
        if (!session || sessionStatus === "LIMITED") {
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

    const scrollToSection = (ref: { current: HTMLElement | null }) => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const scrollToSectionKey = (key: "overview" | "story" | "gallery" | "comments") => {
        const sectionMap = {
            overview: overviewRef,
            story: storyRef,
            gallery: galleryRef,
            comments: commentsRef
        };

        scrollToSection(sectionMap[key]);
    };

    const goToPrevMedia = () => {
        if (!hasMultipleMedia) return;
        setActiveHeroIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    };

    const goToNextMedia = () => {
        if (!hasMultipleMedia) return;
        setActiveHeroIndex((prev) => (prev + 1) % allMedia.length);
    };

    const projectSections = [
        { key: "overview" as const, label: "Overview", detail: "Quick brief & project links" },
        { key: "story" as const, label: "Story", detail: "Read the full creative breakdown" },
        ...(hasMultipleMedia ? [{ key: "gallery" as const, label: "Gallery", detail: "Jump between stage alternates" }] : []),
        { key: "comments" as const, label: "Discuss", detail: "Comments and feedback" }
    ];

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
                description={projectCategory}
            />

            {/* --- MUSEUM STAGE HERO --- */}
            <header
                ref={stageRef}
                className="group/stage relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.2),transparent_32%),linear-gradient(180deg,#091224_0%,#07111f_42%,#050914_100%)]"
            >
                <motion.div
                    key={`ambient-${activeHeroIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.42 }}
                    transition={{ duration: 1.5 }}
                    className="pointer-events-none absolute inset-0 z-0 blur-[120px] saturate-150"
                    style={{ opacity: heroOpacity, scale: bgScale, y: bgY }}
                >
                    {activeMedia.type === "video" ? (
                        <video src={activeMedia.url} className="h-full w-full object-cover" muted loop autoPlay />
                    ) : (
                        <Image src={activeMedia.url} alt="Ambient" fill className="object-cover" priority />
                    )}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(12,19,38,0.08),rgba(4,8,14,0.84)_72%)]" />
                </motion.div>

                <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(4,10,19,0.72)_0%,rgba(4,10,19,0.2)_24%,rgba(4,10,19,0.14)_65%,rgba(4,10,19,0.78)_100%)]" />
                <div className="pointer-events-none absolute -left-20 top-[12%] z-[2] h-48 w-48 rounded-full bg-[var(--site-secondary)]/12 blur-[90px]" />
                <div className="pointer-events-none absolute -right-10 bottom-[20%] z-[2] h-56 w-56 rounded-full bg-[var(--site-accent)]/10 blur-[110px]" />

                <div className="absolute inset-x-0 top-4 z-40 px-4 sm:top-6 sm:px-6 lg:px-10">
                    <div className="mx-auto flex max-w-[1360px] items-start justify-between gap-3">
                        <Link
                            href="/projects"
                            className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-3 py-3 pr-4 text-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:bg-black/45 hover:text-white"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform duration-300 group-hover:-translate-x-1">
                                <ArrowLeft size={18} />
                            </span>
                            <span className="hidden min-w-0 flex-col text-left sm:flex">
                                <span className="text-[10px] uppercase tracking-[0.28em] text-white/45">Project Navigator</span>
                                <span className="truncate text-sm font-semibold">Back to Projects</span>
                            </span>
                        </Link>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/55 backdrop-blur-2xl">
                                <span>{activeMediaLabel}</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--site-secondary)] shadow-[0_0_18px_rgba(195,245,255,0.65)]" />
                                <span>{mediaProgressLabel}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => openLightbox(activeHeroIndex)}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white/90 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:bg-black/45 hover:text-white"
                            >
                                <Maximize2 size={16} />
                                <span className="hidden sm:inline">Expand Stage</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToSection(overviewRef)}
                                className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white/90 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:bg-black/45 hover:text-white md:inline-flex"
                            >
                                Details
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-52 pt-28 sm:px-6 sm:pb-56 sm:pt-32 lg:px-10 lg:pb-44 lg:pt-36">
                    {hasMultipleMedia && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center justify-between px-4 lg:flex xl:px-8">
                            <button
                                type="button"
                                onClick={goToPrevMedia}
                                className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/80 shadow-[0_20px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300 hover:-translate-x-1 hover:border-white/20 hover:bg-black/45 hover:text-white"
                                aria-label="Previous media"
                            >
                                <ChevronRight size={20} className="rotate-180" />
                            </button>
                            <button
                                type="button"
                                onClick={goToNextMedia}
                                className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/80 shadow-[0_20px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300 hover:translate-x-1 hover:border-white/20 hover:bg-black/45 hover:text-white"
                                aria-label="Next media"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeHeroIndex}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            style={{ y: artworkY }}
                            className="relative z-10 w-full max-w-[min(1380px,94vw)]"
                        >
                            <div
                                className="group relative cursor-zoom-in overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.9),rgba(7,13,24,0.78))] p-2 shadow-[0_32px_90px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                                onClick={() => openLightbox(activeHeroIndex)}
                            >
                                <div className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65 backdrop-blur-xl">
                                    <span>{activeMedia.type === "video" ? "Motion" : "Still"}</span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--site-secondary)]" />
                                    <span>{mediaProgressLabel}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        openLightbox(activeHeroIndex);
                                    }}
                                    className="absolute right-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-black/50 hover:text-white"
                                >
                                    <Maximize2 size={16} />
                                    <span className="hidden sm:inline">Open Fullscreen</span>
                                </button>
                                <div className="relative overflow-hidden rounded-[1.8rem] bg-black/70">
                                    {activeMedia.type === "video" ? (
                                        <div className="relative flex items-center justify-center bg-black">
                                            <video
                                                src={activeMedia.url}
                                                className="h-full max-h-[82vh] w-full object-contain"
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative flex items-center justify-center bg-black/5 backdrop-blur-sm">
                                            <Image
                                                src={activeMedia.url}
                                                alt={project.title}
                                                width={1920}
                                                height={1080}
                                                className="h-full max-h-[82vh] w-full object-contain transition-transform duration-1000 ease-out group-hover:scale-[1.015]"
                                                priority
                                            />
                                        </div>
                                    )}
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(195,245,255,0.08),transparent_30%),linear-gradient(180deg,transparent_55%,rgba(3,7,14,0.6)_100%)]" />
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.85 }}
                    style={{ y: stagePanelY }}
                    className="absolute inset-x-0 bottom-0 z-30 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-10"
                >
                    <div className="mx-auto grid max-w-[1360px] gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
                        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.42)] backdrop-blur-[24px] sm:p-6 lg:p-7">
                            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/50">
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/75">{projectCategory}</span>
                                {project.album && (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/75">
                                        {project.album}
                                    </span>
                                )}
                                <span>{readingTime}</span>
                            </div>
                            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-3xl space-y-3">
                                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[3.4rem] lg:leading-[1.02]">
                                        {project.title}
                                    </h1>
                                    <p className="max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                                        {projectSynopsis}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {projectSections.map((section) => (
                                        <button
                                            key={section.label}
                                            type="button"
                                            onClick={() => scrollToSectionKey(section.key)}
                                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                                        >
                                            <span>{section.label}</span>
                                            <ChevronRight size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-3 shadow-[0_22px_60px_rgba(0,0,0,0.42)] backdrop-blur-[24px]">
                            <div className="mb-3 flex items-center justify-between gap-3 px-2 pt-1">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">Stage Controls</p>
                                    <p className="text-sm font-semibold text-white/90">Navigate and inspect details</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => openLightbox(activeHeroIndex)}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                                >
                                    <Maximize2 size={14} />
                                    Expand
                                </button>
                            </div>

                            {hasMultipleMedia ? (
                                <motion.div style={{ y: heroRailY }} className="flex items-center gap-2 overflow-x-auto px-1 pb-1">
                                    {allMedia.map((item, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setActiveHeroIndex(index)}
                                            className={`group relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.25rem] border transition-all duration-300 sm:h-24 sm:w-24 ${activeHeroIndex === index
                                                ? "border-[var(--site-secondary)] bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_38px_rgba(0,0,0,0.34)]"
                                                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                                }`}
                                        >
                                            {item.type === "video" ? (
                                                <video src={item.url} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" muted />
                                            ) : (
                                                <Image
                                                    src={item.url}
                                                    alt={`Thumb ${index + 1}`}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            )}
                                            <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity ${activeHeroIndex === index ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`} />
                                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                                                <span>{item.type === "video" ? "Motion" : "Still"}</span>
                                                <span>{String(index + 1).padStart(2, "0")}</span>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-5 text-sm leading-7 text-white/65">
                                    Inspect the artwork in fullscreen to study details, textures, and composition with a cleaner stage presentation.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </header>

            <main className="relative z-20 -mt-10 sm:-mt-12 lg:-mt-16">
                <div className="container mx-auto px-4 lg:px-8 pb-32">
                    <div className="relative overflow-hidden rounded-[2.75rem] border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.34)] ring-1 ring-[var(--glass-border)] backdrop-blur-3xl sm:p-8 lg:p-12 xl:p-16">
                        <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-[var(--site-secondary)]/10 blur-[140px]" />
                        <div className="pointer-events-none absolute -left-16 bottom-0 h-80 w-80 rounded-full bg-[var(--site-accent)]/10 blur-[150px]" />

                        <motion.section
                            ref={overviewRef}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-80px" }}
                            variants={fadeInUp}
                            className="relative z-10 mb-10 grid scroll-mt-28 gap-5 xl:grid-cols-[minmax(0,1.2fr)_0.8fr]"
                        >
                            <div className="overflow-hidden rounded-[2.2rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/55 p-6 shadow-[0_22px_55px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-8">
                                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--glass-text-muted)]">
                                    <span className="rounded-full border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/60 px-3 py-1.5 text-[var(--site-secondary)]">
                                        Project Overview
                                    </span>
                                    <span>{projectCategory}</span>
                                    <span>{readingTime}</span>
                                </div>

                                <h2 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-[var(--glass-text)] sm:text-4xl lg:text-[3rem] lg:leading-[1.05]">
                                    Built to be explored, not just viewed.
                                </h2>
                                <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--glass-text-muted)] sm:text-base">
                                    {projectSynopsis}
                                </p>

                                <div className="mt-7 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => scrollToSection(stageRef)}
                                        className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[var(--site-button-text)] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-0.5"
                                        style={{ background: "var(--site-button)" }}
                                    >
                                        <Maximize2 size={16} />
                                        Revisit Stage
                                    </button>
                                    {project.demoUrl && (
                                        <Link
                                            href={project.demoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 rounded-full border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/65 px-5 py-3 text-sm font-semibold text-[var(--glass-text)] transition-all duration-300 hover:border-[var(--site-secondary)]/35 hover:text-[var(--site-secondary)]"
                                        >
                                            <Play size={16} />
                                            Live Demo
                                        </Link>
                                    )}
                                    {project.repoUrl && (
                                        <Link
                                            href={project.repoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 rounded-full border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/65 px-5 py-3 text-sm font-semibold text-[var(--glass-text)] transition-all duration-300 hover:border-[var(--site-secondary)]/35 hover:text-[var(--site-secondary)]"
                                        >
                                            <ExternalLink size={16} />
                                            Source Link
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                                {projectFacts.map(({ label, value, Icon }) => (
                                    <div
                                        key={label}
                                        className="rounded-[1.75rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/50 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.14)] backdrop-blur-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--site-sidebar-bg)]/70 text-[var(--site-secondary)] shadow-inner">
                                                <Icon size={18} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--glass-text-muted)]">{label}</p>
                                                <p className="text-sm font-semibold text-[var(--glass-text)]">{value}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        <div className="relative z-10 grid grid-cols-1 gap-10 xl:grid-cols-12 xl:gap-14">
                            <div className="xl:col-span-4">
                                <motion.div
                                    className="space-y-5 xl:sticky xl:top-28"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-80px" }}
                                    variants={staggerContainer}
                                >
                                    <motion.section
                                        variants={fadeInUp}
                                        className="rounded-[2rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/55 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl"
                                    >
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--glass-text-muted)]">Project Navigator</p>
                                        <div className="mt-4 space-y-3">
                                            {projectSections.map((section, index) => (
                                                <button
                                                    key={section.label}
                                                    type="button"
                                                    onClick={() => scrollToSectionKey(section.key)}
                                                    className="flex w-full items-center justify-between rounded-[1.4rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/55 px-4 py-4 text-left transition-all duration-300 hover:border-[var(--site-secondary)]/30 hover:bg-[var(--site-sidebar-active)]/75"
                                                >
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--glass-text-muted)]">
                                                            {String(index + 1).padStart(2, "0")}
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-[var(--glass-text)]">{section.label}</p>
                                                        <p className="mt-1 text-xs leading-5 text-[var(--glass-text-muted)]">{section.detail}</p>
                                                    </div>
                                                    <ChevronRight size={18} className="text-[var(--site-secondary)]" />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.section>

                                    <motion.section
                                        variants={fadeInUp}
                                        className="rounded-[2rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/55 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl"
                                    >
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--glass-text-muted)]">Project Signals</p>
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <div className="rounded-[1.35rem] bg-[var(--site-sidebar-bg)]/55 p-4">
                                                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--glass-text-muted)]">Views</p>
                                                <p className="mt-2 text-xl font-black text-[var(--glass-text)]">{formatViewCount(project.views)}</p>
                                            </div>
                                            <div className="rounded-[1.35rem] bg-[var(--site-sidebar-bg)]/55 p-4">
                                                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--glass-text-muted)]">Likes</p>
                                                <p className="mt-2 text-xl font-black text-[var(--glass-text)]">{likeCount}</p>
                                            </div>
                                            <div className="rounded-[1.35rem] bg-[var(--site-sidebar-bg)]/55 p-4">
                                                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--glass-text-muted)]">Comments</p>
                                                <p className="mt-2 text-xl font-black text-[var(--glass-text)]">{comments.length}</p>
                                            </div>
                                            <div className="rounded-[1.35rem] bg-[var(--site-sidebar-bg)]/55 p-4">
                                                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--glass-text-muted)]">Read</p>
                                                <p className="mt-2 text-xl font-black text-[var(--glass-text)]">{readingTime}</p>
                                            </div>
                                        </div>
                                    </motion.section>

                                    <motion.div variants={fadeInUp} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                        <button
                                            type="button"
                                            onClick={handleLike}
                                            className={`w-full rounded-[1.6rem] border px-5 py-4 text-sm font-extrabold transition-all duration-300 backdrop-blur-md ${isLiked
                                                ? "border-red-500/40 bg-red-500/18 text-red-400 shadow-[0_0_28px_rgba(239,68,68,0.18)]"
                                                : "border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/55 text-[var(--glass-text)] hover:border-[var(--site-secondary)]/25 hover:bg-[var(--site-sidebar-active)]/75"
                                                }`}
                                        >
                                            <span className="flex items-center justify-center gap-3">
                                                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                                                {isLiked ? "Liked Artwork" : "Appreciate Artwork"}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleBookmark}
                                            className={`w-full rounded-[1.6rem] border px-5 py-4 text-sm font-extrabold transition-all duration-300 backdrop-blur-md ${isBookmarked
                                                ? "border-[var(--site-secondary)]/35 bg-[var(--site-secondary)]/12 text-[var(--site-secondary)] shadow-[0_0_24px_rgba(195,245,255,0.12)]"
                                                : "border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/55 text-[var(--glass-text)] hover:border-[var(--site-secondary)]/25 hover:bg-[var(--site-sidebar-active)]/75"
                                                }`}
                                        >
                                            <span className="flex items-center justify-center gap-3">
                                                <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
                                                {isBookmarked ? "Saved to Bookmarks" : "Save Project"}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setIsShareOpen(true)}
                                            className="w-full rounded-[1.6rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/55 px-5 py-4 text-sm font-extrabold text-[var(--glass-text)] transition-all duration-300 backdrop-blur-md hover:border-[var(--site-secondary)]/25 hover:bg-[var(--site-sidebar-active)]/75 sm:col-span-2 xl:col-span-1"
                                        >
                                            <span className="flex items-center justify-center gap-3">
                                                <Share2 size={18} />
                                                Share Project
                                            </span>
                                        </button>
                                    </motion.div>

                                    {project.tags && project.tags.length > 0 && (
                                        <motion.section
                                            variants={fadeInUp}
                                            className="rounded-[2rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/55 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl"
                                        >
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--glass-text-muted)]">Keywords</p>
                                            <div className="mt-4 flex flex-wrap gap-2.5">
                                                {project.tags.map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-full border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/60 px-3.5 py-2 text-[11px] font-semibold tracking-[0.14em] text-[var(--glass-text-muted)] transition-colors hover:border-[var(--site-secondary)]/30 hover:text-[var(--site-secondary)]"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </motion.section>
                                    )}
                                </motion.div>
                            </div>
                            <div className="space-y-8 xl:col-span-8">
                                <motion.section
                                    ref={storyRef}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                    variants={fadeInUp}
                                    className="scroll-mt-28 rounded-[2rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/50 p-6 shadow-[0_20px_55px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:p-8"
                                >
                                    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--glass-text-muted)]">Project Story</p>
                                            <h3 className="mt-2 text-2xl font-black tracking-tight text-[var(--glass-text)] sm:text-[2rem]">
                                                Inside the craft, decisions, and execution.
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => scrollToSection(stageRef)}
                                            className="inline-flex items-center gap-2 rounded-full border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/60 px-4 py-2.5 text-sm font-semibold text-[var(--glass-text)] transition-all duration-300 hover:border-[var(--site-secondary)]/30 hover:text-[var(--site-secondary)]"
                                        >
                                            Back to Stage
                                            <ChevronRight size={16} className="-rotate-90" />
                                        </button>
                                    </div>

                                    <div className="rounded-[1.8rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/45 p-5 shadow-inner sm:p-7">
                                        <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:mb-4 prose-headings:font-black prose-headings:tracking-tight prose-headings:text-[var(--glass-text)] prose-p:mb-5 prose-p:font-medium prose-p:leading-8 prose-p:text-[var(--glass-text-muted)] prose-blockquote:rounded-r-xl prose-blockquote:border-l-4 prose-blockquote:border-[var(--site-secondary)] prose-blockquote:bg-[var(--site-sidebar-active)]/40 prose-blockquote:py-3 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-[var(--glass-text-muted)] prose-strong:text-[var(--glass-text)] prose-a:text-[var(--site-secondary)] hover:prose-a:text-[var(--site-accent)] prose-li:text-[var(--glass-text-muted)] prose-ul:space-y-2 prose-ol:space-y-2">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {projectBody}
                                            </ReactMarkdown>
                                        </article>
                                    </div>
                                </motion.section>

                                {hasMultipleMedia && (
                                    <motion.section
                                        ref={galleryRef}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-50px" }}
                                        variants={staggerContainer}
                                        className="scroll-mt-28 rounded-[2rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/50 p-6 shadow-[0_20px_55px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:p-8"
                                    >
                                        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--glass-text-muted)]">Stage Gallery</p>
                                                <h3 className="mt-2 flex items-center gap-3 text-2xl font-black tracking-tight text-[var(--glass-text)] sm:text-[2rem]">
                                                    <ZoomIn size={24} className="text-[var(--site-secondary)]" />
                                                    Close-ups & Highlights
                                                </h3>
                                            </div>
                                            <p className="max-w-md text-sm leading-7 text-[var(--glass-text-muted)]">
                                                Each frame below acts like a quick jump. Tap one to promote it back onto the main stage instantly.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {allMedia.map((item, index) => (
                                                <motion.button
                                                    key={index}
                                                    type="button"
                                                    variants={fadeInUp}
                                                    className={`group relative aspect-square overflow-hidden rounded-[2rem] border text-left transition-all duration-500 md:aspect-[4/3] ${activeHeroIndex === index
                                                        ? "border-[var(--site-secondary)] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_45px_rgba(0,0,0,0.24)]"
                                                        : "border-[var(--site-sidebar-border)] hover:border-[var(--site-secondary)]/30"
                                                        }`}
                                                    onClick={() => {
                                                        setActiveHeroIndex(index);
                                                        scrollToSection(stageRef);
                                                    }}
                                                >
                                                    {item.type === "video" ? (
                                                        <video src={item.url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" muted />
                                                    ) : (
                                                        <Image
                                                            src={item.url}
                                                            alt={`Gallery ${index + 1}`}
                                                            fill
                                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                    )}
                                                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,9,14,0.08),rgba(5,9,14,0.62)_100%)]" />
                                                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                                                        <div>
                                                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
                                                                {item.type === "video" ? "Motion Detail" : "Artwork Detail"}
                                                            </p>
                                                            <p className="mt-2 text-base font-semibold text-white">Push back to main stage</p>
                                                        </div>
                                                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/80 backdrop-blur-xl transition-all duration-300 group-hover:bg-black/55 group-hover:text-white">
                                                            <ChevronRight size={18} />
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.section>
                                )}

                                <motion.section
                                    ref={commentsRef}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                    className="scroll-mt-28 rounded-[2rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/50 p-6 shadow-[0_20px_55px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:p-8"
                                >
                                    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--glass-text-muted)]">Thought Exchange</p>
                                            <h3 className="mt-2 flex items-center gap-3 text-2xl font-black tracking-tight text-[var(--glass-text)] sm:text-[2rem]">
                                                <MessageCircle size={24} className="text-[var(--site-secondary)]" />
                                                Discussion Layer
                                                <span className="text-base font-bold text-[var(--glass-text-muted)]">({comments.length})</span>
                                            </h3>
                                        </div>
                                        <p className="max-w-md text-sm leading-7 text-[var(--glass-text-muted)]">
                                            Share critique, appreciation, or context so this project page feels alive instead of static.
                                        </p>
                                    </div>

                                    <div className="mb-10 flex gap-4 rounded-[1.8rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/45 p-4 shadow-inner sm:p-5">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)] backdrop-blur-md shadow-sm">
                                            {session?.user?.id ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={session.user.image || "/placeholder.jpg"} alt="User" onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }} className="h-full w-full object-cover" />
                                            ) : (
                                                <UserIcon size={22} className="text-[var(--glass-text-muted)]" />
                                            )}
                                        </div>

                                        <form onSubmit={handleCommentSubmit} className="flex-1">
                                            <div className="relative">
                                                <textarea
                                                    value={commentText}
                                                    onChange={e => setCommentText(e.target.value)}
                                                    placeholder={!session ? (dict.projects?.login_to_comment || "Login to share your thoughts") : (sessionStatus === "LIMITED" ? (dict.projects?.commenting_restricted || "Commenting restricted") : (dict.projects?.write_thoughts || "Write your thoughts..."))}
                                                    disabled={!session || sessionStatus === "LIMITED"}
                                                    className="min-h-[116px] w-full resize-y rounded-[1.5rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/70 p-5 pr-16 text-[var(--glass-text)] shadow-inner transition-all placeholder:text-[var(--glass-text-muted)] focus:border-[var(--site-secondary)]/60 focus:bg-[var(--glass-bg)] focus:outline-none focus:ring-4 focus:ring-[var(--site-secondary)]/10 disabled:opacity-50"
                                                    rows={3}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!commentText.trim() || isSubmittingComment || sessionStatus === "LIMITED"}
                                                    className="absolute bottom-4 right-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--site-button-text)] shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition-all duration-300 hover:scale-105 active:scale-95 disabled:translate-y-1 disabled:opacity-35 disabled:grayscale"
                                                    style={{ background: "var(--site-button)" }}
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    <div className="space-y-4">
                                        <AnimatePresence>
                                            {comments.length > 0 ? comments.map(comment => (
                                                <motion.div
                                                    key={comment._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex gap-4 rounded-[1.7rem] border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/45 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all duration-300 hover:border-[var(--site-secondary)]/20 hover:bg-[var(--site-sidebar-active)]/65"
                                                >
                                                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)] shadow-sm">
                                                        {comment.user.image ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={comment.user.image} alt={comment.user.username} onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs font-bold font-mono text-[var(--glass-text-muted)]">
                                                                {comment.user.username[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-1.5">
                                                        <div className="flex flex-wrap items-baseline gap-2">
                                                            <span className="text-[15px] font-black tracking-wide text-[var(--glass-text)]">{comment.user.username}</span>
                                                            <span className="text-[11px] font-bold text-[var(--glass-text-muted)]">{formatDate(comment.createdAt)}</span>
                                                        </div>
                                                        <p className="text-sm leading-7 text-[var(--glass-text-muted)] transition-colors duration-300 hover:text-[var(--glass-text)]">
                                                            {comment.text}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )) : (
                                                <p className="rounded-[1.7rem] border border-dashed border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/35 p-8 text-center text-sm font-semibold text-[var(--glass-text-muted)]">
                                                    No comments yet. Be the first to add context, feedback, or appreciation for this project.
                                                </p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.section>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
