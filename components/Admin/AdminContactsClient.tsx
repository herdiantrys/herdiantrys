"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, Trash2, X, Mail, CheckCircle, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { bulkDeleteContacts, deleteContact, markAsRead } from "@/lib/actions/contact.actions";
import { toast } from "sonner";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { AnimatePresence, motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

export default function AdminContactsClient({ contacts }: { contacts: any[] }) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [viewMessage, setViewMessage] = useState<any | null>(null);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');

    // Bulk Action State
    const [actionType, setActionType] = useState<'DELETE' | null>(null);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Sort Config
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Local state for contacts to support optimistic updates
    const [localContacts, setLocalContacts] = useState(contacts);

    useMemo(() => {
        setLocalContacts(contacts);
    }, [contacts]);

    const toggleSelect = (id: string) => {
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
            setSelectedIds(filteredAndSortedContacts.map(c => c.id));
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedContacts = useMemo(() => {
        let result = [...localContacts];

        // 1. Filter by Status
        if (filterStatus === 'UNREAD') {
            result = result.filter(c => !c.isRead);
        } else if (filterStatus === 'READ') {
            result = result.filter(c => c.isRead);
        }

        // 2. Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(contact =>
                contact.name?.toLowerCase().includes(query) ||
                contact.email?.toLowerCase().includes(query) ||
                contact.message?.toLowerCase().includes(query)
            );
        }

        // 3. Sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'createdAt') {
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                } else if (typeof aValue === 'boolean') {
                    aValue = aValue ? 1 : 0;
                    bValue = bValue ? 1 : 0;
                } else if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [localContacts, sortConfig, searchQuery, filterStatus]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedContacts.length / rowsPerPage);
    const paginatedContacts = filteredAndSortedContacts.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery, rowsPerPage, filterStatus]);

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="opacity-30" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-teal-400" /> : <ArrowDown size={14} className="text-teal-400" />;
    };

    const SortHeader = ({ label, columnKey, className = "" }: { label: string, columnKey: string, className?: string }) => (
        <th className={`px-6 py-4 cursor-pointer hover:text-white transition-colors group ${className}`} onClick={() => handleSort(columnKey)}>
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
                const result = (await bulkDeleteContacts(selectedIds)) as any;
                if (result.success) {
                    toast.success(`Deleted ${selectedIds.length} messages`);
                    setSelectedIds([]);
                    setActionType(null);
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

    const handleReadMessage = async (contact: any) => {
        setViewMessage(contact);
        if (!contact.isRead) {
            // Optimistic Update
            setLocalContacts(prev => prev.map(c =>
                c.id === contact.id ? { ...c, isRead: true } : c
            ));

            const result = (await markAsRead(contact.id)) as any;
            if (!result.success) {
                // Revert if failed
                setLocalContacts(prev => prev.map(c =>
                    c.id === contact.id ? { ...c, isRead: false } : c
                ));
                toast.error("Failed to mark as read");
            } else {
                router.refresh();
            }
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Messages
                    </h1>
                    <span className="text-gray-400 text-sm mt-1 block">
                        Inbox management
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                {/* Search and Filters Card */}
                <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                        {/* Search Input */}
                        <div className="relative w-full lg:max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search sender, email, or content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:border-teal-500/50 transition-all"
                            />
                        </div>

                        {/* Filter & Pagination Control */}
                        <div className="flex gap-4 w-full lg:w-auto">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:border-teal-500/50 cursor-pointer"
                            >
                                <option value="ALL">All Messages</option>
                                <option value="UNREAD">Unread Only</option>
                                <option value="READ">Read Only</option>
                            </select>

                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={rowsPerPage}
                                onChange={(e) => setRowsPerPage(Math.max(1, parseInt(e.target.value) || 10))}
                                className="w-20 pl-4 pr-2 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:border-teal-500/50"
                                title="Rows per page"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <button onClick={toggleSelectAll} className="flex items-center text-gray-400 hover:text-white transition-colors">
                                    {selectedIds.length === paginatedContacts.length && paginatedContacts.length > 0 ? <CheckSquare size={18} className="text-[var(--site-accent)]" /> : <Square size={18} />}
                                </button>
                            </th>
                            <SortHeader label="Sender" columnKey="name" />
                            <SortHeader label="Email" columnKey="email" />
                            <SortHeader label="Message" columnKey="message" />
                            <SortHeader label="Status" columnKey="isRead" />
                            <SortHeader label="Date" columnKey="createdAt" />
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                        {paginatedContacts.length > 0 ? (
                            paginatedContacts.map((contact) => (
                                <tr
                                    key={contact.id}
                                    className={`
                                        hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group
                                        ${selectedIds.includes(contact.id) ? "bg-[var(--site-accent)]/5" : ""}
                                        ${!contact.isRead ? "font-semibold text-gray-900 dark:text-white" : ""}
                                    `}
                                >
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleSelect(contact.id); }}
                                            className={`flex items-center ${selectedIds.includes(contact.id) ? "text-[var(--site-accent)]" : "text-gray-400 hover:text-gray-600 dark:hover:text-white"}`}
                                        >
                                            {selectedIds.includes(contact.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">{contact.name}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{contact.email}</td>
                                    <td className="px-6 py-4 text-sm max-w-xs truncate cursor-pointer" onClick={() => handleReadMessage(contact)}>
                                        {contact.message}
                                    </td>
                                    <td className="px-6 py-4">
                                        {contact.isRead ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                                                <CheckCircle size={12} /> Viewed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--site-accent)]/20 text-[var(--site-accent)] border border-[var(--site-accent)]/20 animate-pulse">
                                                <Mail size={12} /> New
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(contact.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleReadMessage(contact)}
                                            className="text-sm text-[var(--site-accent)] hover:underline mr-3 font-medium transition-colors"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2">
                                            <Mail size={24} className="opacity-50" />
                                        </div>
                                        <p className="font-medium">No messages found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredAndSortedContacts.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredAndSortedContacts.length}</span> messages
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 pb-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                            className="px-3 py-1 pb-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={actionType === 'DELETE' && selectedIds.length > 0}
                onClose={() => setActionType(null)}
                onConfirm={performBulkAction}
                isDeleting={isBulkProcessing}
                count={selectedIds.length}
                description={`Are you sure you want to delete ${selectedIds.length} selected messages? This action cannot be undone.`}
            />

            {/* Message View Modal */}
            <AnimatePresence>
                {viewMessage && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setViewMessage(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 w-full max-w-2xl relative z-10 shadow-2xl"
                        >
                            <button onClick={() => setViewMessage(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>

                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{viewMessage.name}</h2>
                            <p className="text-teal-400 text-sm mb-6">{viewMessage.email}</p>

                            <div className="bg-gray-50 dark:bg-black/20 p-6 rounded-xl border border-gray-200 dark:border-white/5 max-h-[60vh] overflow-y-auto">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {viewMessage.message}
                                </p>
                            </div>

                            <div className="flex justify-end mt-6 gap-3">
                                <button
                                    onClick={() => setViewMessage(null)}
                                    className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={async () => {
                                        const result = (await deleteContact(viewMessage.id)) as any;
                                        toast.success("Message deleted");
                                        setViewMessage(null);
                                        router.refresh();
                                    }}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                <span className="text-white font-bold">{selectedIds.length}</span>
                                <span className="text-gray-400 text-sm">Selected</span>
                                <button onClick={() => setSelectedIds([])} className="bg-white/10 hover:bg-white/20 p-1 rounded-full transition-colors ml-2">
                                    <X size={14} className="text-white" />
                                </button>
                            </div>

                            <button
                                onClick={() => setActionType('DELETE')}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-full text-sm font-bold shadow-lg shadow-red-500/20 transition-colors"
                                disabled={isBulkProcessing}
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
