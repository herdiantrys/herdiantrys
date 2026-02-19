"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Trophy, Star, Crown } from "lucide-react";

interface XPToastProps {
    amount: number;
    reason?: string;
    type?: "default" | "levelup" | "milestone";
    icon?: React.ReactNode;
}

export const XPToast = ({ amount, reason, type = "default", icon }: XPToastProps) => {
    return (
        <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.95 }}
            className="group relative flex items-center gap-4 bg-[var(--site-primary)]/40 backdrop-blur-3xl border border-[var(--site-accent)]/20 rounded-2xl p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.3)] min-w-[320px] max-w-sm overflow-hidden"
        >
            {/* Liquid Background Accents */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--site-accent)]/10 via-transparent to-[var(--site-secondary)]/5 opacity-50 -z-10" />

            {/* Standard Glass Icon Container */}
            <div className="relative shrink-0 flex items-center justify-center w-11 h-11">
                <div className="absolute inset-0 bg-[var(--site-accent)] blur-xl opacity-20" />
                <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-[var(--site-accent)]/90 to-[var(--site-secondary)]/90 shadow-md flex items-center justify-center text-[var(--site-button-text)] border border-white/20">
                    {icon || (
                        type === "levelup" ? <Crown size={22} className="drop-shadow-sm" /> :
                            type === "milestone" ? <Trophy size={20} className="drop-shadow-sm" /> :
                                <Sparkles size={20} className="drop-shadow-sm" />
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-[var(--glass-text)] font-pixel leading-tight">
                        +{amount} XP
                    </span>
                    {type === "levelup" && (
                        <span className="text-[10px] font-black text-[var(--site-accent)] animate-pulse uppercase tracking-tighter">
                            Tier Up!
                        </span>
                    )}
                </div>
                {reason && (
                    <span className="text-[11px] font-bold text-[var(--glass-text-muted)] uppercase tracking-widest truncate leading-tight mt-0.5">
                        {reason}
                    </span>
                )}
            </div>

            {/* Subtle Interactive Shimmer */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--site-accent)]/30 to-transparent" />
        </motion.div>
    );
};
