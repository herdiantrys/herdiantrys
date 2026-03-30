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
                className="group relative rounded-full border border-transparent p-2.5 text-[var(--site-sidebar-fg)]/58 transition-all hover:border-[var(--site-sidebar-border)] hover:bg-[var(--site-sidebar-active)]/72 hover:text-[var(--site-sidebar-accent)]"
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
                        className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:right-0 top-20 sm:top-full sm:mt-4 sm:w-96 rounded-[24px] sm:rounded-[32px] border border-[var(--site-sidebar-border-strong)] bg-[color-mix(in_srgb,var(--site-sidebar-bg)_94%,black_6%)] shadow-[0_30px_70px_rgba(0,0,0,0.25)] overflow-hidden z-[100] backdrop-blur-2xl"
                    >
                        <div className="border-b border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/68 px-5 py-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="flex items-center gap-2 text-xl font-black tracking-tighter text-[var(--site-sidebar-fg)]">
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
                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-[var(--site-sidebar-accent)] transition-colors hover:text-[var(--site-sidebar-fg)]"
                                    >
                                        <CheckCheck size={14} className="opacity-70" />
                                        {nm.mark_all_read || "Mark all read"}
                                    </button>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="flex rounded-2xl border border-[var(--site-sidebar-border)] bg-[color-mix(in_srgb,var(--site-sidebar-bg)_68%,transparent)] p-1.5">
                                {['all', 'unread'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as 'all' | 'unread')}
                                        className={`relative flex-1 rounded-xl py-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
                                            ? "text-[var(--site-sidebar-fg)]"
                                            : "text-[var(--site-sidebar-fg)]/58 hover:text-[var(--site-sidebar-fg)]"
                                            }`}
                                    >
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeTabBg"
                                                className="absolute inset-0 rounded-lg border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)] shadow-sm"
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
                                    <p className="text-xs text-[var(--site-sidebar-fg)]/52">{nm.loading || "Loading updates..."}</p>
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
                                    <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/72 shadow-inner group">
                                        <div className="absolute inset-0 rounded-3xl bg-[var(--site-sidebar-accent)]/5 blur-xl transition-colors group-hover:bg-[var(--site-sidebar-accent)]/10" />
                                        <Bell size={32} className="relative z-10 text-[var(--site-sidebar-fg)]/26 transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                    <h4 className="mb-2 text-lg font-black tracking-tighter text-[var(--site-sidebar-fg)]">{nm.all_caught_up || "All caught up!"}</h4>
                                    <p className="mx-auto max-w-[200px] text-xs font-medium leading-relaxed text-[var(--site-sidebar-fg)]/55">
                                        {activeTab === 'unread' ? (nm.no_unread || "You have no unread notifications.") : (nm.no_notifications_time || "You have no notifications at this time.")}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)]/62 p-3 text-center">
                            <button
                                onClick={() => {
                                    router.push('/notifications');
                                    onClose();
                                }}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-[var(--site-sidebar-fg)]/58 transition-all hover:bg-[var(--site-sidebar-accent)] hover:text-[#081019]"
                            >
                                {nm.view_history || "View full history"}
                                <span className="group-hover:translate-x-1 transition-transform">-&gt;</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
