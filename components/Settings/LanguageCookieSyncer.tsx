"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function LanguageCookieSyncer({
    userLanguage,
    currentPathLang
}: {
    userLanguage: string;
    currentPathLang: string;
}) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Only run on the client, and only if they differ from the cookie or path
        const match = document.cookie.match(/(?:^|;)\s*NEXT_LOCALE=([^;]*)/);
        const currentCookie = match ? match[1] : null;

        if (currentCookie !== userLanguage) {
            // Update the cookie
            document.cookie = `NEXT_LOCALE=${userLanguage}; path=/; max-age=31536000; SameSite=Lax`;

            // If the URL language prefix doesn't match the user's preferred language,
            // we should redirect them to their preferred language route to avoid a mismatch
            if (currentPathLang !== userLanguage) {
                // Build a path that swaps the old locale out properly
                const segments = pathname.split('/');
                if (segments[1] === currentPathLang) {
                    segments[1] = userLanguage;
                } else {
                    segments.splice(1, 0, userLanguage);
                }
                window.location.href = segments.join('/');
            }
        }
    }, [userLanguage, currentPathLang, pathname, router]);

    return null; // This component doesn't render anything
}
