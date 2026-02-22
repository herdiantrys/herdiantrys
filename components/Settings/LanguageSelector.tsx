"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePreferences } from "@/lib/actions/settings.actions";

export default function LanguageSelector({
    currentLocale,
    userId,
    dict
}: {
    currentLocale: string;
    userId: string;
    dict?: any;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLocale = e.target.value;
        if (newLocale === currentLocale) return;

        setIsLoading(true);

        try {
            // 1. Update DB preference
            const result = await updatePreferences(userId, { language: newLocale });

            if (result.success) {
                // 2. Set NEXT_LOCALE cookie to force middleware to use new language
                // Setting to the domain root
                document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

                // 3. Force hard refresh to the new locale route (e.g. from /en/settings to /id/settings)
                const currentPath = window.location.pathname;

                // Build a path that strips the old locale out properly
                const segments = currentPath.split('/');
                if (segments[1] === currentLocale) {
                    segments[1] = newLocale;
                } else {
                    segments.splice(1, 0, newLocale);
                }

                // Redirect exactly to the newly selected locale prefix
                window.location.href = segments.join('/');
            }
        } catch (error) {
            console.error("Failed to update language", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        {dict?.title || "Language Preference"}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        {dict?.description || "Choose your preferred language for the interface."}
                    </p>
                </div>

                <div className="relative">
                    <select
                        value={currentLocale}
                        onChange={handleLanguageChange}
                        disabled={isLoading}
                        className="appearance-none bg-slate-800/80 border border-slate-600 text-slate-200 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 hover:border-slate-500 transition-colors cursor-pointer w-full sm:w-auto disabled:opacity-50"
                    >
                        <option value="en">{dict?.english || "English"}</option>
                        <option value="id">{dict?.indonesian || "Bahasa Indonesia"}</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        {isLoading ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
