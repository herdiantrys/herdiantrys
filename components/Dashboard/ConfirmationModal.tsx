"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Archive, ArrowRight } from "lucide-react";
import { Portal } from "@/components/ui/Portal";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false
}: ConfirmationModalProps) => {

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                    className="relative w-full max-w-md bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden"
                >
                    {/* Liquid Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />

                    {/* Decorative Blob */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        {/* Header icon */}
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/10 mx-auto">
                            {isDestructive ? (
                                <Archive className="text-red-400" size={24} />
                            ) : (
                                <AlertCircle className="text-teal-400" size={24} />
                            )}
                        </div>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors text-sm"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => { onConfirm(); onClose(); }}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all text-sm shadow-lg flex items-center justify-center gap-2 group
                                    ${isDestructive
                                        ? "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-red-500/25"
                                        : "bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-teal-500/25"
                                    }`}
                            >
                                <span>{confirmText}</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </motion.div>
            </div>
        </Portal>
    );
};
