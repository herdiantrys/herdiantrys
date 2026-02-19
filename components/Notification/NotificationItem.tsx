"use client";

import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import { Heart, MessageSquare, UserPlus, Bell, Gift, Coins, Zap, Trophy, Repeat } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationItem({ notification, onClick }: { notification: any; onClick: () => void }) {
    const { sender, type, relatedPost, relatedProject, read, createdAt } = notification;

    const getIcon = () => {
        switch (type) {
            case 'like_post':
            case 'like_project': return <Heart size={14} className="text-pink-500 fill-pink-500" />;
            case 'comment_post':
            case 'comment_project': return <MessageSquare size={14} className="text-blue-500 fill-blue-500" />;
            case 'repost_post': return <Repeat size={14} className="text-purple-500" />;
            case 'follow': return <UserPlus size={14} className="text-green-500" />;
            case 'system': return <Coins size={14} className="text-yellow-500 animate-pulse" />;
            case 'xp_award': return <Zap size={14} className="text-[var(--site-secondary)] fill-[var(--site-secondary)]" />;
            case 'coin_award': return <Coins size={14} className="text-yellow-500 fill-yellow-500" />;
            case 'achievement':
            case 'badge_awarded': return <Trophy size={14} className="text-yellow-400 fill-yellow-400" />;
            default: return <Bell size={14} className="text-yellow-500" />;
        }
    };

    const getMessage = () => {
        const details = notification.details || {};
        switch (type) {
            case 'like_post': return <span>liked your post</span>;
            case 'like_project': return <span>liked your project</span>;
            case 'comment_post': return <span>commented on your post</span>;
            case 'comment_project': return <span>commented on your project</span>;
            case 'repost_post': return <span>reposted your post</span>;
            case 'follow': return <span>started following you</span>;
            case 'system': return <span>You received 10 Runes</span>;
            case 'xp_award': return <span>earned <span className="font-bold text-[var(--site-secondary)]">{details.amount} XP</span> for {details.reason}</span>;
            case 'coin_award': return <span>{details.amount < 0 ? 'spent' : 'earned'} <span className="font-bold text-yellow-500">{Math.abs(details.amount)} Runes</span> for {details.reason}</span>;
            case 'badge_awarded': return <span>earned the <span className="font-bold text-yellow-500">{details.badgeName}</span> badge! {details.badgeIcon || ''}</span>;
            case 'achievement': return <span>unlocked a new achievement: <span className="font-bold text-yellow-500">{details.achievementTitle || 'Achievement'}</span>!</span>;
            default: return <span>sent a notification</span>;
        }
    };

    const linkHref = relatedPost ? `/dashboard`
        : relatedProject ? `/projects/${relatedProject.slug}`
            : type === 'achievement' || type === 'badge_awarded' ? `/profile/${sender.username}`
                : `/profile/${sender.username}`;

    const resolveAvatar = (image: any, fallbackUrl: string) => {
        if (!image) return fallbackUrl;
        if (image.asset?._ref || (typeof image === 'object' && image._type === 'image')) {
            try {
                return urlFor(image).width(100).url();
            } catch (e) {
                return fallbackUrl;
            }
        }
        if (typeof image === 'string') return image;
        return fallbackUrl;
    };

    const avatarUrl = resolveAvatar(sender.profileImage, sender.imageURL);

    return (
        <Link
            href={linkHref}
            onClick={onClick}
            className={`flex items-start gap-4 p-3 rounded-xl transition-all relative overflow-hidden group border border-transparent ${read
                ? "bg-transparent hover:bg-white/5 opacity-70 hover:opacity-100"
                : "bg-white/5 hover:bg-white/10 border-white/5"
                }`}
        >
            {!read && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--site-secondary)] rounded-l-xl" />
            )}

            <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-full overflow-hidden bg-gray-800 ring-2 ${!read ? 'ring-[var(--site-secondary)]/50' : 'ring-transparent'}`}>
                    <img
                        src={avatarUrl}
                        alt={sender.username}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1a1a1a] rounded-full p-1 shadow-md border border-gray-100 dark:border-white/10">
                    {getIcon()}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-[var(--glass-text)] leading-snug">
                    {type !== 'system' && !['xp_award', 'coin_award', 'achievement', 'badge_awarded'].includes(type) && (
                        <span className="font-bold text-white mr-1 group-hover:underline decoration-[var(--site-secondary)] decoration-2 underline-offset-2">
                            {sender.fullName}
                        </span>
                    )}
                    <span className="text-[var(--glass-text-muted)]">{getMessage()}</span>
                </p>
                {relatedPost && relatedPost.text && (
                    <div className="mt-1.5 pl-2 border-l-2 border-white/10">
                        <p className="text-xs text-[var(--glass-text-muted)] italic line-clamp-1">
                            "{relatedPost.text}"
                        </p>
                    </div>
                )}
                {relatedProject && (
                    <div className="mt-1.5 pl-2 border-l-2 border-white/10">
                        <p className="text-xs text-[var(--glass-text-muted)] font-bold line-clamp-1">
                            {relatedProject.title}
                        </p>
                    </div>
                )}
                <p className="text-[10px] text-[var(--glass-text-muted)] mt-1.5 font-medium opacity-60">
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </p>
            </div>

            {/* Hover Indicator */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--site-secondary)] shadow-[0_0_10px_var(--site-secondary)]" />
            </div>
        </Link>
    );
}
