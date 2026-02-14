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
        <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/50 bg-[#0f172a]/95 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.3)] w-full max-w-sm p-0">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />

            {/* Shining Border Animation */}
            <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-[shimmer_2s_infinite]" />

            <div className="relative z-10 flex items-center gap-4 p-4">
                {/* Icon Container */}
                <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-amber-500 blur-xl opacity-50 animate-pulse" />
                    <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 border border-amber-200 shadow-lg flex items-center justify-center text-white">
                        {icon || (
                            type === "levelup" ? <Crown size={24} className="drop-shadow-md" /> :
                                type === "milestone" ? <Trophy size={22} className="drop-shadow-md" /> :
                                    <Sparkles size={22} className="drop-shadow-md" />
                        )}
                    </div>
                    {/* Floating Particles */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-bounce shadow-[0_0_10px_rgba(253,224,71,0.8)]" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            +{amount} XP
                        </span>
                        {type === "levelup" && (
                            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest animate-pulse">
                                Level Up!
                            </span>
                        )}
                    </div>
                    {reason && (
                        <p className="text-xs font-medium text-amber-100/80 truncate font-serif tracking-wide">
                            {reason}
                        </p>
                    )}
                </div>
            </div>

            {/* Progress/Time bar (decorative) */}
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 w-full" />
        </div>
    );
};
