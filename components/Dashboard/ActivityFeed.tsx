"use client";

import { Activity } from "@/lib/actions/activity.actions";
import { AnimatePresence, motion } from "framer-motion";
import ActivityCard from "./ActivityCard";

export default function ActivityFeed({ activities, userId, initialBookmarks = [], currentUser, dict, dbUserId }: { activities: Activity[], userId: string, initialBookmarks?: string[], currentUser?: any, dict?: any, dbUserId?: string }) {
    const t = dict?.dashboard || {};

    const [hiddenIds, setHiddenIds] = useState<string[]>([]);
    const [hiddenIdsState, setHiddenIdsState] = useState<string[]>([]);

    // Check if activity is valid and not hidden
    // Use local state for immediate hiding
    const visibleActivities = activities.filter(a => !!a && !hiddenIdsState.includes(a.id));

    const handleRemove = (id: string) => {
        setHiddenIdsState(prev => [...prev, id]);
    };

    if (!visibleActivities || visibleActivities.length === 0) {
        return (
            <div className="text-center py-10 text-[var(--glass-text-muted)]">
                <p>{t.no_activity || "No recent activity."}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <AnimatePresence mode="popLayout">
                {visibleActivities.map((activity) => (
                    <motion.div
                        key={activity.id}
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ActivityCard
                            activity={activity}
                            userId={userId}
                            dbUserId={dbUserId}
                            initialIsBookmarked={initialBookmarks.includes(activity.id.replace("project-", "").replace("post-", "").replace("user-", ""))}
                            currentUser={currentUser}
                            t={t}
                            onRemove={() => handleRemove(activity.id)}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// Imports for local state to work in the main component if I removed them?
// Actually I need to keep imports that are used in `ActivityFeed` main component.
// `useState` is used.
import { useState } from "react";
