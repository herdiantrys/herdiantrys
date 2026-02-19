import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Link as LinkIcon, Calendar, Mail, Shield, FileText, MessageSquare, FolderOpen, Coins, Save } from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner"; // Assuming sonner is available
import { updateUserPoints } from "@/lib/actions/admin.actions";
import { formatNumber, formatDate } from "@/lib/utils";

type UserDetailModalProps = {
    user: any;
    currentUser: any;
    isOpen: boolean;
    onClose: () => void;
};

export default function UserDetailModal({ user, currentUser, isOpen, onClose }: UserDetailModalProps) {
    const [mounted, setMounted] = useState(false);

    // Coin Editing State
    const [coins, setCoins] = useState(0);
    const [isEditingCoins, setIsEditingCoins] = useState(false);
    const [isSavingCoins, setIsSavingCoins] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    useEffect(() => {
        if (user) {
            setCoins(user.points || 0);
        }
    }, [user?.points]);

    const handleSaveCoins = async () => {
        if (!user) return;
        setIsSavingCoins(true);
        const res = await updateUserPoints(user.id, coins);
        setIsSavingCoins(false);
        if (res.success) {
            toast.success("Runes updated successfully");
            setIsEditingCoins(false);
            // Optimization: Update local user object if parent doesn't auto-refresh completely
            // But usually we rely on revalidatePath in action
        } else {
            toast.error(res.error);
        }
    };

    if (!mounted) return null;

    const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div id="user-detail-modal-overlay" className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        id="user-detail-modal-content"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        {/* Close Button */}
                        <button
                            id="user-detail-close-btn"
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
                        >
                            <X size={20} />
                        </button>

                        {/* Banner Image */}
                        <div className="relative h-48 w-full bg-gradient-to-r from-teal-900/50 to-blue-900/50">
                            {user.bannerImage ? (
                                <Image
                                    src={user.bannerImage}
                                    alt="Banner"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                        </div>

                        {/* Profile Content */}
                        <div className="px-8 pb-8 -mt-16 relative">
                            {/* Header: Image & Main Info */}
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
                                <div className="relative w-32 h-32 rounded-full border-4 border-[#0a0a0a] shadow-xl overflow-hidden bg-gray-800 shrink-0">
                                    {user.image ? (
                                        <Image
                                            src={user.image}
                                            alt={user.name || "User"}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 bg-gray-800">
                                            {user.name?.charAt(0) || "U"}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 mb-2">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-3xl font-bold text-white">{user.name}</h2>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 mb-2">@{user.username || "unknown"}</p>
                                    <p className="text-gray-300 text-sm max-w-lg leading-relaxed">
                                        {user.bio || user.headline || "No bio available."}
                                    </p>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center transition-transform hover:scale-105">
                                    <div className="flex justify-center mb-2 text-teal-400">
                                        <FileText size={20} />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {user._count?.posts || 0}
                                    </div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Posts</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center transition-transform hover:scale-105">
                                    <div className="flex justify-center mb-2 text-blue-400">
                                        <FolderOpen size={20} />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {user._count?.projects || 0}
                                    </div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Projects</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center transition-transform hover:scale-105">
                                    <div className="flex justify-center mb-2 text-yellow-400">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {user._count?.comments || 0}
                                    </div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Comments</div>
                                </div>

                                {/* Points / Coins - Editable for Super Admin */}
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center relative group">
                                    <div className="flex justify-center mb-2 text-amber-400">
                                        <Coins size={20} />
                                    </div>

                                    {isSuperAdmin && isEditingCoins ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <input
                                                type="number"
                                                value={coins}
                                                onChange={(e) => setCoins(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-full bg-black/50 border border-teal-500/50 rounded px-2 py-1 text-center text-white font-bold text-sm focus:outline-none"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveCoins}
                                                    disabled={isSavingCoins}
                                                    className="p-1 rounded bg-teal-500/20 text-teal-400 hover:bg-teal-500/40 transition-colors"
                                                >
                                                    <Save size={14} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingCoins(false);
                                                        setCoins(user.points || 0);
                                                    }}
                                                    className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`text-2xl font-bold text-white mb-1 ${isSuperAdmin ? "cursor-pointer hover:text-amber-400 transition-colors" : ""}`}
                                            onClick={() => isSuperAdmin && setIsEditingCoins(true)}
                                            title={isSuperAdmin ? "Click to edit coins" : ""}
                                        >
                                            {formatNumber(coins)}
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                                        Runes
                                    </div>
                                    {isSuperAdmin && !isEditingCoins && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact & Details Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-300 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <Mail size={18} className="text-gray-500" />
                                    <span id="user-detail-email">{user.email}</span>
                                </div>
                                {user.location && (
                                    <div className="flex items-center gap-3 text-sm text-gray-300 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                        <MapPin size={18} className="text-gray-500" />
                                        <span id="user-detail-location">{user.location}</span>
                                    </div>
                                )}
                                {user.website && (
                                    <div className="flex items-center gap-3 text-sm text-blue-400 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                        <LinkIcon size={18} className="text-blue-500" />
                                        <a id="user-detail-website" href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {user.website}
                                        </a>
                                    </div>
                                )}
                                <span>Joined {formatDate(user.createdAt)}</span>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
