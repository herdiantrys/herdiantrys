"use client";

import { motion } from "framer-motion";

export interface TabItem {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string; // Tailwind gradient classes, e.g., "from-violet-500 to-indigo-500"
}

interface GlassTabsProps {
    tabs: TabItem[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export function GlassTabs({ tabs, activeTab, setActiveTab }: GlassTabsProps) {
    return (
        <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.07] rounded-2xl p-1.5 shadow-sm dark:shadow-none w-fit">
            <div className="flex flex-wrap gap-1">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-250 ${isActive
                                ? "text-white shadow-md relative z-10"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="glassTabsActiveBg"
                                    className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.color} opacity-90 -z-10`}
                                    transition={{ type: "spring", stiffness: 380, damping: 36 }}
                                />
                            )}
                            <span className="relative flex items-center gap-2">
                                <tab.icon size={15} />
                                {tab.label}
                            </span>
                            {isActive && (
                                <span className="relative ml-1 w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

import { Variants } from "framer-motion";

// Helper to provide consistent animation variants for tab content
export const tabContentVariants: any = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } }
};
