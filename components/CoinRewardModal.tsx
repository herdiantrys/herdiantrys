"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coins, X, Sparkles } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { useEffect, useState } from "react";

interface CoinRewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
}

export const CoinRewardModal = ({ isOpen, onClose, amount }: CoinRewardModalProps) => {
    // Auto-close after 5 seconds
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
                <div className="pointer-events-auto">
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0, y: 100 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0, y: -50 }}
                                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                                className="relative bg-gradient-to-br from-yellow-400/90 to-amber-600/90 backdrop-blur-md p-[1px] rounded-3xl shadow-2xl overflow-hidden"
                            >
                                <div className="bg-[#0f0f0f]/90 rounded-[23px] p-8 text-center relative overflow-hidden min-w-[300px]">
                                    {/* Animated Background Rays */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent animate-pulse" />

                                    {/* Close Button */}
                                    <button
                                        onClick={onClose}
                                        className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
                                    >
                                        <X size={16} />
                                    </button>

                                    {/* Main Icon */}
                                    <motion.div
                                        initial={{ rotate: -10, scale: 0.8 }}
                                        animate={{ rotate: 10, scale: 1.1 }}
                                        transition={{
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            duration: 1.5
                                        }}
                                        className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg mb-4 text-amber-900 ring-4 ring-yellow-500/30"
                                    >
                                        <Coins size={48} fill="currentColor" />
                                    </motion.div>

                                    {/* Confetti / Sparkles */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                                        {[...Array(6)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 1, x: 0, y: 0 }}
                                                animate={{
                                                    opacity: 0,
                                                    x: (Math.random() - 0.5) * 200,
                                                    y: (Math.random() - 0.5) * 200,
                                                    rotate: Math.random() * 360
                                                }}
                                                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                                                className="absolute top-1/2 left-1/2 text-yellow-300"
                                            >
                                                <Sparkles size={16 + Math.random() * 10} />
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Text Content */}
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400 mb-2"
                                    >
                                        Reward Unlocked!
                                    </motion.h2>

                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-gray-400 text-sm"
                                    >
                                        You've earned <span className="text-yellow-400 font-bold text-lg">+{amount} Runes</span><br /> for staying active!
                                    </motion.p>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onClose}
                                        className="mt-6 w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl font-bold text-black shadow-lg shadow-amber-500/20"
                                    >
                                        Collect & Continue
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Portal>
    );
};
