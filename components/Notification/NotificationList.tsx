
"use client";

import { useState } from "react";
import NotificationItem from "./NotificationItem";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions/notification.actions";
import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationList({ initialNotifications, userId, dict }: { initialNotifications: any[]; userId: string; dict?: any }) {
    const [notifications, setNotifications] = useState(initialNotifications);
    const router = useRouter();
    const nm = dict?.notifications_messages || {};

    const handleMarkAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        await markNotificationAsRead(id);
        router.refresh();
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        await markAllNotificationsAsRead(userId);
        router.refresh();
    };

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 dark:text-[var(--glass-text-muted)]">
                <p>{nm.no_notifications || "No notifications yet."}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-2">
                <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
                >
                    <CheckCheck size={14} />
                    {nm.mark_all_read || "Mark all as read"}
                </button>
            </div>

            <div className="flex flex-col gap-2">
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification._id}
                        notification={notification}
                        dict={dict}
                        onClick={() => handleMarkAsRead(notification._id)}
                    />
                ))}
            </div>
        </div>
    );
}
