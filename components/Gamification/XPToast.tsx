"use client";

import { Sparkles, Zap, Trophy, Star, Crown } from "lucide-react";

interface XPToastProps {
    amount: number;
    reason?: string;
    type?: "default" | "levelup" | "milestone";
    icon?: React.ReactNode;
}

export const XPToast = ({ amount, reason, type = "default", icon }: XPToastProps) => {
    return (
        <div className="flex items-center gap-4 bg-white/90 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-2xl p-4 shadow-2xl w-[320px] max-w-sm">
            <div className={`flex items-center justify-center shrink-0 w-10 h-10 rounded-full ${type === 'levelup' ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                {icon || (
                    type === "levelup" ? <Crown size={20} /> :
                        type === "milestone" ? <Trophy size={20} /> :
                            <Sparkles size={20} />
                )}
            </div>
            <div className="flex flex-col justify-center">
                <span className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    +{amount} XP {type === "levelup" && <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-1">(Tier Up!)</span>}
                </span>
                {reason && (
                    <span className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-0.5">
                        {reason}
                    </span>
                )}
            </div>
        </div>
    );
};
