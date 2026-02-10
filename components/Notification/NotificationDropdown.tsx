"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions/notification.actions";
import NotificationItem from "./NotificationItem";
import { useRouter } from "next/navigation";

export default function NotificationDropdown({ userId, dict, isOpen, onToggle, onClose }: { userId: string, dict: any, isOpen: boolean, onToggle: () => void, onClose: () => void }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        // Fetch notifications on mount and when userId changes
        if (userId) {
            fetchNotifications();
        }
    }, [userId]);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        // Only listen if open
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    const fetchNotifications = async () => {
        setLoading(true);
        const data = await getNotifications(userId);
        setNotifications(data);
        setLoading(false);
    };

    const handleToggleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen) {
            // Re-fetch when opening to get latest
            fetchNotifications();
        }
        onToggle();
    };

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if clicking the read indicator directly (though unlikely in current item design, good practice)

        // Optimistic update
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        await markNotificationAsRead(id);
        router.refresh(); // Refresh server components if needed
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        await markAllNotificationsAsRead(userId);
        router.refresh();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggleClick}
                className="relative p-2 rounded-full hover:bg-[var(--glass-border)] transition-colors text-[var(--glass-text)] group"
            >
                <Bell size={20} className={`transition-transform duration-300 ${isOpen ? 'text-teal-500 scale-110' : ''} group-hover:scale-110`} />

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-300">
                        {unreadCount > 9 ? '9+' : unreadCount}
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-4 w-80 sm:w-96 rounded-2xl bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden z-50 ring-1 ring-black/5"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                                {dict?.dashboard?.notifications || "Notifications"}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors"
                                >
                                    <CheckCheck size={14} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Custom Scrollbar for list */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {loading && notifications.length === 0 ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 size={24} className="animate-spin text-teal-500" />
                                </div>
                            ) : notifications.length > 0 ? (
                                <div className="flex flex-col">
                                    {notifications.map((notification) => (
                                        <div key={notification._id} className="border-b border-gray-100 dark:border-white/5 last:border-0">
                                            {/* We pass a modified onClick to marking read seamlessly */}
                                            <NotificationItem
                                                notification={notification}
                                                onClick={() => {
                                                    if (!notification.read) {
                                                        // Fire and forget the read status update locally (NotificationItem handles navigation)
                                                        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
                                                        markNotificationAsRead(notification._id);
                                                    }
                                                    onClose();
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-4">
                                    <div className="bg-gray-100 dark:bg-white/5 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                        <Bell size={20} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No notifications yet
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-center">
                            <button
                                onClick={() => {
                                    router.push('/notifications');
                                    onClose();
                                }}
                                className="text-xs font-medium text-gray-500 hover:text-teal-500 transition-colors"
                            >
                                View all notifications
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
