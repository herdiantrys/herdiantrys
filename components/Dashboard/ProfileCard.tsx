"use client";

import Link from "next/link";
import { Camera, Edit, MapPin, Link as LinkIcon, Coins } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import EditProfileModal from "./EditProfileModal";
import { uploadProfileImage } from "@/lib/actions/user.actions";
import { getUserPoints } from "@/lib/actions/points.actions";
import { motion } from "framer-motion";

export default function ProfileCard({
    user,
    isPublic = false,
    isCollapsed = false
}: {
    user: any;
    isPublic?: boolean;
    isCollapsed?: boolean
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [points, setPoints] = useState(user?.points || 0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isProfilePage = pathname?.includes("/user/");

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
            className={`glass-liquid flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 ${isUploading ? 'animate-pulse' : ''} ${isCollapsed ? 'p-2 rounded-2xl' : ''}`}
        >
            <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} user={user} />

            {/* Banner Section */}
            {!isCollapsed && (
                <div className="w-full h-32 relative bg-gradient-to-r from-teal-100/50 to-blue-100/50 dark:from-teal-900/50 dark:to-slate-900/50">
                    {bannerUrl && (
                        <img
                            src={bannerUrl}
                            alt="Profile Banner"
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/40 dark:from-black/20 to-transparent" />
                </div>
            )}

            {/* Main Content */}
            <div className={`w-full relative flex flex-col items-center transition-all duration-500 ${isCollapsed ? 'px-0 pb-0' : 'px-6 pb-6'}`}>

                <div
                    onClick={handleImageClick}
                    className={`relative group transition-all duration-500
                        ${isCollapsed ? 'w-12 h-12 mb-0' : 'w-20 h-20 -mt-10 sm:w-24 sm:h-24 sm:-mt-12 mb-3'} 
                        ${!isPublic ? 'cursor-pointer' : ''}`}>

                    {(user.equippedBackground || user.equippedEffect) && (
                        <>
                            {user.equippedBackground && (user.equippedBackground.startsWith('http') || user.equippedBackground.startsWith('/')) ? (
                                <div className="absolute -inset-4 rounded-full opacity-60 blur-xl transition-opacity duration-500 overflow-hidden">
                                    <img
                                        src={user.equippedBackground}
                                        alt="Background"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div
                                    className={`absolute -inset-4 rounded-full opacity-60 blur-xl transition-opacity duration-500
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
                            className={`absolute -inset-2 rounded-full opacity-50 blur-lg group-hover:opacity-75 transition-opacity duration-500
                                ${user.equippedFrame === 'custom-color' ? '' : `bg-gradient-to-br ${user.equippedFrame}`}
                            `}
                            style={user.equippedFrame === 'custom-color' && user.frameColor ? { background: `linear-gradient(135deg, ${user.frameColor}, ${user.frameColor})` } : {}}
                        />
                    )}

                    <div className={`relative w-full h-full rounded-full shadow-2xl overflow-hidden
                         ${(user.equippedFrame) && !(user.equippedFrame?.startsWith('/') || user.equippedFrame?.startsWith('http')) && user.equippedFrame !== 'custom-color'
                            ? `p-1 bg-gradient-to-br ${user.equippedFrame}`
                            : 'border-4 border-white dark:border-[#121212] bg-white dark:bg-[#121212]'} 
                         ${user.equippedFrame === 'custom-color' ? 'p-1' : ''}
                         ${!isPublic ? 'hover:border-teal-400/50 transition-colors' : ''}
                    `}
                        style={user.equippedFrame === 'custom-color' && user.frameColor ? { background: `linear-gradient(135deg, ${user.frameColor}, ${user.frameColor})` } : {}}
                    >

                        <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-100 dark:bg-[#121212]">

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
                                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
                                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            <img
                                src={profileUrl}
                                alt={user.fullName || "User"}
                                className="w-full h-full object-cover relative z-10"
                            />

                            {!isPublic && !isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                    <Camera size={14} className="text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        <h2 className="text-xl font-bold text-[var(--glass-text)] mb-1">{user.fullName}</h2>
                        <p className="text-sm text-[var(--glass-text-muted)] mb-3">@{user.username}</p>

                        <Link
                            href={user.username ? `/${pathname?.split('/')[1] || 'en'}/user/${user.username}?tab=inventory` : "/inventory"}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)] backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform"
                        >
                            <Coins size={16} className="text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">
                                {points.toLocaleString('en-US')} Runes
                            </span>
                        </Link>

                        {user.headline && (
                            <p className="text-sm text-[var(--glass-text)] italic mb-4 px-4">{user.headline}</p>
                        )}

                        <div className="flex flex-col items-center gap-2 mb-6 text-sm text-[var(--glass-text-muted)]">
                            {user.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-teal-400" />
                                    <span>{user.location}</span>
                                </div>
                            )}
                            {user.socialLinks && user.socialLinks.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-3 mt-1">
                                    {user.socialLinks.map((link: any, idx: number) => (
                                        <a
                                            key={idx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 hover:text-teal-400 transition-colors"
                                        >
                                            <LinkIcon size={14} className="text-teal-400" />
                                            <span>{link.platform || "Website"}</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:justify-center gap-4 sm:gap-6 text-sm text-[var(--glass-text-muted)] mb-6 w-full px-4">
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-base sm:text-lg text-[var(--glass-text)]">{user.stats?.posts || 0}</span>
                                <span className="text-[10px] sm:text-sm">Posts</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-base sm:text-lg text-[var(--glass-text)]">{user.stats?.likes || 0}</span>
                                <span className="text-[10px] sm:text-sm">Likes</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-base sm:text-lg text-[var(--glass-text)]">{user.stats?.comments || 0}</span>
                                <span className="text-[10px] sm:text-sm">Comments</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-base sm:text-lg text-[var(--glass-text)]">{user.bookmarks?.length || 0}</span>
                                <span className="text-[10px] sm:text-sm">Saved</span>
                            </div>
                        </div>

                        {isPublic ? (
                            <button className="w-full py-2.5 px-4 rounded-xl bg-white/10 text-[var(--glass-text)] font-medium hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-2">
                                <span>Follow</span>
                            </button>
                        ) : (
                            isProfilePage ? (
                                <button
                                    onClick={() => setIsEditOpen(true)}
                                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 border border-white/10 text-[var(--glass-text)] font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                                    <Edit size={16} />
                                    <span>Edit Profile</span>
                                </button>
                            ) : (
                                <Link
                                    href={`/user/${user.username}`}
                                    className="block w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
                                >
                                    My Profile
                                </Link>
                            )
                        )}
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
        </div>
    );
}
