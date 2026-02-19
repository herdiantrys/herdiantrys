"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Trash2, Shield, X, Check, Pencil } from "lucide-react";
import { deleteUser, updateUserRole } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function UserActions({ user, currentUser, onEditClick }: { user: any, currentUser: any, onEditClick?: () => void }) {
    const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(user.role);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Calculate position: align right edge of dropdown with right edge of button
            // Dropdown width is w-48 which is 192px
            const dropdownWidth = 192;
            setDropdownPos({
                top: rect.bottom + window.scrollY + 8,
                left: rect.right + window.scrollX - dropdownWidth
            });
        }
    }, [isOpen]);

    // Handle scroll to close or update position (simpler to close)
    useEffect(() => {
        const handleScroll = () => {
            if (isOpen) setIsOpen(false);
        };
        window.addEventListener("scroll", handleScroll, true);
        return () => window.removeEventListener("scroll", handleScroll, true);
    }, [isOpen]);

    const handleDelete = async () => {
        setLoading(true);
        const result = await deleteUser(user.id);
        setLoading(false);
        setShowDeleteConfirm(false);
        if (result.success) {
            toast.success("User deleted successfully");
        } else {
            toast.error("Failed to delete user");
        }
    };

    const handleRoleUpdate = async () => {
        setLoading(true);
        const result = await updateUserRole(user.id, selectedRole);
        setLoading(false);
        setShowRoleModal(false);
        if (result.success) {
            toast.success("User role updated");
        } else {
            toast.error("Failed to update role");
        }
    };

    // Available Roles logic
    const roles = ['USER', 'ADMIN'];
    if (isSuperAdmin) {
        roles.push('SUPER_ADMIN');
    }

    return (
        <>
            <div className="relative">
                <button
                    id={`user-actions-toggle-${user.id}`}
                    ref={buttonRef}
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-[var(--glass-border)] rounded-lg text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] transition-colors"
                >
                    <MoreHorizontal size={16} />
                </button>
            </div>

            {/* Portal Dropdown Menu */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
                            <motion.div
                                id={`user-actions-dropdown-${user.id}`}
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                style={{
                                    top: dropdownPos.top,
                                    left: dropdownPos.left,
                                    position: 'absolute'
                                }}
                                className="w-48 z-[9999] rounded-xl overflow-hidden shadow-2xl border border-[var(--glass-border)] bg-white/80 dark:bg-black/80 backdrop-blur-xl"
                            >
                                <button
                                    id={`user-action-edit-${user.id}`}
                                    onClick={() => {
                                        setIsOpen(false);
                                        onEditClick?.();
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[var(--glass-text)] hover:bg-[var(--glass-border)] text-left"
                                >
                                    <Pencil size={16} className="text-blue-400" />
                                    Edit User
                                </button>
                                <button
                                    id={`user-action-change-role-${user.id}`}
                                    onClick={() => {
                                        setIsOpen(false);
                                        setShowRoleModal(true);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[var(--glass-text)] hover:bg-[var(--glass-border)] text-left"
                                >
                                    <Shield size={16} className="text-teal-400" />
                                    Change Role
                                </button>
                                <button
                                    id={`user-action-delete-${user.id}`}
                                    onClick={() => {
                                        setIsOpen(false);
                                        setShowDeleteConfirm(true);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 text-left"
                                >
                                    <Trash2 size={16} />
                                    Delete User
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Delete Confirmation Modal (Portal) */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                            <motion.div
                                id={`delete-modal-${user.id}`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="glass p-6 rounded-2xl w-full max-w-sm bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl"
                            >
                                <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
                                <p className="text-gray-300 mb-6 text-sm">
                                    Are you sure you want to delete <span className="font-bold text-white">{user.name}</span>? This action cannot be undone.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        id={`cancel-delete-${user.id}`}
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        id={`confirm-delete-${user.id}`}
                                        onClick={handleDelete}
                                        className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-red-500/20"
                                        disabled={loading}
                                    >
                                        {loading ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Role Update Modal (Portal) */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {showRoleModal && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                            <motion.div
                                id={`role-modal-${user.id}`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="glass p-6 rounded-2xl w-full max-w-sm bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-white">Change Role</h3>
                                    <button id={`close-role-modal-${user.id}`} onClick={() => setShowRoleModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-2 mb-6">
                                    {roles.map((role) => (
                                        <button
                                            id={`role-option-${role}-${user.id}`}
                                            key={role}
                                            onClick={() => setSelectedRole(role)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${selectedRole === role
                                                ? "border-teal-500 bg-teal-500/10 text-teal-400"
                                                : "border-white/10 text-gray-400 hover:border-teal-400/50 hover:text-gray-200"
                                                }`}
                                        >
                                            <span className="font-medium">{role}</span>
                                            {selectedRole === role && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        id={`save-role-${user.id}`}
                                        onClick={handleRoleUpdate}
                                        className="w-full px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-transform"
                                        disabled={loading}
                                    >
                                        {loading ? "Updating..." : "Save Changes"}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
