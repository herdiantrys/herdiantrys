"use client";

import { useState, useEffect } from "react";
import { Coins, Check, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { purchaseItem } from "@/lib/actions/shop.actions";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

type ShopItemProps = {
    item: any;
    userPoints: number;
    isOwned: boolean;
    userId?: string | null;
    username?: string | null;
    dict: any;
};

export default function ShopItemCard({ item, userPoints, isOwned, userId, username, dict }: ShopItemProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [optimisticOwned, setOptimisticOwned] = useState(isOwned);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setOptimisticOwned(isOwned);
    }, [isOwned]);

    const handleBuy = async () => {
        if (isLoading || optimisticOwned) return;
        if (!userId) {
            toast.error(dict.messages.login_required);
            return;
        }

        setIsLoading(true);
        try {
            if (item.type === 'SAAS_TEMPLATE') {
                const { createCheckoutSession } = await import("@/lib/actions/stripe.actions");
                const result = await createCheckoutSession(item._id, userId, pathname || '/shop');

                if (result.url) {
                    window.location.href = result.url;
                    return;
                } else {
                    throw new Error(result.error || dict.messages.checkout_session_failed);
                }
            }

            const result = (await purchaseItem(userId, item._id, item.price, item.type, item.value)) as any;

            if (result.success) {
                setOptimisticOwned(true);
                toast.success(dict.messages.purchase_success, {
                    description: `${item.name} ${dict.messages.added_to_inventory}`,
                    icon: <Sparkles className="text-amber-400" />
                });
                router.refresh();
            } else {
                toast.error(dict.messages.purchase_failed, { description: result.error });
            }
        } catch (error: any) {
            toast.error(dict.messages.error_occurred, { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const canAfford = item.type === 'SAAS_TEMPLATE' || userPoints >= item.price;
    const itemTypeLabel = item.type?.toUpperCase() || 'ITEM';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={`group relative flex flex-col h-full rounded-2xl border transition-all duration-500 overflow-hidden
                ${optimisticOwned
                    ? "bg-white/10 border-site-secondary/30 shadow-[0_0_20px_var(--site-secondary)]/10"
                    : "bg-white/[0.03] border-white/10 hover:border-purple-500/40 hover:bg-white/5 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                }`}
        >
            {/* Glossy Reflection Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 -mr-10 -mt-10 transition-all duration-500 group-hover:opacity-40
                ${optimisticOwned ? 'bg-site-secondary' : 'bg-purple-500'}`}
            />

            {/* Header: Item Type & Status */}
            <div className="relative z-10 p-4 flex justify-between items-start">
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-md
                    ${optimisticOwned
                        ? 'bg-site-secondary/10 border-site-secondary/20 text-site-secondary'
                        : 'bg-white/5 border-white/10 text-[var(--glass-text-muted)] group-hover:text-purple-400 group-hover:border-purple-500/30'
                    }`}>
                    {itemTypeLabel}
                </div>

                {optimisticOwned && (
                    <div className="flex items-center gap-1.5 text-site-secondary text-xs font-bold bg-site-secondary/10 px-2 py-1 rounded-lg border border-site-secondary/20">
                        <ShieldCheck size={12} />
                        {dict.actions.collected}
                    </div>
                )}
            </div>

            {/* Preview Section */}
            <div className="relative px-6 pb-6 flex items-center justify-center">
                <div className="w-full aspect-square relative flex items-center justify-center">
                    {/* Inner Circle Base */}
                    <div className="absolute w-32 h-32 rounded-full border border-white/5 bg-black/40 backdrop-blur-md shadow-inner" />

                    {/* Pulse Effect */}
                    <AnimatePresence>
                        {!optimisticOwned && (
                            <motion.div
                                className="absolute w-32 h-32 rounded-full bg-purple-500/10 border border-purple-500/20"
                                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Gradient Ring (Active/Hover) */}
                    <div className={`absolute w-[100px] h-[100px] rounded-full p-[3px] transition-all duration-500
                        ${optimisticOwned ? 'bg-gradient-to-tr ' + item.value : 'bg-white/5 group-hover:bg-gradient-to-tr group-hover:rotate-45 ' + item.value}
                    `}>
                        <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center overflow-hidden relative">
                            {/* Avatar Silhouette */}
                            <div className="relative z-10 flex flex-col items-center opacity-30 group-hover:opacity-50 transition-opacity">
                                <span className="text-[10px] font-black tracking-widest text-white/50">BIO-DATA</span>
                            </div>

                            {/* Item Icon override */}
                            {item.icon && (
                                <img
                                    src={item.icon}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                            )}
                        </div>
                    </div>

                    {/* Floating Sparkles for Premium */}
                    {item.type === 'SAAS_TEMPLATE' && (
                        <div className="absolute inset-0 pointer-events-none">
                            <Sparkles size={16} className="absolute top-0 right-4 text-amber-400 animate-pulse" />
                            <Sparkles size={12} className="absolute bottom-4 left-0 text-amber-400 animate-pulse delay-75" />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="relative z-10 px-6 pb-6 flex flex-col flex-1">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-1.5 line-clamp-1 group-hover:text-purple-400 transition-colors">
                        {item.name}
                    </h3>
                    <p className="text-[13px] text-[var(--glass-text-muted)] leading-relaxed line-clamp-2 h-[40px]">
                        {item.description || "Enhance your digital identity with this exclusive artifact."}
                    </p>
                </div>

                {/* Footer: Price & Controls */}
                <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {item.type === 'SAAS_TEMPLATE' ? (
                                <div className="flex items-center gap-1.5 text-site-accent font-black">
                                    <span className="text-sm">IDR</span>
                                    <span className="text-lg">{new Intl.NumberFormat('id-ID').format(item.price)}</span>
                                </div>
                            ) : (
                                <div className={`flex items-center gap-1.5 font-black ${optimisticOwned ? 'text-site-secondary' : 'text-amber-400'}`}>
                                    <Coins size={18} className={!optimisticOwned ? "animate-bounce-slow" : ""} />
                                    <span className="text-lg">{optimisticOwned ? dict.actions.owned : item.price}</span>
                                </div>
                            )}
                        </div>

                        {!optimisticOwned && (
                            <div className="text-[10px] font-bold text-white/20 tracking-tighter uppercase italic">
                                {dict.actions.reward}: 50 XP
                            </div>
                        )}
                    </div>

                    {optimisticOwned ? (
                        <button
                            onClick={() => {
                                const currentPath = pathname || "";
                                const segments = currentPath.split('/');
                                const lang = (segments.length > 1 && segments[1].length === 2) ? segments[1] : 'en';
                                const targetUrl = username
                                    ? `/${lang}/profile/${username}?tab=inventory`
                                    : `/${lang}/dashboard?tab=inventory`;
                                router.push(targetUrl);
                            }}
                            className="group/btn relative w-full h-11 rounded-xl overflow-hidden focus:outline-none"
                        >
                            <div className="absolute inset-0 bg-site-secondary/10 border border-site-secondary/20 flex items-center justify-center gap-2 group-hover/btn:opacity-0 transition-opacity duration-300">
                                <Check size={16} />
                                <span className="text-sm font-bold">{dict.actions.in_inventory}</span>
                            </div>
                            <div className="absolute inset-0 bg-site-secondary flex items-center justify-center gap-2 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                                <span className="text-sm font-black text-black">{dict.actions.use_now}</span>
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={handleBuy}
                            disabled={(!canAfford && item.type !== 'SAAS_TEMPLATE') || isLoading}
                            className={`relative w-full h-11 rounded-xl font-black text-sm tracking-widest overflow-hidden transition-all duration-300 active:scale-[0.98]
                                ${(canAfford || item.type === 'SAAS_TEMPLATE')
                                    ? "bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                    : "bg-white/5 text-white/20 cursor-not-allowed"
                                }`}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin mx-auto" size={20} />
                            ) : (
                                dict.actions.acquire
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Border Sheen Hover Effect */}
            <div className="absolute inset-0 border border-white/0 group-hover:border-purple-500/20 rounded-2xl transition-colors duration-500 pointer-events-none" />
        </motion.div>
    );
}
