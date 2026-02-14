"use client";

import { useState, useRef } from "react";
import { X, Save, Loader2, Camera, Upload, Image as ImageIcon } from "lucide-react";
import { Portal } from "@/components/Portal";
import { motion, AnimatePresence } from "framer-motion";
import { updateUserProfile, uploadBannerImage, uploadProfileImage, uploadCustomBackground, removeCustomBackground } from "@/lib/actions/user.actions";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { toast } from "sonner";
import ImageCropper from "../ImageCropper";

type EditProfileModalProps = {
    isOpen: boolean;
    onClose: () => void;
    user: any;
};

import { useProfileColor } from "@/components/Profile/ProfileColorContext";

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
    const { setColor } = useProfileColor();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // Simulated progress
    const [formData, setFormData] = useState({
        fullName: user.fullName || "",
        headline: user.headline || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        username: user.username,
        profileColor: user.profileColor || "",
    });

    const hasCustomColor = user?.inventory?.some((item: any) => item.shopItem?.name === "Custom Color Background");
    const hasCustomBgItem = user?.inventory?.some((item: any) => item.shopItem?.name === "Custom Background Image");

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

    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [customBgFile, setCustomBgFile] = useState<File | null>(null);
    const [shouldResetBg, setShouldResetBg] = useState(false);


    const [previewBanner, setPreviewBanner] = useState<string | null>(resolveImageUrl(user.bannerImage, 600));
    const [previewProfile, setPreviewProfile] = useState<string | null>(resolveImageUrl(user.profileImage, 200) || user.imageURL || null);

    // Check preferences for existing custom background URL
    const [previewCustomBg, setPreviewCustomBg] = useState<string | null>(
        user?.preferences?.customBackgroundUrl ||
        (user?.equippedBackground?.startsWith('http') ? user.equippedBackground : null)
    );

    // Cropping State
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [cropType, setCropType] = useState<'banner' | 'profile' | 'customBg' | null>(null);

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);
    const customBgInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Live Preview for Color
        if (name === 'profileColor') {
            setColor(value);
        }
    };

    // Reset preview color on close or cancel if not saved?
    // Ideally we'd store the initial color and revert if they cancel.
    // Let's create a revert effect on unmount/close if not saved.
    // Implementing simple "Revert on specific Cancel" logic:
    const handleClose = () => {
        if (!isLoading) { // Prevent closing during save
            // Revert color to original user color
            setColor(user.profileColor || null);
            onClose();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'profile' | 'customBg') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (type === 'banner') {
                    // Open cropper for banner
                    setCropImageSrc(event.target?.result as string);
                    setCropType('banner');
                } else if (type === 'profile') {
                    // Profile image direct update (or could crop too)
                    setProfileFile(file);
                    setPreviewProfile(event.target?.result as string);
                } else if (type === 'customBg') {
                    // Custom Background direct update
                    setCustomBgFile(file);
                    setPreviewCustomBg(event.target?.result as string);
                    setShouldResetBg(false);
                }
            };
            reader.readAsDataURL(file);
        }
        // Reset input value to allow selecting same file again
        e.target.value = '';
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        if (cropType === 'banner') {
            const file = new File([croppedBlob], "banner_cropped.jpg", { type: "image/jpeg" });
            setBannerFile(file);
            setPreviewBanner(URL.createObjectURL(croppedBlob));
            toast.success("Banner cropped successfully!");
        }
        setCropImageSrc(null);
        setCropType(null);
    };

    const handleCancelCrop = () => {
        setCropImageSrc(null);
        setCropType(null);
        toast.info("Image selection cancelled");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setUploadProgress(10); // Start progress

        // Simulate progress timer
        const timer = setInterval(() => {
            setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
        }, 300);

        try {
            // Upload images
            if (bannerFile) {
                const bannerFormData = new FormData();
                bannerFormData.append("image", bannerFile);
                await uploadBannerImage(user._id, bannerFormData);
            }

            if (profileFile) {
                const profileFormData = new FormData();
                profileFormData.append("image", profileFile);
                await uploadProfileImage(user._id, profileFormData);
            }

            if (shouldResetBg) {
                await removeCustomBackground(user._id);
            } else if (customBgFile) {
                const bgFormData = new FormData();
                bgFormData.append("image", customBgFile);
                await uploadCustomBackground(user._id, bgFormData);
            }

            // Update text data
            const result = await updateUserProfile(user._id, formData);

            clearInterval(timer);
            setUploadProgress(100);

            if (result.success) {
                toast.success("Profile updated successfully!", {
                    description: "Your changes are now live on your profile.",
                });
                onClose();
            } else {
                throw new Error("Update returned unsuccessful");
            }
        } catch (error) {
            clearInterval(timer);
            setUploadProgress(0);
            console.error("Update error:", error);
            toast.error("Failed to update profile", {
                description: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-lg bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden ring-1 ring-black/5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Edit Profile</h3>
                        <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Image Upload Area */}
                        <div className="relative mb-10 group">
                            {/* Banner Area */}
                            <div className="relative h-36 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-inner group-hover/banner:border-teal-500/50 transition-colors">
                                {previewBanner ? (
                                    <Image
                                        src={previewBanner}
                                        alt="Banner Preview"
                                        fill
                                        className="object-cover opacity-90 group-hover:opacity-60 transition-all duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-purple-500/10 to-teal-500/10 dark:from-purple-500/20 dark:to-teal-500/20" />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        type="button"
                                        onClick={() => bannerInputRef.current?.click()}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white/90 dark:bg-black/70 hover:bg-white dark:hover:bg-black/90 rounded-full text-gray-900 dark:text-white backdrop-blur-md shadow-lg border border-black/5 dark:border-white/10 transition-all transform hover:scale-105"
                                    >
                                        <Camera size={18} />
                                        <span className="font-medium text-sm">Change Banner</span>
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={bannerInputRef}
                                    onChange={(e) => handleFileChange(e, 'banner')}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>

                            {/* Profile Image Area */}
                            <div className="absolute -bottom-8 left-6">
                                <div className="relative w-24 h-24 rounded-full border-[5px] border-white dark:border-[#0a0a0a] overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-xl group/avatar cursor-pointer"
                                    onClick={() => profileInputRef.current?.click()}
                                >
                                    {previewProfile ? (
                                        <Image
                                            src={previewProfile}
                                            alt="Profile Preview"
                                            fill
                                            className="object-cover group-hover/avatar:opacity-60 transition-all duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
                                            <Camera size={28} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                                        <Upload size={22} className="text-white drop-shadow-md" />
                                    </div>
                                    <input
                                        type="file"
                                        ref={profileInputRef}
                                        onChange={(e) => handleFileChange(e, 'profile')}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            {/* Form Fields... */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--glass-text-muted)] mb-1.5 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--glass-text-muted)] mb-1.5 ml-1">Headline</label>
                                <input
                                    type="text"
                                    name="headline"
                                    value={formData.headline}
                                    onChange={handleChange}
                                    placeholder="Software Engineer, Designer..."
                                    className="w-full bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--glass-text-muted)] mb-1.5 ml-1">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--glass-text-muted)] mb-1.5 ml-1">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--glass-text-muted)] mb-1.5 ml-1">Website</label>
                                    <input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="w-full bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            {hasCustomColor && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--glass-text-muted)] mb-1.5 ml-1">
                                        Profile Background Color
                                    </label>
                                    <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2">
                                        <input
                                            type="color"
                                            name="profileColor"
                                            value={formData.profileColor || "#000000"}
                                            onChange={handleChange}
                                            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent"
                                        />
                                        <span className="text-sm text-[var(--glass-text-muted)] font-mono uppercase">
                                            {formData.profileColor || "Default"}
                                        </span>
                                        {formData.profileColor && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, profileColor: "" });
                                                    setColor(""); // Live Reset
                                                }}
                                                className="text-xs text-red-400 hover:text-red-300 ml-auto px-2 py-1 rounded-md hover:bg-white/5"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-[var(--glass-text-muted)] mt-1 ml-1">
                                        This color will apply to your profile header and single page view.
                                    </p>
                                </div>
                            )}

                            {hasCustomBgItem && (
                                <div className="mt-6 border-t border-gray-100 dark:border-white/5 pt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--glass-text-muted)] mb-3 ml-1">
                                        Custom Profile Background
                                    </label>

                                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-black/40 border-2 border-dashed border-gray-300 dark:border-white/10 group hover:border-teal-500/50 transition-colors">
                                        {previewCustomBg ? (
                                            <>
                                                <Image
                                                    src={previewCustomBg}
                                                    alt="Custom Background"
                                                    fill
                                                    className="object-cover opacity-80"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="flex flex-col gap-2 scale-90 group-hover:scale-100 transition-transform">
                                                        <button
                                                            type="button"
                                                            onClick={() => customBgInputRef.current?.click()}
                                                            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white text-sm font-medium border border-white/20 hover:bg-white/20"
                                                        >
                                                            Change Image
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPreviewCustomBg(null);
                                                                setCustomBgFile(null);
                                                                setShouldResetBg(true);
                                                            }}
                                                            className="px-4 py-2 bg-red-500/20 backdrop-blur-md rounded-lg text-red-400 text-sm font-medium border border-red-500/30 hover:bg-red-500/40"
                                                        >
                                                            Remove Background
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div
                                                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-gray-400 dark:text-gray-500 hover:text-teal-500 transition-colors"
                                                onClick={() => customBgInputRef.current?.click()}
                                            >
                                                <ImageIcon size={24} className="mb-2" />
                                                <span className="text-xs font-medium">Click to upload image</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={customBgInputRef}
                                            onChange={(e) => handleFileChange(e, 'customBg')}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                    <p className="text-xs text-[var(--glass-text-muted)] mt-2 ml-1">
                                        This image will be used as your profile background when you equip the "Custom Background Image" item.
                                    </p>
                                </div>
                            )}

                            {/* Loading Bar Indicator */}
                            {isLoading && (
                                <div className="mt-4 bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-teal-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${uploadProgress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            )}

                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-white/5 mt-6">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-5 py-2.5 rounded-xl text-gray-700 dark:text-[var(--glass-text)] hover:bg-gray-100 dark:hover:bg-white/5 font-medium transition-colors"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 min-w-[140px] justify-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>{Math.round(uploadProgress)}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>

                {/* Cropper Modal */}
                {cropImageSrc && (
                    <ImageCropper
                        imageSrc={cropImageSrc}
                        onCancel={handleCancelCrop}
                        onCropComplete={handleCropComplete}
                        aspect={cropType === 'banner' ? 3 / 1 : 1}
                    />
                )}
            </div>
        </Portal>
    );
}
