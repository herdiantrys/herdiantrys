import { useState, useRef, useEffect, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { toggleEquipItem, updateProfileColor, updateFrameColor } from "@/lib/actions/inventory.actions";
import { uploadCustomBackground, removeCustomBackground } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useProfileColor } from "@/components/Profile/ProfileColorContext";
import ImageCropper from "@/components/ImageCropper";
import { InventoryCard } from "./InventoryCard";
import { motion, AnimatePresence } from "framer-motion";

interface InventoryListProps {
    userId: string;
    inventory: any[];
    equippedFrame: string | null;
    equippedBackground: string | null;
    profileColor: string | null;
    frameColor: string | null;
    isOwner?: boolean;
}

type FilterType = 'ALL' | 'FRAME' | 'BACKGROUND';

export default function InventoryList({
    userId,
    inventory,
    equippedFrame,
    equippedBackground,
    profileColor,
    frameColor,
    isOwner = false
}: InventoryListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('ALL');
    const router = useRouter();
    const { color, setColor } = useProfileColor();
    // We add local state for frameColor since ProfileColorContext only handles one.
    // Ideally we'd update the context, but for now let's handle it here.
    const [frameColorState, setFrameColorState] = useState(frameColor || "#ffffff");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const isMounted = useRef(false);
    const isFrameMounted = useRef(false);

    // Debounce logic for server update
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        if (!color) return;

        const timer = setTimeout(async () => {
            const result = (await updateProfileColor(userId, color)) as any;
            if (!result.success) {
                toast.error("Failed to save color");
            } else {
                router.refresh();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [color, userId]);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setColor(newColor);
    };

    const handleFrameColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setFrameColorState(newColor);
    };

    // Debounce frame color update
    useEffect(() => {
        if (!isFrameMounted.current) {
            isFrameMounted.current = true;
            return;
        }

        if (!frameColorState) return;

        const timer = setTimeout(async () => {
            const result = (await updateFrameColor(userId, frameColorState)) as any;
            if (!result.success) {
                toast.error("Failed to save frame color");
            } else {
                router.refresh();
            }
        }, 1000); // Slightly longer debounce to allow multiple changes to settle

        return () => clearTimeout(timer);
    }, [frameColorState, userId]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setSelectedImage(reader.result as string);
            });
            reader.readAsDataURL(file);
            e.target.value = "";
        }
    };

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        if (!selectedImage) return;

        setIsUploading(true);
        setSelectedImage(null);

        try {
            const formData = new FormData();
            formData.append("image", croppedImageBlob, "custom-bg.jpg");

            const result = (await uploadCustomBackground(userId, formData)) as any;
            if (result.success) {
                toast.success("Background updated!");
                router.refresh();
            } else {
                toast.error("Failed to upload background");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveCustomBackground = async () => {
        if (!confirm("Are you sure you want to remove your custom background?")) return;

        setIsUploading(true);
        try {
            const result = (await removeCustomBackground(userId)) as any;
            if (result.success) {
                toast.success("Background removed");
                router.refresh();
            } else {
                toast.error("Failed to remove background");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsUploading(false);
        }
    };

    const handleToggleEquip = async (item: any) => {
        if (!isOwner) return;
        setLoadingId(item.id);
        const isCurrentlyEquipped = item.type === "FRAME"
            ? equippedFrame === item.value
            : (item.value === "custom-image"
                ? (equippedBackground === "custom-image" || equippedBackground?.startsWith("http") || equippedBackground?.startsWith("/"))
                : equippedBackground === item.value) || false;

        try {
            const result = (await toggleEquipItem(userId, item.value, item.type, isCurrentlyEquipped)) as any;
            if (result.success) {
                toast.success(isCurrentlyEquipped ? "Item unequipped" : "Item equipped!", {
                    icon: <Sparkles className="text-[var(--site-secondary)]" />
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

    const filteredInventory = useMemo(() => {
        if (filter === 'ALL') return inventory;
        return inventory.filter(item => item.type === filter);
    }, [inventory, filter]);

    if (!inventory || inventory.length === 0) {
        return (
            <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-500">
                    <Sparkles size={32} />
                </div>
                <p className="text-[var(--glass-text)] text-lg mb-2">Inventory is empty</p>
                <p className="text-[var(--glass-text-muted)]">Visit the shop to get some cool profile effects!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex p-1 bg-black/5 dark:bg-black/20 rounded-xl w-fit">
                {(['ALL', 'FRAME', 'BACKGROUND'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`
                            px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300
                            ${filter === type
                                ? "bg-[var(--site-secondary)] text-white shadow-md"
                                : "text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] hover:bg-black/5 hover:dark:bg-white/5"
                            }
                        `}
                    >
                        {type === 'ALL' ? 'All Items' : type === 'FRAME' ? 'Frames' : 'Backgrounds'}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                <AnimatePresence mode='popLayout'>
                    {filteredInventory.map((item) => {
                        const isEquipped = item.type === "FRAME"
                            ? equippedFrame === item.value
                            : (item.value === "custom-image"
                                ? (equippedBackground === "custom-image" || equippedBackground?.startsWith("http") || equippedBackground?.startsWith("/"))
                                : equippedBackground === item.value);

                        const isCustomColorItem = item.value === "custom-color";
                        const isCustomImageItem = item.value === "custom-image";
                        const isLoading = loadingId === item.id || (isEquipped && isCustomImageItem && isUploading);
                        const hasCustomImageSet = isEquipped && isCustomImageItem && (equippedBackground?.startsWith("http") || equippedBackground?.startsWith("/"));

                        return (
                            <InventoryCard
                                key={item.id}
                                item={item}
                                isEquipped={!!isEquipped}
                                isOwner={!!isOwner}
                                isLoading={!!isLoading}
                                hasCustomImageSet={!!hasCustomImageSet}
                                onToggleEquip={handleToggleEquip}
                                color={(item.type === 'FRAME' ? frameColorState : color) || undefined}
                                onColorChange={item.type === 'FRAME' ? handleFrameColorChange : handleColorChange}
                                isUploading={isUploading}
                                onUploadClick={() => fileInputRef.current?.click()}
                                onResetClick={handleRemoveCustomBackground}
                            />
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* File Input for Custom Image */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            {/* Portal for Image Cropper */}
            {selectedImage && (
                <ImageCropper
                    imageSrc={selectedImage}
                    onCancel={() => setSelectedImage(null)}
                    onCropComplete={handleCropComplete}
                    aspect={16 / 9}
                />
            )}
        </div>
    );
}
