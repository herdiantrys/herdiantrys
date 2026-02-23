"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Plus, Pencil, Trash2, CheckSquare, Square, Trophy, X, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { createRank, updateRank, deleteRank, uploadRankImage } from "@/lib/actions/rank.actions";
import { toast } from "sonner";
import DeleteConfirmationModal from "./DeleteConfirmationModal"; // Assuming this exists from Posts
import { Upload } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Rank {
    id: string;
    name: string;
    subtitle: string | null;
    minXP: number;
    description: string | null;
    image: string | null;
}

export default function AdminRanksClient({ ranks }: { ranks: Rank[] }) {
    const router = useRouter();

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof Rank, direction: 'asc' | 'desc' }>({ key: 'minXP', direction: 'asc' });

    // Edit/Create State
    const [isEditing, setIsEditing] = useState(false);
    const [currentRank, setCurrentRank] = useState<Rank | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        subtitle: "",
        minXP: "" as string | number,
        description: "",
        image: ""
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Delete State
    const [rankToDelete, setRankToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);


    // Sorting Logic
    const handleSort = (key: keyof Rank) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter & Sort
    const filteredAndSortedRanks = useMemo(() => {
        let result = [...ranks];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(rank =>
                rank.name.toLowerCase().includes(query) ||
                rank.description?.toLowerCase().includes(query)
            );
        }

        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue: any = a[sortConfig.key];
                let bValue: any = b[sortConfig.key];

                if (aValue === null) aValue = "";
                if (bValue === null) bValue = "";

                if (sortConfig.key === 'minXP') {
                    // Number comparison
                } else {
                    // String comparison
                    aValue = aValue.toString().toLowerCase();
                    bValue = bValue.toString().toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [ranks, searchQuery, sortConfig]);

    // Handlers
    const handleEdit = (rank: Rank) => {
        setCurrentRank(rank);
        setFormData({
            name: rank.name,
            subtitle: rank.subtitle || "",
            minXP: rank.minXP,
            description: rank.description || "",
            image: rank.image || ""
        });
        setPreviewUrl(rank.image || null);
        setSelectedFile(null);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentRank(null);
        setFormData({ name: "", subtitle: "", minXP: 0, description: "", image: "" });
        setPreviewUrl(null);
        setSelectedFile(null);
        setIsEditing(true);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let imageUrl = formData.image;

            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("image", selectedFile);
                const uploadRes = (await uploadRankImage(uploadFormData)) as any;
                if (uploadRes.success && uploadRes.imageUrl) {
                    imageUrl = uploadRes.imageUrl;
                } else {
                    throw new Error("Image upload failed");
                }
            }

            const finalData = {
                ...formData,
                image: imageUrl,
                minXP: Number(formData.minXP)
            };

            const response = currentRank
                ? (await updateRank(currentRank.id, finalData)) as any
                : (await createRank(finalData)) as any;

            if (response.success) {
                toast.success(currentRank ? "Rank updated successfully" : "Rank created successfully");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(response.error || "Failed to save rank");
            }
        } catch (error) {
            console.error("Error saving rank:", error);
            toast.error("Failed to save rank");
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!rankToDelete) return;
        setIsDeleting(true);
        try {
            await (deleteRank(rankToDelete) as any);
            toast.success("Rank deleted successfully");
            setRankToDelete(null);
            router.refresh();
        } catch (error) {
            console.error("Error deleting rank:", error);
            toast.error("Failed to delete rank");
        } finally {
            setIsDeleting(false);
        }
    };

    // Helper Components
    const SortIcon = ({ columnKey }: { columnKey: keyof Rank }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="opacity-30" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-teal-400" /> : <ArrowDown size={14} className="text-teal-400" />;
    };

    const SortHeader = ({ label, columnKey, className = "" }: { label: string, columnKey: keyof Rank, className?: string }) => (
        <th className={`px-6 py-4 cursor-pointer hover:text-white transition-colors group ${className}`} onClick={() => handleSort(columnKey)}>
            <div className="flex items-center gap-2">
                {label}
                <SortIcon columnKey={columnKey} />
            </div>
        </th>
    );

    return (
        <div>
            {/* Controls */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                        {/* Search */}
                        <div className="relative w-full lg:max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search ranks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:border-teal-500/50 transition-all"
                            />
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 transition-all"
                        >
                            <Plus size={18} />
                            Add Rank
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Icon</th>
                            <SortHeader label="Rank Name" columnKey="name" />
                            <th className="px-6 py-4">Subtitle</th>
                            <SortHeader label="Min XP" columnKey="minXP" />
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                        {filteredAndSortedRanks.length > 0 ? (
                            filteredAndSortedRanks.map((rank) => (
                                <tr key={rank.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-700/50 relative flex items-center justify-center">
                                            {rank.image ? (
                                                <Image src={rank.image} alt={rank.name} fill className="object-cover" />
                                            ) : (
                                                <Trophy size={20} className="text-gray-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                        {rank.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {rank.subtitle || "-"}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-teal-500 font-bold">
                                        {formatNumber(rank.minXP)} XP
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[300px] truncate">
                                        {rank.description || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleEdit(rank)}
                                            className="text-sm text-teal-400 hover:text-teal-300 mr-3 transition-colors"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => setRankToDelete(rank.id)}
                                            className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2">
                                            <Trophy size={24} className="opacity-50" />
                                        </div>
                                        <p className="font-medium">No ranks found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for Edit/Create */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                                {currentRank ? "Edit Rank" : "Create New Rank"}
                            </h2>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-400">Rank Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-white/10 bg-black/20 focus:border-teal-500/50 focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-400">Subtitle (Alias)</label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-white/10 bg-black/20 focus:border-teal-500/50 focus:outline-none transition-all"
                                    placeholder="e.g. The Beginner"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-400">Minimum XP</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.minXP}
                                    onChange={(e) => setFormData({ ...formData, minXP: e.target.value === "" ? "" : parseInt(e.target.value) })}
                                    className="w-full p-3 rounded-xl border border-white/10 bg-black/20 focus:border-teal-500/50 focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-400">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-white/10 bg-black/20 focus:border-teal-500/50 focus:outline-none transition-all"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-400">Rank Icon</label>
                                <div className="flex gap-4 items-start">
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center group">
                                        {previewUrl ? (
                                            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <Trophy className="text-gray-600" size={32} />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <label className="cursor-pointer p-4 w-full h-full flex items-center justify-center">
                                                <Upload className="text-white" size={24} />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileSelect}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <label className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer text-sm text-center transition-colors">
                                                Upload Image
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileSelect}
                                                />
                                            </label>
                                            {previewUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPreviewUrl(null);
                                                        setSelectedFile(null);
                                                        setFormData({ ...formData, image: "" });
                                                    }}
                                                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => {
                                                setFormData({ ...formData, image: e.target.value });
                                                setPreviewUrl(e.target.value || null);
                                            }}
                                            className="w-full p-2 text-xs rounded-lg border border-white/10 bg-black/20 focus:border-teal-500/50 focus:outline-none transition-all text-gray-400"
                                            placeholder="Or paste image URL..."
                                        />
                                        <p className="text-[10px] text-gray-500">
                                            Recommended: 200x200px PNG or WebP with transparency.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-2 text-sm rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold shadow-lg shadow-teal-500/20 transition-colors flex items-center gap-2"
                                >
                                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                                    {currentRank ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={!!rankToDelete}
                onClose={() => setRankToDelete(null)}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                count={1}
                description="Are you sure you want to delete this rank? Users currently at this rank may be affected."
            />
        </div>
    );
}
