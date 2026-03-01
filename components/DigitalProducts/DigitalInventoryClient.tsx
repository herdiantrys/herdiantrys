"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, PlayCircle, FileText, Package, ExternalLink, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function DigitalInventoryClient({ initialInventory }: { initialInventory: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredInventory = initialInventory.filter(item => {
        const product = item.product;
        return product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "EBOOK": return <FileText size={16} />;
            case "COURSE": return <PlayCircle size={16} />;
            case "ASSET": return <Download size={16} />;
            default: return <Package size={16} />;
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        My Digital Inventory
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-gray-400 font-medium text-sm">
                        Access and download all your purchased premium digital goods.
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Search my items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-[#1A1A1A]/40 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-[var(--site-accent)] transition-colors text-sm font-medium placeholder:text-slate-400"
                    />
                    <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Inventory Grid */}
            {filteredInventory.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInventory.map((item, index) => {
                        const product = item.product;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="group flex flex-col bg-white/80 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-[var(--site-accent)]/10 transition-all duration-300 relative"
                            >
                                {/* Decorative Gradient Overlay on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--site-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border-b border-slate-200/50 dark:border-white/5">
                                    {product.coverImage ? (
                                        <Image
                                            src={product.coverImage}
                                            alt={product.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-zinc-600">
                                            <Package size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white">
                                            {getCategoryIcon(product.category)}
                                            {product.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-[var(--site-accent)] transition-colors">
                                        {product.title}
                                    </h3>

                                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 font-medium">
                                        <CalendarDays size={14} />
                                        <span>Acquired on {format(new Date(item.acquiredAt), "MMM d, yyyy")}</span>
                                    </div>

                                    <div className="mt-auto pt-5">
                                        {product.fileUrl ? (
                                            <a
                                                href={product.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-3 rounded-xl bg-[var(--site-secondary)]/10 text-[var(--site-secondary)] hover:bg-[var(--site-secondary)] hover:text-white font-bold text-sm flex justify-center items-center gap-2 transition-all duration-200"
                                            >
                                                <Download size={16} />
                                                Access / Download
                                            </a>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 font-bold text-sm flex justify-center items-center gap-2 cursor-not-allowed opacity-70"
                                            >
                                                <ExternalLink size={16} />
                                                Link Unavailable
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] bg-slate-50/50 dark:bg-white/5">
                    <div className="w-20 h-20 rounded-full bg-slate-200/50 dark:bg-white/10 flex items-center justify-center mb-6">
                        <Package size={32} className="text-slate-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Your inventory is empty</h3>
                    <p className="text-slate-500 dark:text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
                        You haven't purchased any digital items yet. Explore the catalog to level up your workflow.
                    </p>
                    <Link
                        href="/digitalproducts"
                        className="px-6 py-3 rounded-xl bg-[var(--site-button)] text-[var(--site-button-text)] font-bold text-sm shadow-lg shadow-[var(--site-accent)]/20 hover:-translate-y-0.5 transition-all"
                    >
                        Browse Digital Catalog
                    </Link>
                </div>
            )}
        </div>
    );
}
