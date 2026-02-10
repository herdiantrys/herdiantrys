"use client";

import { useEffect, useRef } from "react";
import { awardXP, trackProjectView } from "@/lib/actions/gamification.actions";
import { toast } from "sonner";

export default function ProjectXPHandler({ userId, projectId }: { userId: string, projectId: string }) {
    const hasAwarded = useRef(false);

    useEffect(() => {
        if (hasAwarded.current) return;
        hasAwarded.current = true;

        const triggerXP = async () => {
            // Delay slightly to ensure they didn't just bounce immediately? 
            // Or just award on mount as requested.
            await new Promise(r => setTimeout(r, 2000)); // 2s delay

            const res = await awardXP(userId, 20, `view_project_${projectId}`);
            if (res.success && res.amount) {
                toast.success(`+${res.amount} XP: Project Explorer!`);
            }

            // Track Badge Progress (Viewed Projects)
            await trackProjectView(userId, projectId);
        };

        triggerXP();
    }, [userId, projectId]);

    return null;
}
