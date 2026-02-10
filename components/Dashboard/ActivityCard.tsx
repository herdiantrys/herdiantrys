"use client";

import { Activity } from "@/lib/actions/activity.actions";
import { formatDistanceToNow } from "date-fns";
import { User, FileText, Edit, MessageSquare, Heart, Share2, Bookmark, BookmarkCheck, ArchiveX, MoreHorizontal, Repeat } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import AvatarWithEffect from "../AvatarWithEffect";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState, useTransition } from "react";
import { toggleBookmark } from "@/lib/actions/bookmark.actions";
import { toggleLike } from "@/lib/actions/like.actions";
import { ShareModal } from "@/components/ShareModal";
import { ConfirmationModal } from "@/components/Dashboard/ConfirmationModal";
import { AnimatePresence } from "framer-motion";

import CommentSection from "@/components/Dashboard/CommentSection";

export default function ActivityCard({
    activity,
    userId,
    initialIsBookmarked,
    currentUser,
    t,
    onRemove,
    dbUserId,
    initialShowComments = false,
    isSinglePostView = false
}: {
    activity: Activity,
    userId: string,
    initialIsBookmarked: boolean,
    currentUser?: any,
    t: any,
    onRemove?: () => void,
    dbUserId?: string,
    initialShowComments?: boolean,
    isSinglePostView?: boolean
}) {
    const targetId = activity.id.replace("project-", "").replace("user-", "").replace("post-", "");
    const isBookmarkedType = activity.type === 'new_project' || activity.type === 'project_update' || activity.type === 'user_post';

    // Bookmark State
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const [isBookmarkPending, startBookmarkTransition] = useTransition();

    // Like State
    const [likesCount, setLikesCount] = useState(activity.likesCount || 0);
    const [isLiked, setIsLiked] = useState(activity.isLiked || false);
    const [isLikePending, startLikeTransition] = useTransition();

    // Archive State
    const [isArchivedSuccess, setIsArchivedSuccess] = useState(false);

    // Comment State
    const [showComments, setShowComments] = useState(initialShowComments);

    // Share State
    const [isShareOpen, setIsShareOpen] = useState(false);

    const handleBookmark = async () => {
        // Optimistic Toggle
        const previousState = isBookmarked;
        setIsBookmarked(!previousState);

        startBookmarkTransition(async () => {
            const result = await toggleBookmark(userId, targetId);
            if (result.success && result.isBookmarked !== undefined) {
                // Sync with server truth
                setIsBookmarked(result.isBookmarked);
            } else if (!result.success) {
                // Revert on error
                setIsBookmarked(previousState);
            }
        });
    };

    const handleLike = async () => {
        // Optimistic Toggle
        const previousIsLiked = isLiked;
        const previousLikesCount = likesCount;

        const newIsLiked = !previousIsLiked;
        const newCount = newIsLiked ? previousLikesCount + 1 : previousLikesCount - 1;

        setIsLiked(newIsLiked);
        setLikesCount(newCount);

        startLikeTransition(async () => {
            const targetId = activity.id.replace("project-", "").replace("user-", "").replace("post-", "");

            let targetType: "project" | "user" | "post" = 'project';
            if (activity.type === 'new_user') targetType = 'user';
            if (activity.type === 'user_post') targetType = 'post';

            const result = await toggleLike(userId, targetId, targetType);
            if (result.success && result.isLiked !== undefined) {
                // Sync with server truth
                setIsLiked(result.isLiked);
                // Adjust count if server disagrees with our optimistic flip
                if (result.isLiked !== newIsLiked) {
                    setLikesCount(result.isLiked ? previousLikesCount + 1 : previousLikesCount);
                }
            } else if (!result.success) {
                // Revert completely on error
                setIsLiked(previousIsLiked);
                setLikesCount(previousLikesCount);
            }
        });
    };

    // Repost State
    const [repostsCount, setRepostsCount] = useState(activity.repostsCount || 0);
    const [isReposted, setIsReposted] = useState(activity.isReposted || false);
    const [isRepostPending, startRepostTransition] = useTransition();

    const handleRepost = async () => {
        const previousState = isReposted;
        setIsReposted(!previousState);
        setRepostsCount(previousState ? repostsCount - 1 : repostsCount + 1);

        startRepostTransition(async () => {
            const { repostPost } = await import("@/lib/actions/post.actions");
            const realTargetId = activity.originalPost?.id || targetId;
            const result = await repostPost(realTargetId, userId, "/dashboard");
            if (!result.success) {
                setIsReposted(previousState);
                setRepostsCount(previousState ? repostsCount : repostsCount);
            }
        });
    };

    // Archive Logic
    const [isArchivePending, startArchiveTransition] = useTransition();
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

    const isAuthor = currentUser && activity.type === 'user_post' && activity.actor.username === currentUser.username;
    const canArchive = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin' || isAuthor) && activity.type === 'user_post';

    // Self-Repost Check
    const targetAuthorUsername = activity.originalPost?.author.username || activity.actor.username;
    const isOwnPost = currentUser?.username === targetAuthorUsername;
    const isRepostContext = !!activity.originalPost;

    // Display Actor Logic
    const displayActor = activity.originalPost?.author || activity.actor;

    const handleArchiveClick = () => {
        setIsArchiveModalOpen(true);
    }

    const handleArchiveConfirm = async () => {
        setIsArchiveModalOpen(false);

        // 1. Show Success State
        setIsArchivedSuccess(true);

        startArchiveTransition(async () => {
            const { toggleArchivePost } = await import("@/lib/actions/post.actions");
            const targetId = activity.id.replace("post-", "");

            // Pass BOTH Prisma ID (if available) and Legacy Sanity ID to handle all cases
            // signature: (postId, primaryUserId, alternativeUserId)
            const result = await toggleArchivePost(targetId, dbUserId || userId, userId); // sending userId as alternative check

            if (!result.success) {
                // Revert success state if server action fails
                setIsArchivedSuccess(false);
                alert("Something went wrong: " + result.error);
                return;
            }

            // 2. Remove from Feed after delay
            setTimeout(() => {
                if (onRemove) onRemove();
            }, 1500);
        });
    };

    if (isArchivedSuccess) {
        return (
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                    <ArchiveX size={24} />
                    <span className="font-medium">Post archived successfully.</span>
                </div>
                <button onClick={() => { setIsArchivedSuccess(false); }} className="text-sm underline text-[var(--glass-text-muted)]">
                    Undo
                </button>
            </div>
        );
    }

    // Determine Share URL and Title
    const shareUrl = activity.type === 'new_project' || activity.type === 'project_update'
        ? `/projects/${activity.details.slug}`
        : `/user/${activity.actor.username}`; // Ideally anchor to post ID, but for now user profile

    const shareTitle = activity.details.title || `Check out ${activity.actor.name}'s post`;

    // Determine target type for comments
    let commentTargetType: "project" | "post" | null = null;
    if (activity.type === 'new_project' || activity.type === 'project_update') commentTargetType = 'project';
    if (activity.type === 'user_post') commentTargetType = 'post';

    return (
        <>
            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-md border border-white/10 dark:border-white/10 rounded-2xl p-6 shadow-lg transition-transform hover:scale-[1.01]">
                {/* Repost Header */}
                {activity.originalPost && (
                    <div className="flex items-center gap-2 mb-2 ml-[3.5rem] text-xs font-semibold text-[var(--glass-text-muted)]">
                        <Repeat size={14} />
                        <span>{activity.actor.name} reposted</span>
                    </div>
                )}
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <Link href={`/user/${displayActor.username}`} className="relative group cursor-pointer block">
                        <AvatarWithEffect
                            src={typeof displayActor.image === 'string' ? displayActor.image : (displayActor.image ? urlFor(displayActor.image).url() : undefined)}
                            alt={displayActor.name || "User"}
                            size={48}
                            effect={(displayActor as any).equippedEffect}
                            frame={(displayActor as any).equippedFrame}
                            background={(displayActor as any).equippedBackground}
                        />
                        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-gray-900 border border-gray-700 text-white shadow-sm z-20">
                            {activity.type === 'new_user' && <User size={12} className="text-teal-400" />}
                            {activity.type === 'new_project' && <FileText size={12} className="text-purple-400" />}
                            {activity.type === 'project_update' && <Edit size={12} className="text-blue-400" />}
                            {activity.type === 'user_post' && <MessageSquare size={12} className="text-yellow-400" />}
                        </div>
                    </Link>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/user/${displayActor.username}`} className="font-bold text-[var(--glass-text)] hover:text-teal-400 transition-colors">
                                {displayActor.name}
                            </Link>
                            <span className="text-sm text-[var(--glass-text-muted)]">@{displayActor.username}</span>
                        </div>
                        <p className="text-sm text-[var(--glass-text-muted)]">
                            {activity.type === 'new_user' && (t.joined_community || "joined the community")}
                            {activity.type === 'new_project' && (t.published_project || "published a new project")}
                            {activity.type === 'project_update' && (t.updated_project || "updated a project")}
                            <span className="mx-2 text-xs">•</span>
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                    </div>

                    {/* Action Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 -mr-2 rounded-full hover:bg-[var(--glass-border)] text-[var(--glass-text-muted)] transition-colors">
                                <MoreHorizontal size={20} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border border-[var(--glass-border)] text-[var(--glass-text)]">
                            {canArchive && (
                                <DropdownMenuItem onClick={handleArchiveClick} className="text-red-500 focus:text-red-500 cursor-pointer">
                                    <ArchiveX className="mr-2 h-4 w-4" />
                                    <span>Archive Post</span>
                                </DropdownMenuItem>
                            )}
                            {/* Placeholder for future actions */}
                            <DropdownMenuItem className="cursor-pointer">
                                <Share2 className="mr-2 h-4 w-4" />
                                <span onClick={() => setIsShareOpen(true)}>Copy Link</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Content */}
                <div className="pl-0 md:pl-16 mt-4 md:mt-0">
                    {activity.details.description && activity.type === 'new_user' && (
                        <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-xl p-4">
                            <p className="text-[var(--glass-text)] italic">{t.welcome_quote || "\"Just joined! excited to be here.\""}</p>
                        </div>
                    )}

                    {activity.type === 'new_project' && (
                        <Link href={`/projects/${activity.details.slug}`} className="mt-2 block group cursor-pointer">
                            {activity.details.image && (
                                <div className="relative w-full h-64 rounded-xl overflow-hidden mb-4 border border-white/10">
                                    <Image
                                        src={urlFor(activity.details.image).width(800).url()}
                                        alt={activity.details.title || "Project Image"}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-[var(--glass-text)] group-hover:text-teal-400 transition-colors">
                                {activity.details.title}
                            </h3>
                            <p className="text-[var(--glass-text-muted)] mt-1 line-clamp-2">
                                {activity.details.description}
                            </p>
                        </Link>
                    )}

                    {activity.type === 'user_post' && (
                        isSinglePostView ? (
                            <div className="mt-2 text-[var(--glass-text)]">
                                <p className="mb-3 text-lg leading-relaxed whitespace-pre-wrap">
                                    {activity.details.description}
                                </p>
                                {activity.details.video && (
                                    <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black">
                                        <video
                                            src={activity.details.video}
                                            controls
                                            className="w-full h-auto object-contain max-h-[600px]"
                                        />
                                    </div>
                                )}
                                {activity.details.image && (
                                    <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/50">
                                        <Image
                                            src={urlFor(activity.details.image).width(1200).url()}
                                            alt="Post Image"
                                            width={1200}
                                            height={800}
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href={`/post/${targetId}`} className="mt-2 text-[var(--glass-text)] block cursor-pointer hover:opacity-90 transition-opacity">
                                <p className="mb-3 text-lg leading-relaxed whitespace-pre-wrap">
                                    {activity.details.description}
                                </p>
                                {activity.details.video && (
                                    <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black relative" onClick={(e) => e.stopPropagation()}>
                                        {/* Stop propagation so clicking controls doesn't navigate */}
                                        <video
                                            src={activity.details.video}
                                            controls
                                            className="w-full h-auto object-contain max-h-[500px]"
                                            onPlay={(e) => e.stopPropagation()}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                )}
                                {activity.details.image && (
                                    <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/50">
                                        <Image
                                            src={urlFor(activity.details.image).width(1200).url()}
                                            alt="Post Image"
                                            width={1200}
                                            height={800}
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>
                                )}
                            </Link>
                        )
                    )}
                </div>

                {/* Action Footer */}
                <div className="pl-0 md:pl-16 mt-4 flex items-center justify-between md:justify-start gap-2 md:gap-6 border-t border-white/10 pt-3">
                    <button
                        onClick={handleLike}
                        disabled={isLikePending}
                        className={`flex items-center gap-2 text-sm transition-colors group/btn ${isLiked ? 'text-red-500' : 'text-[var(--glass-text-muted)] hover:text-red-400'}`}
                    >
                        <Heart size={16} className={`transition-transform ${isLiked ? 'fill-current scale-110' : 'group-hover/btn:scale-110'}`} />
                        <span>{likesCount > 0 ? likesCount : (t.like || 'Like')}</span>
                    </button>
                    {commentTargetType && (
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`flex items-center gap-2 text-sm transition-colors group/btn ${showComments ? 'text-blue-400' : 'text-[var(--glass-text-muted)] hover:text-blue-400'}`}>
                            <MessageSquare size={16} className="group-hover/btn:scale-110 transition-transform" />
                            <span>{activity.commentsCount && activity.commentsCount > 0 ? activity.commentsCount : (t.comment || 'Comment')}</span>
                        </button>
                    )}
                    {/* Repost Button */}
                    <button
                        onClick={handleRepost}
                        disabled={isRepostPending || isOwnPost || isRepostContext}
                        className={`flex items-center gap-2 text-sm transition-colors group/btn ${(isOwnPost || isRepostContext) ? 'opacity-50 cursor-not-allowed' : ''} ${isReposted ? 'text-green-500' : 'text-[var(--glass-text-muted)] hover:text-green-500'}`}
                        title={isOwnPost ? "Cannot repost your own post" : (isRepostContext ? "Cannot repost a repost" : undefined)}
                    >
                        <Repeat size={16} className={`transition-transform ${isReposted ? 'rotate-180' : 'group-hover/btn:rotate-180'}`} />
                        <span>{repostsCount > 0 ? repostsCount : (t.repost || "Repost")}</span>
                    </button>
                    <button
                        onClick={() => setIsShareOpen(true)}
                        className="flex items-center gap-2 text-sm text-[var(--glass-text-muted)] hover:text-teal-400 transition-colors group/btn md:ml-auto"
                    >
                        <Share2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                        <span>{t.share || "Share"}</span>
                    </button>

                    {isBookmarkedType && (
                        <button
                            onClick={handleBookmark}
                            disabled={isBookmarkPending}
                            className={`flex items-center gap-2 text-sm transition-colors group/btn ${isBookmarked ? 'text-yellow-400' : 'text-[var(--glass-text-muted)] hover:text-yellow-400'}`}
                        >
                            {isBookmarked ? (
                                <BookmarkCheck size={16} className="group-hover/btn:scale-110 transition-transform" />
                            ) : (
                                <Bookmark size={16} className="group-hover/btn:scale-110 transition-transform" />
                            )}
                            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                        </button>
                    )}
                </div>

                {/* Comment Section */}
                {showComments && commentTargetType && (
                    <div className="pl-0 md:pl-16 mt-4">
                        <CommentSection
                            targetId={targetId}
                            targetType={commentTargetType}
                            userId={userId}
                            currentUserImage={currentUser?.imageURL || currentUser?.profileImage}
                            currentUserEffect={currentUser?.equippedEffect}
                            currentUserFrame={currentUser?.equippedFrame}
                            currentUserBackground={currentUser?.equippedBackground}
                        />
                    </div>
                )}
            </div >

            <AnimatePresence>
                {isShareOpen && (
                    <ShareModal
                        isOpen={isShareOpen}
                        onClose={() => setIsShareOpen(false)}
                        url={shareUrl}
                        title={shareTitle}
                    />
                )}
                {isArchiveModalOpen && (
                    <ConfirmationModal
                        isOpen={isArchiveModalOpen}
                        onClose={() => setIsArchiveModalOpen(false)}
                        onConfirm={handleArchiveConfirm}
                        title={t.archive_title || "Archive Post?"}
                        description={t.archive_desc || "This post will be hidden from your profile and the public feed. You can restore it later from your archive settings."}
                        confirmText={t.archive_confirm || "Archive"}
                        cancelText={t.cancel || "Cancel"}
                        isDestructive={true}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
