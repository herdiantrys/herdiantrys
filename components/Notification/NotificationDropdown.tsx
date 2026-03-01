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
    const nm = dict?.notifications_messages || {};

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
                        initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] }}
                        className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:right-0 top-20 sm:top-full sm:mt-4 sm:w-96 rounded-[24px] sm:rounded-[32px] backdrop-blur-2xl bg-white/70 dark:bg-black/60 border border-white/40 dark:border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.25)] overflow-hidden z-[100] ring-1 ring-white/20 dark:ring-white/5"
                    >
                        <div className="px-5 py-4 border-b border-white/10 bg-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-xl tracking-tighter text-foreground flex items-center gap-2">
                                    {dict?.dashboard?.notifications_nav || nm.page_title || "Notifications"}
                                    {unreadCount > 0 && (
                                        <span className="bg-[var(--site-secondary)]/10 text-[var(--site-secondary)] text-[10px] font-black px-2 py-0.5 rounded-md border border-[var(--site-secondary)]/20 shadow-sm transition-all duration-300">
                                            {unreadCount} {nm.new || "new"}
                                        </span>
                                    )}
                                </h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-[10px] font-black uppercase tracking-tighter text-[var(--site-secondary)] hover:text-foreground transition-colors flex items-center gap-1.5"
                                    >
                                        <CheckCheck size={14} className="opacity-70" />
                                        {nm.mark_all_read || "Mark all read"}
                                    </button>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="flex p-1.5 bg-black/10 dark:bg-white/5 rounded-2xl border border-white/5">
                                {['all', 'unread'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as 'all' | 'unread')}
                                        className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all relative ${activeTab === tab
                                            ? "text-black dark:text-white"
                                            : "text-muted-foreground/60 hover:text-muted-foreground"
                                            }`}
                                    >
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeTabBg"
                                                className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-sm"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                            />
                                        )}
                                        <span className="relative z-10">{tab === 'all' ? (nm.all || 'all') : (nm.unread || 'unread')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {loading && notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 size={24} className="animate-spin text-[var(--site-secondary)]" />
                                    <p className="text-xs text-gray-500">{nm.loading || "Loading updates..."}</p>
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
                                                dict={dict}
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
                                <div className="text-center py-20 px-8">
                                    <div className="bg-white/5 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner relative group">
                                        <div className="absolute inset-0 bg-[var(--site-secondary)]/5 rounded-3xl blur-xl group-hover:bg-[var(--site-secondary)]/10 transition-colors" />
                                        <Bell size={32} className="text-muted-foreground/30 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <h4 className="text-lg font-black tracking-tighter text-foreground mb-2">{nm.all_caught_up || "All caught up!"}</h4>
                                    <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed font-medium">
                                        {activeTab === 'unread' ? (nm.no_unread || "You have no unread notifications.") : (nm.no_notifications_time || "You have no notifications at this time.")}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-center">
                            <button
                                onClick={() => {
                                    router.push('/notifications');
                                    onClose();
                                }}
                                className="w-full py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-white hover:bg-[var(--site-secondary)] transition-all flex items-center justify-center gap-2 group"
                            >
                                {nm.view_history || "View full history"}
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
