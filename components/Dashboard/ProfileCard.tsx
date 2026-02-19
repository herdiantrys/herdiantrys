"use client";

import Link from "next/link";
import { Camera, Edit, MapPin, Link as LinkIcon, Coins, MessageSquare } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import EditProfileModal from "./EditProfileModal";
import { uploadProfileImage, followUser, unfollowUser } from "@/lib/actions/user.actions";
import { getUserPoints } from "@/lib/actions/points.actions";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner"; // Assuming sonner is used for toasts, if not I'll adjust
import { formatNumber } from "@/lib/utils";

export default function ProfileCard({
    user,
    isPublic = false,
    isCollapsed = false
}: {
    user: any;
    isPublic?: boolean;
    isCollapsed?: boolean
}) {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;
    const pathname = usePathname();
    const router = useRouter();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [points, setPoints] = useState(user?.points || 0);
    const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
    const [followersCount, setFollowersCount] = useState(user.stats?.followers || 0);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFollowToggle = async () => {
        if (!currentUserId) {
            toast.error("Please login to follow users");
            return;
        }
        if (isFollowLoading) return;

        setIsFollowLoading(true);
        const originallyFollowing = isFollowing;

        // Optimistic UI
        setIsFollowing(!originallyFollowing);
        setFollowersCount((prev: number) => originallyFollowing ? prev - 1 : prev + 1);

        try {
            let res;
            if (originallyFollowing) {
                res = await unfollowUser(currentUserId, user._id || user.id);
            } else {
                res = await followUser(currentUserId, user._id || user.id);
            }

            if (!res.success) {
                // Rollback
                setIsFollowing(originallyFollowing);
                setFollowersCount((prev: number) => originallyFollowing ? prev + 1 : prev - 1);
                toast.error("Failed to update follow status");
            } else {
                toast.success(originallyFollowing ? "Unfollowed user" : "Following user");
                router.refresh();
            }
        } catch (error) {
            // Rollback
            setIsFollowing(originallyFollowing);
            setFollowersCount((prev: number) => originallyFollowing ? prev + 1 : prev - 1);
            toast.error("Something went wrong");
        } finally {
            setIsFollowLoading(false);
        }
    };

    const isProfilePage = pathname?.includes("/profile/");

    const handleImageClick = () => {
        if (!isPublic) {
            fileInputRef.current?.click();
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("image", file);
            await uploadProfileImage(user._id, formData);
            router.refresh();
            setIsUploading(false);
        }
    };

    const resolveImageUrl = (image: any, width = 600) => {
        if (!image) return null;
        if (typeof image === 'string') return image;
        if (image?.asset?.url) return image.asset.url;
        try {
            return urlFor(image).width(width).url();
        } catch (e) {
            return null;
        }
    };

    const bannerUrl = resolveImageUrl(user.bannerImage, 600);
    const profileUrl = resolveImageUrl(user.profileImage, 200) || user.imageURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "User")}&background=random`;

    return (
        <div
            onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty("--mouse-x", `${x}px`);
                card.style.setProperty("--mouse-y", `${y}px`);
            }}
            className={`bg-white/5 dark:bg-black/40 backdrop-blur-3xl border border-white/10 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 rounded-2xl group/profile-card ${isUploading ? 'animate-pulse' : ''} ${isCollapsed ? 'p-2' : ''}`}
        >
            {/* Dynamic Spotlight Effect */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover/profile-card:opacity-100 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(var(--site-secondary-rgb), 0.1), transparent 40%)`
                }}
            />

            <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} user={user} />

            {/* Banner Section with Refined Overlay */}
            {!isCollapsed && (
                <div className="w-full h-32 relative bg-gradient-to-r from-[var(--site-primary)]/30 to-[var(--site-primary)]/50 overflow-hidden group/banner">
                    {bannerUrl && (
                        <img
                            src={bannerUrl}
                            alt="Profile Banner"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/banner:scale-110"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Decorative Arcane Orb */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--site-secondary)]/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
                </div>
            )}

            {/* Main Content */}
            <div className={`w-full relative z-10 flex flex-col items-center transition-all duration-500 ${isCollapsed ? 'px-0 pb-0' : 'px-6 pb-8'}`}>

                {/* Avatar with Enhanced Halo */}
                <div
                    onClick={handleImageClick}
                    className={`relative group transition-all duration-500
                        ${isCollapsed ? 'w-12 h-12 mb-0' : 'w-20 h-20 -mt-10 sm:w-28 sm:h-28 sm:-mt-14 mb-4'} 
                        ${!isPublic ? 'cursor-pointer' : ''}`}>

                    {/* Halo Glow Effects */}
                    <div className="absolute inset-0 rounded-full bg-[var(--site-secondary)]/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {(user.equippedBackground || user.equippedEffect) && (
                        <>
                            {user.equippedBackground && (user.equippedBackground.startsWith('http') || user.equippedBackground.startsWith('/')) ? (
                                <div className="absolute -inset-6 rounded-full opacity-40 blur-2xl transition-opacity duration-500 overflow-hidden pointer-events-none">
                                    <img
                                        src={user.equippedBackground}
                                        alt="Background"
                                        className="w-full h-full object-cover animate-spin-slow"
                                    />
                                </div>
                            ) : (
                                <div
                                    className={`absolute -inset-6 rounded-full opacity-40 blur-2xl transition-opacity duration-500 pointer-events-none
                                        ${user.equippedBackground
                                            ? user.equippedBackground
                                            : (user.equippedEffect ? `bg-gradient-to-br ${user.equippedEffect}` : '')
                                        }
                                    `}
                                />
                            )}
                        </>
                    )}

                    {user.equippedFrame && (
                        <div
                            className={`absolute -inset-2 rounded-full opacity-40 blur-xl group-hover:opacity-60 transition-opacity duration-500 pointer-events-none
                                ${user.equippedFrame === 'custom-color' ? '' : `bg-gradient-to-br ${user.equippedFrame}`}
                            `}
                            style={user.equippedFrame === 'custom-color' && user.frameColor ? { background: `linear-gradient(135deg, ${user.frameColor}, ${user.frameColor})` } : {}}
                        />
                    )}

                    <div className={`relative w-full h-full rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden
                         ${(user.equippedFrame) && !(user.equippedFrame?.startsWith('/') || user.equippedFrame?.startsWith('http')) && user.equippedFrame !== 'custom-color'
                            ? `p-1.5 bg-gradient-to-br ${user.equippedFrame}`
                            : 'border-[6px] border-[#121212] bg-[#121212]'} 
                         ${user.equippedFrame === 'custom-color' ? 'p-1.5' : ''}
                         ${!isPublic ? 'hover:scale-105 transition-transform' : ''}
                    `}
                        style={user.equippedFrame === 'custom-color' && user.frameColor ? { background: `linear-gradient(135deg, ${user.frameColor}, ${user.frameColor})` } : {}}
                    >

                        <div className="w-full h-full rounded-full overflow-hidden relative bg-[#1a1a1a] p-1">

                            {user.equippedFrame && (user.equippedFrame.startsWith('http') || user.equippedFrame.startsWith('/')) && (
                                <div className="absolute inset-0 z-20 pointer-events-none">
                                    <img
                                        src={user.equippedFrame}
                                        alt="Frame"
                                        className="w-full h-full object-cover scale-110"
                                    />
                                </div>
                            )}

                            {isUploading && (
                                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <div className="w-8 h-8 border-2 border-[var(--site-secondary)] border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            <img
                                src={profileUrl}
                                alt={user.fullName || "User"}
                                className="w-full h-full rounded-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "U")}&background=random`;
                                }}
                            />

                            {!isPublic && !isUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 backdrop-blur-[2px]">
                                    <Camera size={18} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full"
                    >
                        <div className="mb-4">
                            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm mb-0.5">{user.fullName}</h2>
                            <p className="text-xs font-bold text-[var(--site-secondary)] uppercase tracking-widest opacity-80">@{user.username}</p>
                        </div>

                        <Link
                            href={user.username ? `/${pathname?.split('/')[1] || 'en'}/profile/${user.username}?tab=inventory` : "/inventory"}
                            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-gradient-to-br from-[var(--site-accent)]/20 via-[var(--site-accent)]/5 to-transparent border border-[var(--site-accent)]/20 mb-6 shadow-xl backdrop-blur-md cursor-pointer hover:border-[var(--site-accent)]/40 hover:scale-105 transition-all group/runes"
                        >
                            <div className="p-1.5 rounded-lg bg-[var(--site-accent)]/20">
                                <Coins size={16} className="text-[var(--site-accent)] animate-pulse group-hover/runes:scale-110 transition-transform" />
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] text-[var(--site-accent)]/60 font-black uppercase tracking-tighter mb-1">Soul Fortune</span>
                                <span className="font-black text-lg text-white font-mono tracking-tight underline decoration-[var(--site-accent)]/30 decoration-2 underline-offset-4">
                                    {formatNumber(points)} <span className="text-sm font-bold text-[var(--site-accent)]/80">R</span>
                                </span>
                            </div>
                        </Link>

                        {user.headline && (
                            <div className="mb-6 relative">
                                <p className="text-sm text-slate-300 italic px-6 leading-relaxed">
                                    <span className="text-2xl text-[var(--site-secondary)] opacity-20 absolute -top-2 left-2 font-serif">"</span>
                                    {user.headline}
                                    <span className="text-2xl text-[var(--site-secondary)] opacity-20 absolute -bottom-6 right-2 font-serif">"</span>
                                </p>
                            </div>
                        )}

                        {/* Location and Links - Card within Card style */}
                        {(user.location || (user.socialLinks && user.socialLinks.length > 0)) && (
                            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mb-6 backdrop-blur-sm">
                                <div className="flex flex-col gap-3 text-xs">
                                    {user.location && (
                                        <div className="flex items-center justify-center gap-2 text-slate-400">
                                            <MapPin size={12} className="text-[var(--site-secondary)]" />
                                            <span className="font-bold tracking-tight">{user.location}</span>
                                        </div>
                                    )}
                                    {user.socialLinks && user.socialLinks.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-4">
                                            {user.socialLinks.map((link: any, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[var(--site-secondary)] transition-all font-bold group/link"
                                                >
                                                    <div className="p-1 rounded bg-white/5 group-hover/link:bg-[var(--site-secondary)]/10">
                                                        <LinkIcon size={10} />
                                                    </div>
                                                    <span>{link.platform || "Link"}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Stats Matrix */}
                        <div className="grid grid-cols-4 gap-2 mb-8 px-2">
                            {[
                                { label: 'Posts', value: user.stats?.posts || 0 },
                                { label: 'Followers', value: followersCount },
                                { label: 'Likes', value: user.stats?.likes || 0 },
                                { label: 'Talks', value: user.stats?.comments || 0 },
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-center p-2 rounded-xl bg-white/[0.02] border border-white/5 group/stat hover:bg-white/[0.05] transition-all">
                                    <span className="font-black text-lg text-white group-hover/stat:text-[var(--site-secondary)] transition-colors leading-none mb-1">
                                        {stat.value}
                                    </span>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Main Action Buttons */}
                        <div className="px-2">
                            {isPublic ? (
                                <div className="flex flex-col gap-2">
                                    {currentUserId !== (user._id || user.id) ? (
                                        <button
                                            onClick={handleFollowToggle}
                                            disabled={isFollowLoading}
                                            className={`w-full py-3.5 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_10px_20px_rgba(var(--site-secondary-rgb),0.3)] hover:shadow-[0_15px_30px_rgba(var(--site-secondary-rgb),0.4)] transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50
                                                ${isFollowing
                                                    ? 'bg-white/10 border border-white/20 text-white'
                                                    : 'bg-gradient-to-r from-[var(--site-secondary)] to-[var(--site-secondary)]/80 text-white'}
                                            `}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                {isFollowLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                                <span>{isFollowing ? "Break Tether" : "Forge Follow"}</span>
                                            </div>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditOpen(true)}
                                            className="w-full py-3.5 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs"
                                        >
                                            Edit Essence
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('open-direct-message', {
                                                detail: { recipientId: user.id || user._id }
                                            }));
                                        }}
                                        className="w-full py-3 px-6 rounded-2xl bg-white/10 border border-white/10 hover:border-[var(--site-secondary)]/50 text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 group/msg"
                                    >
                                        <MessageSquare size={14} className="group-hover/msg:scale-110 transition-transform" />
                                        <span>Send Message</span>
                                    </button>
                                </div>
                            ) : (
                                isProfilePage ? (
                                    <button
                                        onClick={() => setIsEditOpen(true)}
                                        className="w-full group/btn relative py-3.5 px-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--site-secondary)]/40 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden shadow-xl"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--site-secondary)]/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                        <Edit size={16} className="text-[var(--site-secondary)] relative z-10" />
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--site-secondary)] relative z-10">
                                            Modify Essence
                                        </span>
                                    </button>
                                ) : (
                                    <Link
                                        href={`/profile/${user.username}`}
                                        className="block w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[var(--site-secondary)] to-[var(--site-secondary)]/80 text-white font-black uppercase tracking-[0.2em] text-xs shadow-[0_10px_20px_rgba(var(--site-secondary-rgb),0.3)] hover:shadow-[0_15px_30px_rgba(var(--site-secondary-rgb),0.4)] transition-all hover:scale-[1.03] text-center"
                                    >
                                        Visit Sanctuary
                                    </Link>
                                )
                            )}
                        </div>
                    </motion.div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>

            {/* Background Grain/Noise */}
            <div className="absolute inset-0 z-[-1] opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />
        </div >
    );
}
