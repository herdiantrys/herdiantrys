"use client";

import { useState, useMemo } from "react";
import { LayoutGrid, Sparkles, Square, Image as ImageIcon, PackageOpen, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ShopItemCard from "@/components/ShopItemCard";

type ShopGridProps = {
    items: any[];
    userPoints: number;
    userInventory: any[];
    userId?: string | null;
    username?: string | null;
    dict: any;
};

export default function ShopGrid({ items, userPoints, userInventory, userId, username, dict }: ShopGridProps) {
    const CATEGORIES = [
        { id: 'all', label: dict.categories.all, icon: LayoutGrid },
        { id: 'premium', label: dict.categories.premium, icon: Sparkles },
        { id: 'cosmetics', label: dict.categories.cosmetics, icon: Palette },
        { id: 'frame', label: dict.categories.frames, icon: Square },
        { id: 'background', label: dict.categories.backgrounds, icon: ImageIcon },
    ];

    const [activeCategory, setActiveCategory] = useState('all');

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            if (activeCategory === 'all') return true;

            const itemType = (item.type || '').toLowerCase();
            const itemCategory = (item.category || '').toLowerCase();

            if (activeCategory === 'premium') {
                return ((itemType === 'saas_template') || (itemCategory === 'premium'));
            }

            if (activeCategory === 'cosmetics') {
                return ['frame', 'background', 'effect'].includes(itemType) ||
                    ['cosmetics', 'frame', 'background'].includes(itemCategory);
            }

            return itemType === activeCategory || itemCategory === activeCategory;
        });
    }, [items, activeCategory]);

    return (
        <div className="space-y-8">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
                <div className="flex flex-wrap gap-2 p-1.5 bg-[var(--site-sidebar-active)] backdrop-blur-md rounded-2xl border border-[var(--site-sidebar-border)] shadow-lg">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`
                                    relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                                    ${isActive ? "text-white shadow-md" : "text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] hover:bg-[var(--site-sidebar-bg)]/50"}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeShopTab"
                                        className="absolute inset-0 bg-site-secondary rounded-xl shadow-[0_0_15px_rgba(var(--site-secondary-rgb),0.3)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon size={16} />
                                    {cat.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Items Grid */}
            <div className="min-h-[400px]">
                {filteredItems.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item) => {
                                const isOwned = userInventory?.some((inv: any) => inv.shopItemId === item._id);
                                return (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ShopItemCard
                                            item={item}
                                            userPoints={userPoints}
                                            isOwned={!!isOwned}
                                            userId={userId}
                                            username={username}
                                            dict={dict}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-[var(--glass-text-muted)]"
                    >
                        <PackageOpen size={48} className="mb-4 opacity-50" />
                        <p className="text-lg">{dict.messages.no_items_found}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
