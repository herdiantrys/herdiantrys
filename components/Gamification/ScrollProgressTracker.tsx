"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { awardXP, updateExplorationProgress, trackDeepThinker } from "@/lib/actions/gamification.actions";
import { toast } from "sonner"; // Assuming sonner is used, if not we'll use console or standard toast

export default function ScrollProgressTracker({ userId }: { userId: string }) {
    const pathname = usePathname();
    const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

    useEffect(() => {
        // Reset per page
        setHasScrolledToEnd(false);

        const handleScroll = async () => {
            // Disable on pages with infinite scroll or where "reading" isn't the primary goal
            if (hasScrolledToEnd || pathname.includes("/projects")) return;

            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            // Check if user is near bottom (within 50px)
            if (scrollTop + windowHeight >= docHeight - 50) {
                setHasScrolledToEnd(true);

                // Award XP for "Deep Dive" (Scroll to end)
                // Limit this to avoid spamming? Ideally we'd track "hasScrolledThisPage" in DB, but for now session state is okay
                const res = await awardXP(userId, 10, "scrolled_to_end");

                if (res.success && 'amount' in res && res.amount) {
                    toast.success(`+${res.amount} XP: Deep Dive!`);
                }

                // Also update exploration
                await updateExplorationProgress(userId, 1);

                // Track Deep Thinker (Read Case Studies)
                // We assume scrolling to end counts as reading
                await trackDeepThinker(userId);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [pathname, userId, hasScrolledToEnd]);

    return null; // Invisible component
}
