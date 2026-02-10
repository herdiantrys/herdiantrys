
"use client";

import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import { Heart, MessageSquare, UserPlus, Bell, Gift, Coins } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationItem({ notification, onClick }: { notification: any; onClick: () => void }) {
    const { sender, type, relatedPost, read, createdAt } = notification;

    const getIcon = () => {
        switch (type) {
            case 'like_post': return <Heart size={16} className="text-pink-500 fill-pink-500" />;
            case 'comment_post': return <MessageSquare size={16} className="text-blue-500 fill-blue-500" />;
            case 'follow': return <UserPlus size={16} className="text-green-500" />;
            case 'system': return <Coins size={16} className="text-yellow-500 animate-pulse" />;
            default: return <Bell size={16} className="text-yellow-500" />;
        }
    };

    const getMessage = () => {
        switch (type) {
            case 'like_post': return "liked your post";
            case 'comment_post': return "commented on your post";
            case 'follow': return "started following you";
            case 'system': return "You received 10 Coins";
            default: return "sent a notification";
        }
    };

    const linkHref = relatedPost ? `/dashboard` : `/user/${sender.username}`;

    const resolveAvatar = (image: any, fallbackUrl: string) => {
        if (!image) return fallbackUrl;

        // Check if strictly Sanity object
        if (image.asset?._ref || (typeof image === 'object' && image._type === 'image')) {
            try {
                return urlFor(image).width(100).url();
            } catch (e) {
                // If urlFor fails, fallback
                return fallbackUrl;
            }
        }

        // If string or other format, return as is or fallback
        if (typeof image === 'string') return image;
        return fallbackUrl;
    };

    const avatarUrl = resolveAvatar(sender.profileImage, sender.imageURL);

    return (
        <Link
            href={linkHref}
            onClick={onClick}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${read
                ? "bg-transparent border-transparent hover:bg-white/5"
                : "bg-white/5 border-teal-500/30 hover:bg-white/10"
                }`}
        >
            <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                    <img
                        src={avatarUrl}
                        alt={sender.username}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-1 shadow-sm">
                    {getIcon()}
                </div>
            </div>

            <div className="flex-1">
                <p className="text-sm text-[var(--glass-text)]">
                    {type !== 'system' && <span className="font-bold">{sender.fullName}</span>} <span className="text-[var(--glass-text-muted)]">{getMessage()}</span>
                </p>
                {relatedPost && relatedPost.text && (
                    <p className="text-xs text-[var(--glass-text-muted)] mt-1 line-clamp-1 italic">
                        "{relatedPost.text}"
                    </p>
                )}
                <p className="text-xs text-[var(--glass-text-muted)] mt-2">
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </p>
            </div>

            {!read && (
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2" />
            )}
        </Link>
    );
}
