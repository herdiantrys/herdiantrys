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
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (userId) {
            fetchNotifications();
        }
    }, [userId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
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
            fetchNotifications();
        }
        onToggle();
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        await markAllNotificationsAsRead(userId);
        router.refresh();
    };

    const filteredNotifications = activeTab === 'all'
        ? notifications
        : notifications.filter(n => !n.read);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggleClick}
                className="relative p-2 rounded-full hover:bg-[var(--glass-border)] transition-colors text-[var(--glass-text)] group"
            >
                <Bell size={20} className={`transition-transform duration-300 ${isOpen ? 'text-[var(--site-secondary)] scale-110' : ''} group-hover:scale-110`} />

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
                        initial={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-4 w-96 rounded-2xl bg-white/80 dark:bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden z-50 ring-1 ring-white/10"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    {dict?.dashboard?.notifications || "Notifications"}
                                    {unreadCount > 0 && (
                                        <span className="bg-[var(--site-secondary)] text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm shadow-[var(--site-secondary)]/30">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-[10px] font-bold uppercase tracking-wider text-[var(--site-secondary)] hover:text-[var(--site-secondary)]/80 transition-colors flex items-center gap-1"
                                    >
                                        <CheckCheck size={12} />
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="flex p-1 bg-gray-200/50 dark:bg-white/5 rounded-xl border border-white/10">
                                {['all', 'unread'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as 'all' | 'unread')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all relative ${activeTab === tab
                                            ? "text-white shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                            }`}
                                    >
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeTabBg"
                                                className="absolute inset-0 bg-[var(--site-secondary)] rounded-lg shadow-sm shadow-[var(--site-secondary)]/20"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10 capitalize">{tab}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {loading && notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 size={24} className="animate-spin text-[var(--site-secondary)]" />
                                    <p className="text-xs text-gray-500">Loading updates...</p>
                                </div>
                            ) : filteredNotifications.length > 0 ? (
                                <AnimatePresence initial={false} mode="popLayout">
                                    {filteredNotifications.map((notification) => (
                                        <motion.div
                                            key={notification._id}
                                            layout
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <NotificationItem
                                                notification={notification}
                                                onClick={() => {
                                                    if (!notification.read) {
                                                        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
                                                        markNotificationAsRead(notification._id);
                                                    }
                                                    onClose();
                                                }}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <div className="text-center py-16 px-6">
                                    <div className="bg-gray-100 dark:bg-white/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-inner">
                                        <Bell size={24} className="text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">All caught up!</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                                        {activeTab === 'unread' ? "You have no unread notifications." : "You have no notifications at this time."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-center backdrop-blur-lg">
                            <button
                                onClick={() => {
                                    router.push('/notifications');
                                    onClose();
                                }}
                                className="w-full py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-white hover:bg-[var(--site-secondary)] transition-all flex items-center justify-center gap-2 group"
                            >
                                View full history
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
