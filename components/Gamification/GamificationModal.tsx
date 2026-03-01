"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, CheckCircle2, Trophy, Star, ChevronLeft } from "lucide-react";
import { RANKS, BADGES } from "@/lib/constants/gamification";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PixelBadge from "./PixelBadge";
import { formatNumber } from "@/lib/utils";

interface GamificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        xp: number;
        badges?: any[];
        image?: string;
        username?: string;
    };
    ranks?: any[];
}

export default function GamificationModal({ isOpen, onClose, user, ranks = [] }: GamificationModalProps) {
    // Use passed ranks or fallback to constant if empty (though db should have ranks)
    const effectiveRanks = ranks.length > 0 ? ranks : RANKS;

    const [selectedRank, setSelectedRank] = useState<any>(null);

    const currentXP = user.xp || 0;
    // Calculate based on effectiveRanks
    const reversedRank = [...effectiveRanks].sort((a, b) => a.minXP - b.minXP).reverse().find(r => currentXP >= r.minXP) || effectiveRanks[0];
    const currentRankIdx = effectiveRanks.findIndex(r => r.name === reversedRank.name);

    // Scroll to current rank on open
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (isOpen && scrollRef.current) {
            // Provide a small delay to allow render
            setTimeout(() => {
                const currentRankEl = document.getElementById(`rank-${currentRankIdx}`);
                if (currentRankEl) {
                    currentRankEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            }, 300);
        }
    }, [isOpen, currentRankIdx]);

    if (!isOpen) return null;

    // Use Portal to escape parent stacking contexts (sticky sidebar, etc.)
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#0f172a] border border-amber-500/30 dark:border-amber-500/20 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col"
                        >
                            {/* Decorative Background */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
                            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-500/10 blur-[100px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/10 blur-[100px] pointer-events-none" />

                            {/* Header */}
                            <div className="relative z-10 p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20 backdrop-blur-md shrink-0">
                                <div>
                                    <h2 className="text-2xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-800 dark:from-amber-200 dark:via-yellow-400 dark:to-amber-600">
                                        Journey of the {reversedRank.name.split(' (')[0]}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Total XP: <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">{formatNumber(currentXP)}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10 transition-all duration-500">
                                <AnimatePresence mode="wait">
                                    {selectedRank ? (
                                        <motion.div
                                            key="rank-detail"
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            className="p-8 h-full flex flex-col"
                                        >
                                            <button
                                                onClick={() => setSelectedRank(null)}
                                                className="self-start mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
                                            >
                                                <div className="p-2 rounded-full bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10">
                                                    <ChevronLeft size={20} />
                                                </div>
                                                <span className="text-sm font-bold uppercase tracking-wider">Back to Timeline</span>
                                            </button>

                                            <div className="flex-1 flex flex-col md:flex-row gap-8 items-center md:items-start">
                                                {/* Large Rank Image */}
                                                <div className="w-full md:w-1/2 aspect-square relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.1)] dark:shadow-[0_0_50px_rgba(245,158,11,0.2)] group">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-black via-transparent to-transparent z-10" />
                                                    <img
                                                        src={selectedRank.image}
                                                        alt={selectedRank.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />

                                                    {/* Rank Badge Overlay */}
                                                    <div className="absolute bottom-6 left-6 z-20">
                                                        <div className="text-amber-400 font-mono text-sm font-bold mb-1 tracking-wider uppercase">
                                                            {formatNumber(selectedRank.minXP)} XP Required
                                                        </div>
                                                        <h2 className="text-3xl font-bold font-serif text-white leading-none">
                                                            {selectedRank.name}
                                                        </h2>
                                                    </div>
                                                </div>

                                                {/* Info & Stats */}
                                                <div className="w-full md:w-1/2 space-y-6">

                                                    <div className="bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                                        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                                                            <Star size={18} className="text-amber-600 dark:text-amber-500" />
                                                            Rank Description
                                                        </h3>
                                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                                            "{selectedRank.description}"
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-slate-100 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-xl p-4">
                                                            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Status</div>
                                                            <div className={`font-bold ${currentXP >= selectedRank.minXP ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}>
                                                                {currentXP >= selectedRank.minXP ? "Unlocked" : "Locked"}
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-100 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-xl p-4">
                                                            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Progress</div>
                                                            <div className="font-mono text-slate-900 dark:text-white font-bold">
                                                                {currentXP >= selectedRank.minXP ? "100%" : `${Math.min(100, Math.round((currentXP / selectedRank.minXP) * 100))}%`}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Rewards Placeholder - Could be dynamic later */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Unlocks & Rewards</h4>
                                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-black/5 dark:border-white/5">
                                                            <Trophy size={16} className="text-amber-600 dark:text-amber-500" />
                                                            <span>New Profile Badge</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-black/5 dark:border-white/5">
                                                            <Star size={16} className="text-purple-600 dark:text-purple-500" />
                                                            <span>Special Avatar Border</span>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="rank-list"
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            className="p-8 space-y-12"
                                        >
                                            {/* Timeline Section */}
                                            <div className="relative">
                                                {/* Connecting Line (Vertical) */}
                                                <div className="absolute left-[28px] md:left-[50%] top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 md:translate-x-0" />

                                                {/* Progress Line (Colored) - Approximated height based on rank */}
                                                <div
                                                    className="absolute left-[28px] md:left-[50%] top-0 w-1 bg-gradient-to-b from-amber-500 via-orange-500 to-purple-500 -translate-x-1/2 md:translate-x-0 transition-all duration-1000"
                                                    style={{ height: `${(currentRankIdx / (effectiveRanks.length - 1)) * 100}%` }}
                                                />

                                                <div className="space-y-12 relative" ref={scrollRef}>
                                                    {effectiveRanks.map((rank, index) => {
                                                        const isUnlocked = index <= currentRankIdx;
                                                        const isCurrent = index === currentRankIdx;
                                                        const isNext = index === currentRankIdx + 1;

                                                        return (
                                                            <motion.div
                                                                key={rank.name}
                                                                id={`rank-${index}`}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                viewport={{ once: true, margin: "-100px" }}
                                                                className={`flex flex-col md:flex-row items-center gap-6 md:gap-0 relative cursor-pointer group/item ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                                                    }`}
                                                                onClick={() => setSelectedRank(rank)}
                                                            >
                                                                {/* Rank Node/Dot */}
                                                                <div className={`
                                                            absolute left-[28px] md:left-[50%] top-8 md:top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full border-4 z-20 flex items-center justify-center
                                                            shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover/item:scale-125
                                                            ${isUnlocked
                                                                        ? "bg-amber-500 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110"
                                                                        : "bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-700"}
                                                        `}>
                                                                    {isUnlocked ? (
                                                                        <CheckCircle2 size={isCurrent ? 24 : 18} className="text-white" />
                                                                    ) : (
                                                                        <Lock size={18} className="text-slate-400 dark:text-slate-600" />
                                                                    )}
                                                                </div>

                                                                {/* Content Card - Left or Right */}
                                                                <div className={`w-full md:w-[45%] pl-16 md:pl-0 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"}`}>
                                                                    <div className={`
                                                                group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300
                                                                ${isUnlocked
                                                                            ? "bg-white/80 dark:bg-slate-900/60 border-amber-500/40 dark:border-amber-500/30 group-hover/item:border-amber-500/80 group-hover/item:shadow-[0_0_30px_rgba(245,158,11,0.15)] dark:group-hover/item:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                                                                            : "bg-slate-50/50 dark:bg-black/40 border-slate-200 dark:border-slate-800 opacity-60 grayscale group-hover/item:opacity-80 group-hover/item:grayscale-0"}
                                                                ${isCurrent ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-white dark:ring-offset-black scale-[1.02]" : ""}
                                                            `}>
                                                                        <div className="flex flex-col gap-3">
                                                                            {/* Rank Image */}
                                                                            <div className={`
                                                                        w-full h-32 md:h-40 rounded-xl overflow-hidden relative
                                                                        ${!isUnlocked && "opacity-20"}
                                                                    `}>
                                                                                {isUnlocked || rank.image ? (
                                                                                    <img
                                                                                        src={rank.image || "/images/placeholder-rank.png"}
                                                                                        alt={rank.name}
                                                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                                                                        <span className="text-4xl text-slate-300 dark:text-slate-800 font-serif">?</span>
                                                                                    </div>
                                                                                )}

                                                                                {/* XP Label Badge */}
                                                                                <div className="absolute top-2 right-2 bg-white/80 dark:bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-black/5 dark:border-white/10">
                                                                                    <span className={`text-xs font-bold font-mono ${isUnlocked ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}`}>
                                                                                        {formatNumber(rank.minXP)} XP
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Text Info */}
                                                                            <div>
                                                                                <h3 className={`text-lg font-bold font-serif ${isUnlocked ? "text-amber-950 dark:text-amber-100" : "text-slate-400"}`}>
                                                                                    {isUnlocked ? rank.name : "Locked Rank"}
                                                                                </h3>
                                                                                {rank.subtitle && (
                                                                                    <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-500 font-bold mb-1">
                                                                                        {rank.subtitle}
                                                                                    </p>
                                                                                )}
                                                                                <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1 line-clamp-2">
                                                                                    "{rank.description}"
                                                                                </p>
                                                                                <div className="mt-2 text-[10px] font-bold text-amber-500/50 uppercase tracking-widest opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                                    Click to view details
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Placeholder for the other side to keep alignment */}
                                                                <div className="hidden md:block w-[45%]" />
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-black/5 dark:border-white/10">
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 font-mono">
                                                    <Trophy className="text-yellow-600 dark:text-yellow-500" />
                                                    Achievements & Badges
                                                </h3>

                                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                                    {BADGES.map((badgeDef: any, idx: number) => {
                                                        const userBadge = user.badges?.find((b: any) => b.id === badgeDef.id);
                                                        const isEarned = !!userBadge;

                                                        // Merge data: precedence to userBadge for awardedAt, but constants for rewards
                                                        const mergedBadge = {
                                                            ...badgeDef,
                                                            ...userBadge,
                                                            // Ensure rewards from constants are kept
                                                            xpReward: badgeDef.xpReward,
                                                            runeReward: badgeDef.runeReward
                                                        };

                                                        return (
                                                            <div key={badgeDef.id} className={isEarned ? "" : "opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"}>
                                                                <PixelBadge badge={mergedBadge} size="lg" />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
