"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, User, Mail, AtSign, Shield, Coins, FileText, MapPin, Globe } from "lucide-react";
import { toast } from "sonner";
import { updateUserAdmin } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";

interface UserEditModalProps {
    user: any;
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
}

export default function UserEditModal({ user, isOpen, onClose, currentUser }: UserEditModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        role: "USER",
        points: 0,
        bio: "",
        headline: "",
        location: "",
        website: ""
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
    const canEditRole = isSuperAdmin || (currentUser?.role === "ADMIN" && user?.role !== "SUPER_ADMIN");

    // Initialize form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                username: user.username || "",
                email: user.email || "",
                role: user.role || "USER",
                points: user.points || 0,
                bio: user.bio || "",
                headline: user.headline || "",
                location: user.location || "",
                website: user.website || ""
            });
            setErrors({});
        }
    }, [user]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Name validation
        if (!formData.name || formData.name.trim().length === 0) {
            newErrors.name = "Name is required";
        }

        // Username validation
        if (!formData.username || formData.username.trim().length === 0) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3 || formData.username.length > 30) {
            newErrors.username = "Username must be 3-30 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = "Username can only contain letters, numbers, and underscores";
        }

        // Email validation
        if (!formData.email || formData.email.trim().length === 0) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        // Points validation
        if (formData.points < 0) {
            newErrors.points = "Points cannot be negative";
        }

        // Website validation (if provided)
        if (formData.website && formData.website.trim().length > 0) {
            if (!/^https?:\/\/.+/.test(formData.website)) {
                newErrors.website = "Website must start with http:// or https://";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        setLoading(true);
        try {
            const result = await updateUserAdmin(user.id, formData) as any;
            if (result.success) {
                toast.success("User updated successfully");
                router.refresh();
                onClose();
            } else {
                toast.error(result.error || "Failed to update user");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("An error occurred while updating user");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const availableRoles = isSuperAdmin
        ? ["USER", "WRITER", "MODERATOR", "ADMIN", "SUPER_ADMIN"]
        : ["USER", "WRITER", "MODERATOR", "ADMIN"];

    if (!isOpen) return null;

    return typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass p-6 rounded-2xl w-full max-w-2xl bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-gray-200 dark:border-white/10 shadow-2xl my-8"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                            disabled={loading}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <User size={16} />
                                    Name *
                                </div>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border ${errors.name ? "border-red-500" : "border-gray-200 dark:border-white/10"} rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-teal-500 transition-colors`}
                                disabled={loading}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <AtSign size={16} />
                                    Username *
                                </div>
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => handleChange("username", e.target.value)}
                                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border ${errors.username ? "border-red-500" : "border-gray-200 dark:border-white/10"} rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-teal-500 transition-colors`}
                                disabled={loading}
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    Email *
                                </div>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border ${errors.email ? "border-red-500" : "border-gray-200 dark:border-white/10"} rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-teal-500 transition-colors`}
                                disabled={loading}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Role and Points Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Shield size={16} />
                                        Role
                                    </div>
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => handleChange("role", e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
                                    disabled={loading || !canEditRole}
                                >
                                    {availableRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Points */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Coins size={16} className="text-amber-500" />
                                        Runes
                                    </div>
                                </label>
                                <input
                                    type="number"
                                    value={formData.points}
                                    onChange={(e) => handleChange("points", parseFloat(e.target.value) || 0)}
                                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border ${errors.points ? "border-red-500" : "border-gray-200 dark:border-white/10"} rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-teal-500 transition-colors`}
                                    disabled={loading}
                                    min="0"
                                    step="0.01"
                                />
                                {errors.points && <p className="text-red-500 text-xs mt-1">{errors.points}</p>}
                            </div>
                        </div>

                        {/* Headline */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} />
                                    Headline
                                </div>
                            </label>
                            <input
                                type="text"
                                value={formData.headline}
                                onChange={(e) => handleChange("headline", e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
                                disabled={loading}
                                placeholder="e.g. Full Stack Developer"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} />
                                    Bio
                                </div>
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => handleChange("bio", e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                                disabled={loading}
                                rows={3}
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        {/* Location and Website Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        Location
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => handleChange("location", e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
                                    disabled={loading}
                                    placeholder="e.g. Jakarta, Indonesia"
                                />
                            </div>

                            {/* Website */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Globe size={16} />
                                        Website
                                    </div>
                                </label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => handleChange("website", e.target.value)}
                                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border ${errors.website ? "border-red-500" : "border-gray-200 dark:border-white/10"} rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-teal-500 transition-colors`}
                                    disabled={loading}
                                    placeholder="https://example.com"
                                />
                                {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors font-medium"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    ) : null;
}
