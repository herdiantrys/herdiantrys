import { Bell } from "lucide-react";

export default function AdminNotificationsPage() {
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
                    <Bell size={24} />
                </div>
                <h1 className="text-3xl font-bold">Notifications</h1>
            </div>

            <div className="glass p-8 rounded-2xl text-center">
                <p className="text-[var(--glass-text-muted)]">Notification management coming soon.</p>
            </div>
        </div>
    );
}
