
import { motion } from "framer-motion";
import { Sparkles, Check, X, Loader2, Palette, Upload, Trash2, Image as ImageIcon } from "lucide-react";

interface InventoryCardProps {
    item: any;
    isEquipped: boolean;
    isOwner: boolean;
    isLoading: boolean;
    hasCustomImageSet?: boolean;
    onToggleEquip: (item: any) => void;
    // Custom Color Props
    color?: string;
    onColorChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    // Custom Image Props
    isUploading?: boolean;
    onUploadClick?: () => void;
    onResetClick?: () => void;
}

export const InventoryCard = ({
    item,
    isEquipped,
    isOwner,
    isLoading,
    hasCustomImageSet,
    onToggleEquip,
    color,
    onColorChange,
    isUploading,
    onUploadClick,
    onResetClick
}: InventoryCardProps) => {
    const isCustomColorItem = item.value === "custom-color";
    const isCustomImageItem = item.value === "custom-image";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className={`
                group relative p-4 font-mono select-none flex flex-col h-full
                ${isEquipped ? "opacity-100" : "opacity-80 hover:opacity-100"}
            `}
            style={{
                backgroundColor: isEquipped ? '#1e293b' : '#0f172a',
                // 8-bit border effect
                boxShadow: `
                    -2px 0 0 0 black,
                    2px 0 0 0 black,
                    0 -2px 0 0 black,
                    0 2px 0 0 black,
                    -2px -2px 0 0 black,
                    -2px 2px 0 0 black,
                    2px -2px 0 0 black,
                    2px 2px 0 0 black,
                    inset 2px 2px 0 0 rgba(255,255,255,0.05),
                    inset -2px -2px 0 0 rgba(0,0,0,0.5)
                `
            }}
        >
            {/* Checkered Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
                    backgroundSize: '4px 4px',
                    backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                }}
            />

            {/* Pixel Corners (Visual Flourish) */}
            <div className="absolute top-1 left-1 w-1 h-1 bg-white/20" />
            <div className="absolute top-1 right-1 w-1 h-1 bg-white/20" />
            <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/20" />
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/20" />

            <div className="relative z-10 flex flex-col h-full gap-4">
                {/* 1. Top: Image/Icon Area */}
                <div className="w-full aspect-square bg-black/40 relative flex items-center justify-center overflow-hidden border-2 border-dashed border-white/10 group-hover:border-white/20 transition-colors">
                    {item.type === "FRAME" ? (
                        <div className="relative w-1/2 h-1/2">
                            {/* Frame Preview Container */}
                            <div className="absolute inset-0 bg-[#222] rounded-full overflow-hidden border border-white/10" />
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-purple-500 opacity-20" />
                            {item.icon && <img src={item.icon} alt="" className="absolute inset-0 w-full h-full object-cover rendering-pixelated" style={{ imageRendering: 'pixelated' }} />}
                        </div>
                    ) : isCustomColorItem ? (
                        <div className="w-full h-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500" />
                    ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.value} opacity-80`} />
                    )}

                    {/* Equipped Badge Overlay */}
                    {isEquipped && (
                        <div className="absolute top-2 right-2 bg-teal-500 text-black text-[10px] font-bold px-1.5 py-0.5 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">
                            EQUIPPED
                        </div>
                    )}
                </div>

                {/* 2. Middle: Info */}
                <div className="flex-1 flex flex-col gap-1 text-center">
                    <h3 className={`text-sm font-bold uppercase tracking-wide break-words ${isEquipped ? "text-teal-400 drop-shadow-[1px_1px_0_rgba(0,0,0,1)]" : "text-slate-400"}`}>
                        {item.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                        {item.description || item.type}
                    </p>
                </div>

                {/* 3. Configuration Area (Collapsible) */}
                {(isEquipped && isOwner) && (
                    <div className="w-full bg-black/20 p-2 border border-white/5">
                        {isCustomColorItem && (
                            <div className="relative flex items-center gap-2">
                                <div
                                    className="w-4 h-4 border border-white/20 shadow-sm shrink-0"
                                    style={{ backgroundColor: color || '#000000' }}
                                />
                                <span className="text-[10px] text-slate-400 truncate flex-1">{color || 'No Color'}</span>
                                <input
                                    type="color"
                                    value={color || "#000000"}
                                    onChange={onColorChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Palette size={12} className="text-slate-500 shrink-0" />
                            </div>
                        )}

                        {isCustomImageItem && (
                            <div className="flex gap-2">
                                <button
                                    onClick={onUploadClick}
                                    disabled={isUploading}
                                    className="flex-1 py-1 bg-teal-900/50 text-teal-400 text-[10px] font-bold border border-teal-500/30 hover:bg-teal-900/80 transition-colors flex items-center justify-center gap-1"
                                >
                                    <Upload size={10} />
                                    {hasCustomImageSet ? "CHG" : "UPLD"}
                                </button>
                                {hasCustomImageSet && (
                                    <button
                                        onClick={onResetClick}
                                        disabled={isUploading}
                                        className="px-2 py-1 bg-red-900/50 text-red-400 text-[10px] font-bold border border-red-500/30 hover:bg-red-900/80 transition-colors"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}


                {/* 4. Bottom: Action Button - Pixel Style */}
                {isOwner && (
                    <button
                        onClick={() => onToggleEquip(item)}
                        disabled={isLoading}
                        className={`
                            w-full py-2 text-[10px] font-bold uppercase tracking-widest transition-all active:translate-y-0.5 active:shadow-none
                            ${isEquipped
                                ? "bg-red-900 text-red-200 border-b-2 border-red-950 hover:bg-red-800"
                                : "bg-teal-600 text-teal-50 border-b-2 border-teal-800 hover:bg-teal-500"
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        style={{
                            boxShadow: isEquipped
                                ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 0 #450a0a'
                                : 'inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 0 #115e59'
                        }}
                    >
                        {isLoading ? (
                            <Loader2 size={12} className="animate-spin inline-block mr-1" />
                        ) : isEquipped ? (
                            "UNEQUIP"
                        ) : (
                            "EQUIP"
                        )}
                    </button>
                )}
            </div>
        </motion.div>
    );
};
