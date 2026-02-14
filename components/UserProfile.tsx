"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, MapPin, Link as LinkIcon, X, Save, Settings, User, Bell, Shield, Moon, Monitor, Camera, Trash2 } from "lucide-react";
import { updateUserProfile, uploadProfileImage, removeProfileImage, uploadBannerImage, removeBannerImage } from "@/lib/actions/user.actions";
import { urlFor } from "@/sanity/lib/image";
import { useRouter } from "next/navigation";

const UserProfile = ({ user, isOwner, dict }: { user: any; isOwner: boolean; dict: any }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
    const [formData, setFormData] = useState({
        fullName: user.fullName || "",
        headline: user.headline || "",
        bio: user.bio || "",
        location: user.location || "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    // Mock Settings State
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: true,
            marketing: false
        },
        privacy: {
            publicProfile: true,
            showEmail: false
        },
        appearance: {
            darkMode: true,
            compactMode: false
        }
    });

    const router = useRouter();

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateUserProfile(user._id, { ...formData, username: user.username });
        setIsSaving(false);
        if (result.success) {
            setIsEditing(false);
            router.refresh();
        } else {
            alert("Failed to update profile");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        const result = await uploadProfileImage(user._id, formData);
        setIsUploading(false);

        if (result.success) {
            router.refresh();
        } else {
            alert("Failed to upload image");
        }
    };

    const handleRemoveImage = async () => {
        if (!confirm("Are you sure you want to remove your profile photo?")) return;

        setIsUploading(true);
        const result = await removeProfileImage(user._id);
        setIsUploading(false);

        if (result.success) {
            router.refresh();
        } else {
            alert("Failed to remove image");
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingBanner(true);
        const formData = new FormData();
        formData.append("image", file);

        const result = await uploadBannerImage(user._id, formData);
        setIsUploadingBanner(false);

        if (result.success) {
            router.refresh();
        } else {
            alert("Failed to upload banner");
        }
    };

    const handleRemoveBanner = async () => {
        if (!confirm("Are you sure you want to remove your banner?")) return;

        setIsUploadingBanner(true);
        const result = await removeBannerImage(user._id);
        setIsUploadingBanner(false);

        if (result.success) {
            router.refresh();
        } else {
            alert("Failed to remove banner");
        }
    };

    const toggleSetting = (category: keyof typeof settings, setting: string) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [setting]: !prev[category][setting as keyof typeof prev[typeof category]]
            }
        }));
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--site-accent)]/20 rounded-full blur-3xl translate-y-1/2" />
            </div>

            <div className="container mx-auto max-w-5xl relative z-10">
                {/* Profile Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="glass rounded-3xl overflow-hidden border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md mb-8"
                >
                    <div className="h-80 md:h-[500px] bg-gradient-to-r from-purple-500/30 to-[var(--site-accent)]/30 relative group"
                        style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
                    >
                        {user.bannerImage && (
                            <Image
                                src={urlFor(user.bannerImage).width(1200).url()}
                                alt="Banner"
                                fill
                                className="object-cover"
                            />
                        )}

                        {isOwner && (
                            <div className="absolute top-4 right-4 flex gap-2">
                                <label className="p-2 glass rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer">
                                    <Camera size={20} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleBannerUpload}
                                        disabled={isUploadingBanner}
                                    />
                                </label>
                                {user.bannerImage && (
                                    <button
                                        onClick={handleRemoveBanner}
                                        disabled={isUploadingBanner}
                                        className="p-2 glass rounded-full hover:bg-red-500/20 text-white hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 glass rounded-full hover:bg-white/10 transition-colors text-white"
                                >
                                    <Edit2 size={20} />
                                </button>
                            </div>
                        )}

                        {isUploadingBanner && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    <div className="px-6 pb-6 md:px-8 md:pb-8 relative">
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-end -mt-12 md:-mt-16">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[var(--glass-bg)] overflow-hidden bg-gray-800 shadow-xl flex-shrink-0">
                                <Image
                                    src={user.profileImage ? urlFor(user.profileImage).width(400).url() : (user.imageURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`)}
                                    alt={user.fullName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 mb-2 text-center md:text-left mt-2 md:mt-0">
                                <h1 className="text-2xl md:text-4xl font-bold text-[var(--glass-text)] mb-1">{user.fullName}</h1>
                                <p className="text-lg md:text-xl text-[var(--glass-text-muted)] font-medium">@{user.username}</p>
                            </div>
                            {isOwner && (
                                <div className="flex gap-3 mb-2 w-full md:w-auto justify-center md:justify-start">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`flex-1 md:flex-none px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'profile' ? 'bg-white text-black' : 'glass text-white hover:bg-white/10'}`}
                                    >
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('settings')}
                                        className={`flex-1 md:flex-none px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'settings' ? 'bg-white text-black' : 'glass text-white hover:bg-white/10'}`}
                                    >
                                        Settings
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' ? (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            {/* Left Column: Info */}
                            <div className="md:col-span-2 space-y-8">
                                <div className="glass p-6 md:p-8 rounded-3xl border-[var(--glass-border)] bg-[var(--glass-bg)]">
                                    <h2 className="text-2xl font-bold text-[var(--glass-text)] mb-6 flex items-center gap-2">
                                        <User size={24} className="text-[var(--site-accent)]" /> {dict.profile.about}
                                    </h2>
                                    <div className="space-y-6">
                                        {user.headline && (
                                            <div>
                                                <h3 className="text-sm font-medium text-[var(--glass-text-muted)] uppercase tracking-wider mb-2">{dict.profile.headline}</h3>
                                                <p className="text-lg text-[var(--site-accent)] font-medium">{user.headline}</p>
                                            </div>
                                        )}
                                        {user.bio && (
                                            <div>
                                                <h3 className="text-sm font-medium text-[var(--glass-text-muted)] uppercase tracking-wider mb-2">{dict.profile.bio}</h3>
                                                <p className="text-[var(--glass-text-muted)] leading-relaxed">{user.bio}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Details */}
                            <div className="space-y-8">
                                <div className="glass p-6 md:p-8 rounded-3xl border-[var(--glass-border)] bg-[var(--glass-bg)]">
                                    <h2 className="text-xl font-bold text-[var(--glass-text)] mb-6">{dict.profile.details}</h2>
                                    <div className="space-y-4">
                                        {user.location && (
                                            <div className="flex items-center gap-3 text-[var(--glass-text-muted)]">
                                                <div className="p-2 rounded-lg bg-white/5">
                                                    <MapPin size={18} />
                                                </div>
                                                <span>{user.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 text-[var(--glass-text-muted)]">
                                            <div className="p-2 rounded-lg bg-white/5">
                                                <LinkIcon size={18} />
                                            </div>
                                            <span className="italic opacity-50">No website added</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="glass p-8 rounded-3xl border-[var(--glass-border)] bg-[var(--glass-bg)]"
                        >
                            <h2 className="text-2xl font-bold text-[var(--glass-text)] mb-8 flex items-center gap-2">
                                <Settings size={24} className="text-[var(--site-accent)]" /> Account Settings
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Notifications */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Bell size={20} className="text-purple-400" /> Notifications
                                    </h3>
                                    <div className="space-y-4">
                                        {Object.entries(settings.notifications).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                                <span className="capitalize text-gray-300">{key} Notifications</span>
                                                <button
                                                    onClick={() => toggleSetting('notifications', key)}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-[var(--site-accent)]' : 'bg-gray-600'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Privacy */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Shield size={20} className="text-blue-400" /> Privacy
                                    </h3>
                                    <div className="space-y-4">
                                        {Object.entries(settings.privacy).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                                <span className="capitalize text-gray-300">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <button
                                                    onClick={() => toggleSetting('privacy', key)}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-[var(--site-accent)]' : 'bg-gray-600'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Appearance */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Monitor size={20} className="text-orange-400" /> Appearance
                                    </h3>
                                    <div className="space-y-4">
                                        {Object.entries(settings.appearance).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                                <span className="capitalize text-gray-300">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <button
                                                    onClick={() => toggleSetting('appearance', key)}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-[var(--site-accent)]' : 'bg-gray-600'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Edit Modal (Same as before but styled to match) */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass w-full max-w-lg rounded-2xl p-6 border-[var(--glass-border)] bg-[#1a1a1a] shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-6 flex flex-col items-center gap-4">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
                                    <Image
                                        src={user.profileImage ? urlFor(user.profileImage).width(400).url() : (user.imageURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`)}
                                        alt="Profile Preview"
                                        fill
                                        className="object-cover"
                                    />
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <label className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-white cursor-pointer transition-colors">
                                        Change Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                        />
                                    </label>
                                    {(user.profileImage || user.imageURL) && (
                                        <button
                                            onClick={handleRemoveImage}
                                            disabled={isUploading}
                                            className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-sm text-red-500 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--site-accent)] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Headline</label>
                                    <input
                                        type="text"
                                        value={formData.headline}
                                        onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--site-accent)] transition-colors"
                                        placeholder="e.g. Creative Developer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--site-accent)] transition-colors resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--site-accent)] transition-colors"
                                        placeholder="e.g. New York, NY"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-[var(--site-accent-prev)] to-[var(--site-accent-next)] text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                                >
                                    {isSaving ? "Saving..." : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserProfile;
