"use client";

import { useState } from "react";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { toggleEquipItem } from "@/lib/actions/inventory.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InventoryListProps {
    userId: string;
    inventory: any[];
    equippedFrame: string | null;
    equippedBackground: string | null;
}

export default function InventoryList({ userId, inventory, equippedFrame, equippedBackground }: InventoryListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const router = useRouter();

    const handleToggleEquip = async (item: any) => {
        setLoadingId(item.id);
        const isCurrentlyEquipped = item.type === "FRAME"
            ? equippedFrame === item.value
            : equippedBackground === item.value;

        try {
            const result = await toggleEquipItem(userId, item.value, item.type, isCurrentlyEquipped);
            if (result.success) {
                toast.success(isCurrentlyEquipped ? "Item unequipped" : "Item equipped!", {
                    icon: <Sparkles className="text-teal-400" />
                });
                router.refresh();
            } else {
                toast.error("Failed to update equipment");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoadingId(null);
        }
    };

    if (!inventory || inventory.length === 0) {
        return (
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
                    <Sparkles size={32} />
                </div>
                <p className="text-[var(--glass-text)] text-lg mb-2">Inventory is empty</p>
                <p className="text-[var(--glass-text-muted)]">Visit the shop to get some cool profile effects!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inventory.map((item) => {
                const isEquipped = item.type === "FRAME"
                    ? equippedFrame === item.value
                    : equippedBackground === item.value;
                const isLoading = loadingId === item.id;

                return (
                    <div key={item.id} className={`glass p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4
                        ${isEquipped
                            ? "border-teal-500/50 bg-teal-500/5 shadow-[0_0_15px_-5px_rgba(20,184,166,0.3)]"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 relative overflow-hidden group">
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.value} opacity-40 blur-sm`} />
                                <div className={`relative z-10 w-8 h-8 rounded-full border-2 border-white/20 bg-[#121212] flex items-center justify-center overflow-hidden`}>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.value} opacity-80`} />
                                    <div className="absolute inset-0.5 bg-[#121212] rounded-full" />
                                </div>
                            </div>

                            <div className="min-w-0">
                                <h3 className="text-sm font-bold truncate text-[var(--glass-text)]">{item.name}</h3>
                                <p className="text-[10px] text-[var(--glass-text-muted)] uppercase tracking-wider font-semibold">{item.type}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleToggleEquip(item)}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2
                                ${isEquipped
                                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                    : "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20"
                                } disabled:opacity-50`}
                        >
                            {isLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : isEquipped ? (
                                <>
                                    <X size={14} />
                                    <span>Remove</span>
                                </>
                            ) : (
                                <>
                                    <Check size={14} />
                                    <span>Equip</span>
                                </>
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
