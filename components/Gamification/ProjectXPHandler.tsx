"use client";

import { useEffect, useRef } from "react";
import { awardXP, trackProjectView } from "@/lib/actions/gamification.actions";
import { toast } from "sonner";
import { XPToast } from "./XPToast";

export default function ProjectXPHandler({ userId, projectId }: { userId: string, projectId: string }) {
    const hasTracked = useRef(false);

    useEffect(() => {
        if (!hasTracked.current) {
            hasTracked.current = true;

            const triggerXP = async () => {
                // 1. Award small XP for viewing (Daily limited likely)
                const res = await awardXP(userId, 5, `view_project_${projectId}`);
                if (res.success && (res as any).amount) {
                    toast.custom((t) => (
                        <XPToast amount={(res as any).amount} reason="Project Explorer!" />
                    ));
                }

                // 2. Track View for Milestones (Observer, Scout, etc.)
                await trackProjectView(userId, projectId);
            };

            triggerXP();
        }
    }, [userId, projectId]);

    return null;
}
