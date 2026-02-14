"use client";

import Link from "next/link";
import { Layout, ExternalLink, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface PortfolioWidgetProps {
    user: any;
    dict?: any;
}

export default function PortfolioWidget({ user, dict }: PortfolioWidgetProps) {
    const t = dict?.dashboard || {};

    // Check if user owns the Portfolio Template
    const hasPortfolio = user.inventory?.some((item: any) => item.shopItem?.type === 'SAAS_TEMPLATE');

    if (!hasPortfolio) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-3xl border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group"
        >
            {/* Liquid Shine Overlay */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-colors pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <Layout size={18} />
                        </div>
                        <h3 className="font-bold text-white text-base">My Portfolio</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        ACTIVE
                    </span>
                </div>

                <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                    Your professional landing page is live. Share it with the world!
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href={`/profile/${user.username}`}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/5"
                    >
                        <ExternalLink size={14} />
                        View
                    </Link>
                    <Link
                        href="/dashboard/portfolio"
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Settings size={14} />
                        Edit
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
