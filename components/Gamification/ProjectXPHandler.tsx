"use client";

import { useEffect, useRef } from "react";
import { awardXP, trackProjectView } from "@/lib/actions/gamification.actions";
import { toast } from "sonner";
import { XPToast } from "./XPToast";
import { RuneToast } from "./RuneToast";

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
                const trackRes: any = await trackProjectView(userId, projectId);
                if (trackRes?.success && trackRes.awardedBadge) {
                    const badge = trackRes.awardedBadge;
                    // Show Badge Achievement Toast (Combined or Separate)
                    toast.custom((t) => (
                        <XPToast
                            amount={badge.xpReward || 0}
                            reason={`Unlocked: ${badge.name}!`}
                            type="milestone"
                        />
                    ), { duration: 5000 });

                    // Show Rune Toast if present
                    if (badge.runesReward) {
                        setTimeout(() => {
                            toast.custom((t) => (
                                <RuneToast
                                    amount={badge.runesReward}
                                    reason="Achievement Bonus!"
                                />
                            ), { duration: 5000 });
                        }, 1000);
                    }
                }
            };

            triggerXP();
        }
    }, [userId, projectId]);

    return null;
}
