"use client";

import { useState, useEffect } from "react";
import { Coins, Check, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { purchaseItem } from "@/lib/actions/shop.actions";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

type ShopItemProps = {
    item: any;
    userPoints: number;
    isOwned: boolean;
    userId?: string;
    username?: string;
};

export default function ShopItemCard({ item, userPoints, isOwned, userId, username }: ShopItemProps) {
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
            toast.error("Please login to purchase items");
            return;
        }

        setIsLoading(true);
        try {
            const result = await purchaseItem(userId, item._id, item.price, item.type, item.value);

            if (result.success) {
                setOptimisticOwned(true);
                toast.success("Item purchased!", {
                    description: `${item.name} added to inventory.`,
                    icon: <Sparkles className="text-amber-400" />
                });
                router.refresh();
            } else {
                toast.error("Purchase failed", { description: result.error });
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const canAfford = userPoints >= item.price;

    return (
        <div
            className={`glass-liquid p-6 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 group relative overflow-hidden
            ${optimisticOwned
                    ? "bg-gradient-to-br from-teal-500/5 to-emerald-500/5 border-teal-500/30"
                    : "border-white/5 hover:border-purple-500/30"
                }`}>

            {/* Glossy sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className={`aspect-square rounded-2xl bg-black/40 mb-6 relative overflow-hidden flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors`}>
                {/* Effect Preview */}
                <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${item.value || 'from-gray-500 to-gray-700'} opacity-80 blur-md group-hover:opacity-100 group-hover:blur-xl transition-all duration-500 scale-90 group-hover:scale-100`}></div>

                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className={`w-24 h-24 bg-[#121212] rounded-full border-4 flex items-center justify-center transition-all duration-300 relative overflow-hidden
                        ${optimisticOwned ? 'border-transparent' : 'border-[#1a1a1a]'}
                    `}>
                        {/* Border Effect Overlay (Actual CSS representation) */}
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.value} opacity-0 ${optimisticOwned ? 'opacity-100' : 'group-hover:opacity-100'} transition-opacity duration-300 p-1`}>
                            <div className="w-full h-full bg-[#121212] rounded-full flex items-center justify-center">
                                <span className="text-gray-600 text-[10px] items-center font-mono uppercase tracking-widest opacity-50">Avatar</span>
                            </div>
                        </div>
                        {!optimisticOwned && <span className="text-gray-700 text-xs font-bold z-10 opacity-50 group-hover:opacity-0 transition-opacity">PREVIEW</span>}
                    </div>
                </div>

                {optimisticOwned && (
                    <div className="absolute top-3 right-3 bg-teal-500/20 text-teal-400 p-1.5 rounded-full backdrop-blur-md border border-teal-500/20 shadow-lg animate-in fade-in zoom-in duration-300 z-20">
                        <Check size={14} strokeWidth={3} />
                    </div>
                )}
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-bold text-[var(--glass-text)] mb-1 group-hover:text-purple-400 transition-colors">{item.name}</h3>
                <p className="text-xs text-[var(--glass-text-muted)] line-clamp-2 min-h-[2.5em]">{item.description || "Unlock this exclusive profile effect."}</p>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-3 relative z-20">
                <div className={`flex items-center gap-1.5 font-bold shrink-0 transition-colors duration-300 ${optimisticOwned ? 'text-teal-400' : 'text-amber-400'}`}>
                    {optimisticOwned ? <ShieldCheck size={18} /> : <Coins size={18} className="drop-shadow-md" />}
                    <span className="text-lg">{optimisticOwned ? "Owned" : item.price}</span>
                </div>

                {optimisticOwned ? (
                    <div className="relative group/btn">
                        <div className="px-5 py-2.5 rounded-xl bg-teal-500/10 text-teal-500 text-xs font-bold border border-teal-500/10 cursor-default flex items-center justify-center gap-2 group-hover/btn:opacity-0 transition-opacity absolute inset-0">
                            <Check size={14} />
                            <span>In Inventory</span>
                        </div>
                        <button
                            onClick={() => {
                                // Extract lang from pathname (e.g., /en/shop -> en)
                                const currentPath = pathname || "";
                                const segments = currentPath.split('/');
                                const lang = (segments.length > 1 && segments[1].length === 2) ? segments[1] : 'en';

                                const targetUrl = username
                                    ? `/${lang}/user/${username}?tab=inventory`
                                    : `/${lang}/dashboard?tab=inventory`;
                                console.log("ShopItemCard Click:", { username, targetUrl });
                                router.push(targetUrl);
                            }}
                            className="px-5 py-2.5 rounded-xl bg-teal-500 text-white text-xs font-bold border border-teal-500 cursor-pointer flex items-center justify-center gap-2 opacity-0 group-hover/btn:opacity-100 transition-opacity relative z-10 hover:bg-teal-600"
                        >
                            <span>Go to Inventory</span>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleBuy}
                        disabled={!canAfford || isLoading}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border flex items-center justify-center gap-2 transform active:scale-95 shadow-lg
                            ${canAfford
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-transparent shadow-purple-900/20 hover:shadow-purple-500/40"
                                : "bg-white/5 text-gray-500 border-white/5 cursor-not-allowed"
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Wait...
                            </>
                        ) : (
                            <>
                                Buy Now
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
