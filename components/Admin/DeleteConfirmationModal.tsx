"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    isDeleting?: boolean;
    count?: number;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Post",
    description,
    isDeleting = false,
    count = 1
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    const finalDescription = description || (count > 1
        ? `Are you sure you want to delete these ${count} posts? This action cannot be undone.`
        : "Are you sure you want to delete this post? This action cannot be undone.");

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
                        >
                            {/* Decorative Top Bar */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8 flex flex-col items-center text-center">
                                {/* Icon with animated glow */}
                                <div className="mb-6 relative">
                                    <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
                                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center relative z-10">
                                        <AlertTriangle size={32} className="text-red-500" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                                <p className="text-white/60 mb-8 leading-relaxed">
                                    {description}
                                </p>

                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={onClose}
                                        disabled={isDeleting}
                                        className="flex-1 py-3 px-4 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        disabled={isDeleting}
                                        className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? (
                                            <>Processing...</>
                                        ) : (
                                            <>
                                                <Trash2 size={18} />
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
