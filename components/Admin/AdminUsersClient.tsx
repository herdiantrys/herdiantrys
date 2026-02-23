
"use client";

import { useState } from "react";
import Image from "next/image";
import UserActions from "@/components/Admin/UserActions";
import UserDetailModal from "@/components/Admin/UserDetailModal";
import { CheckSquare, Square, Shield, UserX, AlertCircle, Archive, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, X, Check, Trash2, Ban, Lock } from "lucide-react";
import { toast } from "sonner";
import { bulkUpdateUserStatus, updateUserStatus, bulkDeleteUsers } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import UserEditModal from "./UserEditModal";
import { formatNumber, formatDate } from "@/lib/utils";

export default function AdminUsersClient({ users, currentUser }: { users: any[], currentUser: any }) {
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Feature State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("ALL");
    const [filterStatus, setFilterStatus] = useState("ALL");

    const [loading, setLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

    // Bulk Action State
    const [actionType, setActionType] = useState<'DELETE' | 'STATUS_CHANGE' | null>(null);
    const [targetStatus, setTargetStatus] = useState<"ACTIVE" | "LIMITED" | "BANNED" | "ARCHIVED" | null>(null);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

    const canEditUser = (targetUser: any) => {
        // Admin cannot edit Super Admin
        if (!isSuperAdmin && targetUser.role === "SUPER_ADMIN") return false;
        return true;
    };

    const toggleSelect = (id: string, targetUser: any) => {
        if (!canEditUser(targetUser)) return;

        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length > 0) {
            setSelectedIds([]);
        } else {
            // Filter accessible users from the CURRENT FILTERED VIEW
            const editableIds = filteredAndSortedUsers
                .filter(u => canEditUser(u))
                .map(u => u.id);
            setSelectedIds(editableIds);
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedUsers = useMemo(() => {
        let result = [...users];

        // 1. Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(user =>
            (user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.username?.toLowerCase().includes(query))
            );
        }

        // 2. Role Filter
        if (filterRole !== "ALL") {
            result = result.filter(user => user.role === filterRole);
        }

        // 3. Status Filter
        if (filterStatus !== "ALL") {
            result = result.filter(user => (user.status || "ACTIVE") === filterStatus);
        }

        // 4. Sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'name') {
                    aValue = (a.name || a.username || '').toLowerCase();
                    bValue = (b.name || b.username || '').toLowerCase();
                } else if (sortConfig.key === 'createdAt') {
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                } else if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return result;
    }, [users, sortConfig, searchQuery, filterRole, filterStatus]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedUsers.length / rowsPerPage);
    const paginatedUsers = filteredAndSortedUsers.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Reset page when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery, filterRole, filterStatus, rowsPerPage]);

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="opacity-30" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-[var(--site-accent)]" /> : <ArrowDown size={14} className="text-[var(--site-accent)]" />;
    };

    const SortHeader = ({ label, columnKey, className = "" }: { label: string, columnKey: string, className?: string }) => (
        <th id={`sort-header-${columnKey}`} className={`px-6 py-4 cursor-pointer hover:text-white transition-colors group ${className}`} onClick={() => handleSort(columnKey)}>
            <div className="flex items-center gap-2">
                {label}
                <SortIcon columnKey={columnKey} />
            </div>
        </th>
    );

    const performBulkAction = async () => {
        setIsBulkProcessing(true);
        try {
            if (actionType === 'DELETE') {
                const result = (await bulkDeleteUsers(selectedIds)) as any;
                if (result.success) {
                    toast.success(`Deleted ${selectedIds.length} users`);
                    setSelectedIds([]);
                    setActionType(null);
                    router.refresh();
                } else {
                    toast.error(result.error);
                }
            } else if (actionType === 'STATUS_CHANGE' && targetStatus) {
                const result = (await bulkUpdateUserStatus(selectedIds, targetStatus)) as any;
                if (result.success) {
                    toast.success(`Set ${selectedIds.length} users to ${targetStatus}`);
                    setSelectedIds([]);
                    setActionType(null);
                    setTargetStatus(null);
                    router.refresh();
                } else {
                    toast.error(result.error);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to perform action");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleSingleStatusChange = async (userId: string, status: "ACTIVE" | "LIMITED" | "BANNED" | "ARCHIVED") => {
        const result = (await updateUserStatus(userId, status)) as any;
        if (result.success) {
            toast.success(`User set to ${status}`);
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE": return "bg-green-500/20 text-green-400";
            case "LIMITED": return "bg-yellow-500/20 text-yellow-400";
            case "BANNED": return "bg-red-500/20 text-red-400";
            case "ARCHIVED": return "bg-gray-500/20 text-gray-400";
            default: return "bg-blue-500/20 text-blue-400";
        }
    };

    return (
        <>
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Users</h1>
                    <div className="flex gap-3">
                        {/* Potential future action buttons */}
                    </div>
                </div>

                {/* Filters Box */}
                <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">

                        {/* Search Input */}
                        <div className="relative w-full lg:max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-[var(--site-secondary)] transition-colors" size={18} />
                            </div>
                            <input
                                id="user-search-input"
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:border-[var(--site-secondary)]/50 transition-all duration-300"
                            />
                        </div>

                        {/* Filters Group */}
                        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">

                            {/* Role Filter */}
                            <div className="relative w-full sm:w-48 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Shield className="text-gray-400 dark:text-gray-500 group-hover:text-[var(--site-secondary)] transition-colors" size={16} />
                                </div>
                                <select
                                    id="user-role-filter"
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-[var(--site-secondary)]/50 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-black/30 transition-all"
                                >
                                    <option value="ALL">All Roles</option>
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Filter size={14} className="text-gray-400 dark:text-gray-600" />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="relative w-full sm:w-44 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <AlertCircle className="text-gray-400 dark:text-gray-500 group-hover:text-[var(--site-accent-prev)] transition-colors" size={16} />
                                </div>
                                <select
                                    id="user-status-filter"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-[var(--site-accent-prev)]/50 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-black/30 transition-all"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="LIMITED">Limited</option>
                                    <option value="BANNED">Banned</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ArrowUpDown size={14} className="text-gray-400 dark:text-gray-600" />
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            <div className="relative w-full sm:w-32 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Show</span>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={rowsPerPage}
                                    onChange={(e) => setRowsPerPage(Math.max(1, parseInt(e.target.value) || 10))}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-[var(--site-secondary)]/50 appearance-none hover:bg-gray-100 dark:hover:bg-black/30 transition-all"
                                />
                            </div>

                        </div>
                    </div>
                </div>


                {/* Bulk Actions (Only visible when items selected) - REMOVED INLINE */}
                <div className="h-0"> {/* Kept for layout stability if needed, or remove */}
                </div>
            </div>

            <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <button id="select-all-users" onClick={toggleSelectAll} className="flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                                    {selectedIds.length === paginatedUsers.length && paginatedUsers.length > 0 ? <CheckSquare size={18} className="text-[var(--site-accent)]" /> : <Square size={18} />}
                                </button>
                            </th>
                            <SortHeader label="User" columnKey="name" />
                            <SortHeader label="Role" columnKey="role" />
                            <SortHeader label="Status" columnKey="status" />
                            <SortHeader label="Runes" columnKey="points" />
                            <SortHeader label="Email" columnKey="email" />
                            <SortHeader label="Joined" columnKey="createdAt" />
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                        {paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user) => {
                                const isSelf = currentUser && user.id === currentUser.id;
                                const isEditable = canEditUser(user);

                                // Super Admin cannot edit own status
                                const canEditStatus = isEditable && !(isSuperAdmin && isSelf);

                                return (
                                    <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group ${selectedIds.includes(user.id) ? "bg-[var(--site-accent)]/5" : ""} ${!isEditable ? "opacity-60" : ""}`}>
                                        <td className="px-6 py-4">
                                            <button
                                                id={`select-user-${user.id}`}
                                                onClick={() => toggleSelect(user.id, user)}
                                                disabled={!isEditable}
                                                className={`flex items-center ${selectedIds.includes(user.id) ? "text-[var(--site-accent)]" : "text-gray-400 hover:text-gray-600 dark:hover:text-white"} ${!isEditable ? "cursor-not-allowed opacity-50" : ""}`}
                                            >
                                                {selectedIds.includes(user.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                id={`view-user-${user.id}`}
                                                onClick={() => setSelectedUser(user)}
                                                className="flex items-center gap-3 text-left w-full hover:opacity-80 transition-opacity"
                                            >
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700/50 relative border-2 border-transparent group-hover:border-[var(--site-secondary)]/50 transition-colors">
                                                    {user.image ? (
                                                        <Image
                                                            src={user.image}
                                                            alt={user.name || "User"}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                                            {user.name?.charAt(0) || "U"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[var(--site-secondary)] transition-colors">
                                                        {user.name || "No Name"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username || "unknown"}</p>
                                                </div>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : user.role === 'SUPER_ADMIN' ? 'bg-[var(--site-accent-prev)]/20 text-[var(--site-accent-prev)]' : 'bg-[var(--site-accent)]/20 text-[var(--site-accent)]'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                id={`status-select-${user.id}`}
                                                value={user.status || "ACTIVE"}
                                                onChange={(e) => handleSingleStatusChange(user.id, e.target.value as any)}
                                                disabled={!canEditStatus}
                                                className={`px-2 py-1 rounded text-xs font-bold border-none outline-none ${canEditStatus ? "cursor-pointer" : "cursor-not-allowed opacity-70"} ${getStatusColor(user.status || "ACTIVE")}`}
                                            >
                                                <option value="ACTIVE" className="bg-[#0A0D14] text-green-400">ACTIVE</option>
                                                <option value="LIMITED" className="bg-[#0A0D14] text-yellow-400">LIMITED</option>
                                                <option value="BANNED" className="bg-[#0A0D14] text-red-400">BANNED</option>
                                                <option value="ARCHIVED" className="bg-[#0A0D14] text-gray-400">ARCHIVED</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-[var(--site-accent)]">
                                            {formatNumber(user.points || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">{user.email}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isEditable && (
                                                <UserActions user={user} currentUser={currentUser} onEditClick={() => setEditingUser(user)} />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2">
                                            <Search size={24} className="opacity-50" />
                                        </div>
                                        <p className="font-medium">No users found</p>
                                        <p className="text-xs">Try adjusting your filters</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredAndSortedUsers.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredAndSortedUsers.length}</span> users
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 pb-1.5 rounded-lg border border-black/5 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Simple logic to show near pages, can be improved for many pages
                                let p = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    p = currentPage - 2 + i;
                                    if (p > totalPages) p = totalPages - (4 - i);
                                }

                                return (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === p
                                            ? "bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 pb-1.5 rounded-lg border border-black/5 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div >

            {/* Modal */}
            < UserDetailModal
                user={selectedUser}
                currentUser={currentUser}
                isOpen={!!selectedUser
                }
                onClose={() => setSelectedUser(null)}
            />

            <DeleteConfirmationModal
                isOpen={actionType === 'DELETE' && selectedIds.length > 0}
                onClose={() => setActionType(null)}
                onConfirm={performBulkAction}
                isDeleting={isBulkProcessing}
                count={selectedIds.length}
                description={`Are you sure you want to delete ${selectedIds.length} selected users? This action cannot be undone.`}
            />

            {/* Floating Bulk Action Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
                    >
                        <div className="bg-[#1A1A1A] border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 backdrop-blur-xl">
                            <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                                <span className="text-[var(--site-accent)] font-bold">{selectedIds.length}</span>
                                <span className="text-gray-400 text-sm">Selected</span>
                                <button onClick={() => setSelectedIds([])} className="bg-white/10 hover:bg-white/20 p-1 rounded-full transition-colors ml-2">
                                    <X size={14} className="text-white" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={async () => {
                                        setIsBulkProcessing(true);
                                        const res = (await bulkUpdateUserStatus(selectedIds, 'ACTIVE')) as any;
                                        if (res.success) { toast.success(`Set ${selectedIds.length} users to ACTIVE`); setSelectedIds([]); router.refresh(); }
                                        else { toast.error(res.error); }
                                        setIsBulkProcessing(false);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-full text-xs font-medium transition-colors"
                                    disabled={isBulkProcessing}
                                >
                                    <Check size={14} />
                                    Active
                                </button>

                                <button
                                    onClick={async () => {
                                        setIsBulkProcessing(true);
                                        const res = (await bulkUpdateUserStatus(selectedIds, 'LIMITED')) as any;
                                        if (res.success) { toast.success(`Set ${selectedIds.length} users to LIMITED`); setSelectedIds([]); router.refresh(); }
                                        else { toast.error(res.error); }
                                        setIsBulkProcessing(false);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-full text-xs font-medium transition-colors"
                                    disabled={isBulkProcessing}
                                >
                                    <Lock size={14} />
                                    Limit
                                </button>

                                <button
                                    onClick={async () => {
                                        setIsBulkProcessing(true);
                                        const res = (await bulkUpdateUserStatus(selectedIds, 'BANNED')) as any;
                                        if (res.success) { toast.success(`Set ${selectedIds.length} users to BANNED`); setSelectedIds([]); router.refresh(); }
                                        else { toast.error(res.error); }
                                        setIsBulkProcessing(false);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full text-xs font-medium transition-colors"
                                    disabled={isBulkProcessing}
                                >
                                    <Ban size={14} />
                                    Ban
                                </button>

                                <div className="w-px h-4 bg-white/10 mx-2" />

                                <button
                                    onClick={() => setActionType('DELETE')}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-full text-xs font-bold shadow-lg shadow-red-500/20 transition-colors"
                                    disabled={isBulkProcessing}
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* User Edit Modal */}
            <UserEditModal
                user={editingUser}
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                currentUser={currentUser}
            />
        </>
    );
}

