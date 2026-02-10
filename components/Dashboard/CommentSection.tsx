"use client";

import { useState, useEffect, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, Loader2 } from "lucide-react";
import { createComment, getComments, Comment } from "@/lib/actions/comment.actions";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AvatarWithEffect from "@/components/AvatarWithEffect";

interface CommentSectionProps {
    targetId: string;
    targetType: "project" | "post";
    userId: string;
    currentUserImage?: string | any;
    currentUserEffect?: string;
    currentUserFrame?: string;
    currentUserBackground?: string;
}

export default function CommentSection({ targetId, targetType, userId, currentUserImage, currentUserEffect, currentUserFrame, currentUserBackground }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        const fetchComments = async () => {
            const data = await getComments(targetId, targetType);
            setComments(data);
            setIsLoading(false);
        };
        fetchComments();
    }, [targetId, targetType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const tempId = `temp-${Date.now()}`;
        const tempComment: Comment = {
            _id: tempId,
            text: newComment,
            createdAt: new Date().toISOString(),
            user: {
                _id: userId,
                fullName: "You", // Placeholder until refresh
                username: "you",
                imageURL: "",
                profileImage: currentUserImage,
                equippedEffect: currentUserEffect,
                equippedFrame: currentUserFrame,
                equippedBackground: currentUserBackground
            }
        };

        // Optimistic update
        setComments(prev => [tempComment, ...prev]);
        setNewComment("");

        startTransition(async () => {
            const result = await createComment(targetId, targetType, tempComment.text);
            if (!result.success || !result.comment) {
                // Revert on failure
                setComments(prev => prev.filter(c => c._id !== tempId));
                alert("Failed to post comment");
            } else {
                // Replace temp comment with real comment
                setComments(prev => prev.map(c => c._id === tempId ? result.comment as Comment : c));
                router.refresh(); // Update stats counters elsewhere
            }
        });
    };

    return (
        <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
                <div className="flex-shrink-0">
                    <AvatarWithEffect
                        src={(() => {
                            if (!currentUserImage) return undefined;
                            if (typeof currentUserImage === 'string') return currentUserImage;
                            try {
                                return urlFor(currentUserImage).width(100).url();
                            } catch (e) {
                                return undefined;
                            }
                        })()}
                        alt="You"
                        size={32}
                        effect={currentUserEffect}
                        frame={currentUserFrame}
                        background={currentUserBackground}
                    />
                </div>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-[var(--glass-text)] focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all pr-10"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-teal-400 hover:text-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </div>
            </form>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-[var(--glass-text-muted)]" />
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                    {comments.map((comment) => {
                        if (!comment.user) return null;
                        return (
                            <div key={comment._id} className="flex gap-3 group">
                                <Link href={`/user/${comment.user.username}`} className="flex-shrink-0 mt-1">
                                    <AvatarWithEffect
                                        src={(() => {
                                            if (!comment.user.profileImage) return comment.user.imageURL;
                                            if (typeof comment.user.profileImage === 'string') return comment.user.profileImage;
                                            try {
                                                if (comment.user.profileImage && typeof comment.user.profileImage === 'object') {
                                                    return urlFor(comment.user.profileImage).width(100).url();
                                                }
                                                return comment.user.imageURL;
                                            } catch (e) {
                                                return comment.user.imageURL;
                                            }
                                        })()}
                                        alt={comment.user.fullName}
                                        size={32}
                                        effect={comment.user.equippedEffect}
                                        frame={comment.user.equippedFrame}
                                        background={comment.user.equippedBackground}
                                    />
                                </Link>
                                <div className="flex-1">
                                    <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-2 inline-block max-w-[90%]">
                                        <Link href={`/user/${comment.user.username}`} className="text-xs font-bold text-[var(--glass-text)] hover:text-teal-400 mr-2">
                                            {comment.user.fullName}
                                        </Link>
                                        <span className="text-[var(--glass-text)] text-sm">{comment.text}</span>
                                    </div>
                                    <div className="ml-2 mt-1 flex items-center gap-3">
                                        <span className="text-[10px] text-[var(--glass-text-muted)]">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-2 text-sm text-[var(--glass-text-muted)]">
                    No comments yet. Be the first to say something!
                </div>
            )}
        </div >
    );
}
