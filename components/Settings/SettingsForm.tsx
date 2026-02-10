
"use client";

import { useState } from "react";
import { updatePreferences, UserPreferences } from "@/lib/actions/settings.actions";
import { Loader2, Globe, Lock, Bell, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ userId, initialPreferences }: { userId: string; initialPreferences: UserPreferences }) {
    const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences || {
        language: "en"
    });
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updatePreferences(userId, preferences);

        if (res.success) {
            // Check if language changed
            if (preferences.language !== initialPreferences.language) {
                // Redirect to new locale
                const currentPath = window.location.pathname;
                const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${preferences.language}`);
                window.location.href = newPath;
                return;
            }
            router.refresh();
        }
        setIsSaving(false);
    };



    const setLanguage = (lang: "en" | "id") => {
        setPreferences(prev => ({ ...prev, language: lang }));
    };

    return (
        <div className="space-y-8">




            {/* Language */}
            <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-[var(--glass-text)] mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-blue-400" />
                    Language
                </h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => setLanguage("en")}
                        className={`px-4 py-2 rounded-xl border transition-all ${preferences.language === "en" ? "bg-teal-500/20 border-teal-500 text-teal-400" : "bg-white/5 border-transparent text-[var(--glass-text-muted)] hover:bg-white/10"}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setLanguage("id")}
                        className={`px-4 py-2 rounded-xl border transition-all ${preferences.language === "id" ? "bg-teal-500/20 border-teal-500 text-teal-400" : "bg-white/5 border-transparent text-[var(--glass-text-muted)] hover:bg-white/10"}`}
                    >
                        Bahasa Indonesia
                    </button>
                </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
