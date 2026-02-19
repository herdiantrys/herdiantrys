"use client";

import { motion } from "framer-motion";
import { Coins, Sparkles } from "lucide-react";

interface RuneToastProps {
    amount: number;
    reason?: string;
    icon?: React.ReactNode;
}

export const RuneToast = ({ amount, reason, icon }: RuneToastProps) => {
    return (
        <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.95 }}
            className="group relative flex items-center gap-4 bg-amber-500/20 backdrop-blur-3xl border border-amber-500/30 rounded-2xl p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.3)] min-w-[320px] max-w-sm overflow-hidden"
        >
            {/* Liquid Background Accents */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-yellow-500/5 opacity-50 -z-10" />

            {/* Standard Glass Icon Container */}
            <div className="relative shrink-0 flex items-center justify-center w-11 h-11">
                <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20" />
                <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md flex items-center justify-center text-black border border-white/20">
                    {icon || <Coins size={22} className="drop-shadow-sm" />}
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-amber-100 font-pixel leading-tight">
                        +{amount} Runes
                    </span>
                    <Sparkles size={14} className="text-amber-400 animate-pulse" />
                </div>
                {reason && (
                    <span className="text-[11px] font-bold text-amber-200/60 uppercase tracking-widest truncate leading-tight mt-0.5">
                        {reason}
                    </span>
                )}
            </div>

            {/* Subtle Interactive Shimmer */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </motion.div>
    );
};
