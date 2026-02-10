import { MessageSquare } from "lucide-react";

export default function AdminCommentsPage() {
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                    <MessageSquare size={24} />
                </div>
                <h1 className="text-3xl font-bold">Comments</h1>
            </div>

            <div className="glass p-8 rounded-2xl text-center">
                <p className="text-[var(--glass-text-muted)]">Comment management coming soon.</p>
            </div>
        </div>
    );
}
