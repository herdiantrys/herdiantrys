"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordVisit } from "@/lib/actions/analytics.actions";

export default function PageTracker() {
    const pathname = usePathname();
    const lastTrackedPath = useRef<string | null>(null);

    useEffect(() => {
        if (!pathname) return;

        // Debounce or prevent duplicate tracking for the identical path in a short time
        if (lastTrackedPath.current === pathname) return;

        // Skip obvious non-page routes
        if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('admin')) {
            // Admin pages are usually excluded from public analytics, we'll exclude them to avoid polluting public stats.
            return;
        }

        lastTrackedPath.current = pathname;

        // Use setTimeout to run this slightly after page load so it doesn't block rendering
        const timer = setTimeout(() => {
            recordVisit(pathname);
        }, 1000);

        return () => clearTimeout(timer);
    }, [pathname]);

    return null; // Invisible component
}
