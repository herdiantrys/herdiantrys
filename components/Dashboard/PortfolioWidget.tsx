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
    const isEnabled = user.portfolioConfig?.isEnabled;
    const isOwner = true; // Widget is mainly used/visible for owners in this context, but let's be safe

    if (!hasPortfolio) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-br from-[var(--site-secondary)]/20 to-[var(--site-secondary)]/20 backdrop-blur-3xl border border-[var(--site-secondary)]/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group"
        >
            {/* Liquid Shine Overlay */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--site-secondary)]/20 rounded-full blur-2xl group-hover:bg-[var(--site-secondary)]/30 transition-colors pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[var(--site-primary)]/20 rounded-lg text-[var(--site-secondary)]">
                            <Layout size={18} />
                        </div>
                        <h3 className="font-bold text-white text-base">{t.my_portfolio || "My Portfolio"}</h3>
                    </div>
                    {isEnabled ? (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                            {t.active || "ACTIVE"}
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                            INACTIVE
                        </span>
                    )}
                </div>

                <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                    {isEnabled
                        ? (t.portfolio_active_desc || "Your professional landing page is live. Share it with the world!")
                        : (t.portfolio_inactive_desc || "Your portfolio is currently hidden from the public. Enable it in the editor.")}
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href={`/profile/${user.username}/portfolio`}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-bold transition-all border ${isEnabled
                            ? "bg-white/10 hover:bg-white/20 border-white/5"
                            : "bg-white/5 hover:bg-white/10 border-white/10 opacity-50"
                            }`}
                    >
                        <ExternalLink size={14} />
                        {t.view || "View"}
                    </Link>
                    <Link
                        href="/dashboard/portfolio"
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[var(--site-button)] hover:opacity-90 text-[var(--site-button-text)] text-xs font-bold transition-all shadow-lg shadow-[var(--site-accent)]/20"
                    >
                        <Settings size={14} />
                        {t.edit || "Edit"}
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
