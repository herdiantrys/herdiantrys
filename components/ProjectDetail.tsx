"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Eye, Heart, MessageCircle, Share2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import { toggleLike, postComment } from "@/app/(root)/projects/[slug]/actions";
import { incrementView } from "@/actions/incrementView";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatViewCount } from "@/lib/utils";

interface Comment {
    _id: string;
    text: string;
    user: {
        username: string;
        image?: string;
    };
    createdAt: string;
}

interface ProjectDetailProps {
    project: {
        _id: string;
        title: string;
        slug: { current: string };
        category: { title: string };
        image: any;
        videoFile?: any;
        content: any;
        uploadDate: string;
        views: number;
        likes: any[];
        comments: Comment[];
        tags?: string[];
        gallery?: {
            _type: 'image' | 'file';
            asset: { url: string };
        }[];
    };
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(project.likes?.length || 0);
    const [comments, setComments] = useState<Comment[]>(project.comments || []);
    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    useEffect(() => {
        if (session?.user?.id && project.likes) {
            setIsLiked(project.likes.some((like: any) => like._ref === session?.user?.id));
        }
    }, [session, project.likes]);

    // Update like count when project prop changes (e.g. from live update)
    useEffect(() => {
        setLikeCount(project.likes?.length || 0);
    }, [project.likes]);

    // Update comments when project prop changes (e.g. from revalidation)
    useEffect(() => {
        setComments(project.comments || []);
    }, [project.comments]);

    // Increment view on mount (once)
    const hasIncremented = useRef(false);
    useEffect(() => {
        if (!hasIncremented.current) {
            incrementView(project._id);
            hasIncremented.current = true;
        }
    }, [project._id]);

    const handleLike = async () => {
        if (!session) {
            router.push("/login");
            return;
        }

        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

        const result = await toggleLike(project._id, project.slug.current);
        if (result.error) {
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            router.push("/login");
            return;
        }
        if (!commentText.trim()) return;

        setIsSubmittingComment(true);

        // Optimistic Update
        const newComment: Comment = {
            _id: Math.random().toString(36).substr(2, 9), // Temporary ID
            text: commentText,
            user: {
                username: session.user?.name || "User",
                image: session.user?.image || undefined
            },
            createdAt: new Date().toISOString()
        };

        setComments(prev => [newComment, ...prev]);
        setCommentText("");

        const result = await postComment(project._id, project.slug.current, commentText);

        if (result.error) {
            // Revert on error
            setComments(prev => prev.filter(c => c._id !== newComment._id));
            alert("Failed to post comment");
        }

        setIsSubmittingComment(false);
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] transition-colors mb-8 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to Works</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Media */}
                    <div className="relative aspect-video rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl bg-[var(--glass-bg)]">
                        {project.videoFile ? (
                            <video
                                src={project.videoFile} // You'll need to resolve the file URL properly
                                controls
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            project.image && (
                                <Image
                                    src={urlFor(project.image).url()}
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            )
                        )}
                    </div>

                    {/* Gallery Grid */}
                    {project.gallery && project.gallery.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {project.gallery.map((item, index) => (
                                <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-[var(--glass-border)] bg-[var(--glass-bg)] group cursor-pointer">
                                    {item._type === 'file' ? ( // Assuming file type is video based on schema
                                        <video
                                            src={item.asset.url}
                                            className="w-full h-full object-cover"
                                            controls
                                        />
                                    ) : (
                                        <Image
                                            src={urlFor(item).url()}
                                            alt={`Gallery ${index}`}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Title & Meta Mobile */}
                    <div className="lg:hidden space-y-4">
                        <div className="flex items-center gap-3 text-sm text-[var(--glass-text-muted)]">
                            <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/20">
                                {project.category?.title}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(project.uploadDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--glass-text)]">{project.title}</h1>
                    </div>

                    {/* Content */}
                    <div className="glass p-8 rounded-3xl border-[var(--glass-border)] prose prose-invert max-w-none text-[var(--glass-text)]">
                        <PortableText value={project.content} />
                    </div>

                    {/* Comments Section */}
                    <div className="glass p-8 rounded-3xl border-[var(--glass-border)] space-y-8">
                        <h3 className="text-xl font-bold text-[var(--glass-text)] flex items-center gap-2">
                            <MessageCircle size={20} />
                            Comments ({comments.length})
                        </h3>

                        {/* Comment Form */}
                        <form onSubmit={handleCommentSubmit} className="flex gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder={session ? "Write a comment..." : "Login to comment"}
                                    disabled={!session || isSubmittingComment}
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl pl-4 pr-12 py-3 text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/50 focus:outline-none focus:border-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim() || isSubmittingComment}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-teal-500 hover:bg-teal-500/10 transition-colors disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment._id} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden relative">
                                        {comment.user.image ? (
                                            <Image
                                                src={comment.user.image}
                                                alt={comment.user.username}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span>{comment.user.username[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-[var(--glass-text)]">{comment.user.username}</span>
                                            <span className="text-xs text-[var(--glass-text-muted)]">
                                                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-[var(--glass-text-muted)] text-sm">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && (
                                <p className="text-center text-[var(--glass-text-muted)] py-4">No comments yet. Be the first!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-3xl border-[var(--glass-border)] sticky top-24 space-y-6">
                        {/* Desktop Title */}
                        <div className="hidden lg:block space-y-4">
                            <div className="flex items-center gap-3 text-sm text-[var(--glass-text-muted)]">
                                <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/20">
                                    {project.category?.title}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(project.uploadDate).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-[var(--glass-text)]">{project.title}</h1>
                            {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 text-xs rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/20">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-[var(--glass-border)]" />

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                                <div className="flex items-center justify-center gap-2 text-[var(--glass-text-muted)] mb-1">
                                    <Eye size={18} />
                                    <span className="text-sm">Views</span>
                                </div>
                                <span className="text-2xl font-bold text-[var(--glass-text)]">{formatViewCount(project.views)}</span>
                            </div>
                            <button
                                onClick={handleLike}
                                className={`text-center p-4 rounded-2xl border transition-all ${isLiked
                                    ? "bg-pink-500/10 border-pink-500/20 text-pink-500"
                                    : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--glass-text-muted)] hover:text-pink-500 hover:border-pink-500/20"
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                                    <span className="text-sm">Likes</span>
                                </div>
                                <span className="text-2xl font-bold text-[var(--glass-text)]">{likeCount}</span>
                            </button>
                        </div>

                        <button className="w-full py-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--glass-text)] hover:bg-[var(--glass-border)] transition-all flex items-center justify-center gap-2">
                            <Share2 size={18} />
                            <span>Share Project</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
