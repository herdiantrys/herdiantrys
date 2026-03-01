"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Tag, ArrowRight, DownloadCloud, PlayCircle, FileText, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function DigitalProductsClient({ products }: { products: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("ALL");

    const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = filterCategory === "ALL" || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "EBOOK": return <FileText size={16} />;
            case "COURSE": return <PlayCircle size={16} />;
            case "ASSET": return <DownloadCloud size={16} />;
            default: return <Package size={16} />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[var(--site-accent)]/20 via-slate-900/5 to-[var(--site-secondary)]/10 dark:from-[var(--site-accent)]/20 dark:via-black/40 dark:to-[var(--site-secondary)]/10 border border-slate-200/50 dark:border-white/10 p-10 sm:p-16">
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--site-secondary)]/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[var(--site-accent)]/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--site-accent)] to-[var(--site-secondary)]">Digital Goods</span> for Creators
                    </h1>
                    <p className="mt-6 text-lg text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
                        Level up your skills and workflow with our expertly crafted e-books, video courses, and high-quality digital assets.
                    </p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/60 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-4 rounded-3xl shadow-lg dark:shadow-none">
                <div className="relative w-full md:max-w-md group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-slate-400 dark:text-gray-500 group-focus-within:text-[var(--site-accent)] transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for courses, e-books, assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-100/50 dark:bg-black/20 border border-transparent focus:border-slate-200 dark:focus:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-black/40 transition-all font-medium placeholder:text-slate-400"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    <button
                        onClick={() => setFilterCategory("ALL")}
                        className={`px-5 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all ${filterCategory === "ALL"
                            ? "bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20"
                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10"}`}
                    >
                        All Items
                    </button>
                    {categories.map((cat: any) => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-5 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all flex items-center gap-2 ${filterCategory === cat
                                ? "bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20"
                                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10"}`}
                        >
                            {getCategoryIcon(cat)}
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                            <Link href={`/digitalproducts/${product.slug}`} className="group block h-full">
                                <div className="h-full flex flex-col bg-white/80 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-[var(--site-accent)]/10 dark:hover:shadow-[var(--site-accent)]/5 hover:-translate-y-2 transition-all duration-500">

                                    {/* Image Container */}
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                                        {product.coverImage ? (
                                            <Image
                                                src={product.coverImage}
                                                alt={product.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-zinc-600">
                                                <Package size={48} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Category Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className="flex items-center gap-1.5 bg-white/90 dark:bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white shadow-lg">
                                                {getCategoryIcon(product.category)}
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[var(--site-accent)] transition-colors leading-tight">
                                            {product.title}
                                        </h3>
                                        <p className="mt-3 text-sm text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
                                            {product.description || "No description provided."}
                                        </p>

                                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price</span>
                                                <span className="text-xl font-black text-[var(--site-secondary)]">
                                                    {product.currency === "IDR" ? "Rp " : "$"}
                                                    {product.price.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-[var(--site-accent)] group-hover:text-white text-slate-400 transition-colors">
                                                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-white/5 mb-6">
                        <Package size={40} className="text-slate-300 dark:text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No products found</h2>
                    <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto">
                        We couldn't find any products matching your search criteria. Try adjusting your filters.
                    </p>
                </div>
            )}
        </div>
    );
}
