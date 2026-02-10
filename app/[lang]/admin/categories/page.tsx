import { Layers } from "lucide-react";

export default function AdminCategoriesPage() {
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400">
                    <Layers size={24} />
                </div>
                <h1 className="text-3xl font-bold">Categories</h1>
            </div>

            <div className="glass p-8 rounded-2xl text-center">
                <p className="text-[var(--glass-text-muted)]">Category management coming soon.</p>
            </div>
        </div>
    );
}
