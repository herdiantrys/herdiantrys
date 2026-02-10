"use client";

import { useEffect, useRef, useState } from "react";
import { checkAndAwardSessionBonus } from "@/lib/actions/bonus.actions"; // We'll update imports later
import { CoinRewardModal } from "./CoinRewardModal";

export default function SessionRewardSystem({ userId }: { userId: string }) {
    const [rewardAmount, setRewardAmount] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // Config
    const REQUIRED_MINUTES = 10;
    const CHECK_INTERVAL_MS = 60 * 1000; // Check every 1 minute

    useEffect(() => {
        // Try to recover state from localStorage to persist across reloads
        const STORAGE_KEY = `session_start_${userId}`;

        const updateSession = async () => {
            const now = Date.now();
            const storedStart = localStorage.getItem(STORAGE_KEY);

            let startTime = storedStart ? parseInt(storedStart) : now;

            // If stored time is invalid or too old (e.g. > 24 hours), reset it
            if (isNaN(startTime) || (now - startTime > 24 * 60 * 60 * 1000)) {
                startTime = now;
                localStorage.setItem(STORAGE_KEY, startTime.toString());
            }

            // Logic: Calculate accumulated time
            // Since we don't have true "accumulated" without a more complex ticker, 
            // we will check if (Now - StartTime) >= 10 mins.
            // If the user was offline, this might count as "time passed". 
            // While technically "Session" implies active, simpler implementation 
            // of "Time since last reset" is usually what's expected for web apps unless explicit "active" tracking is needed.
            // Given "Total sesi login", forcing user to be strictly active for 10 mins is tedious.
            // Using "Time elapsed since session start/last claim" is standard.

            const diffMs = now - startTime;
            const diffMinutes = diffMs / (1000 * 60);

            if (diffMinutes >= REQUIRED_MINUTES) {
                // Attempt to claim
                const res = await checkAndAwardSessionBonus(userId);

                if (res?.success && res?.awarded) {
                    // Success!
                    setRewardAmount(10); // Fixed 10 coins as per request
                    setShowModal(true);

                    // Reset timer
                    localStorage.setItem(STORAGE_KEY, Date.now().toString());
                } else if (res?.error === "Time requirement not met yet.") {
                    // Server says wait. Update our local start time to sync with server reality?
                    // Or just keep trying next minute.
                    // Ideally we sync with server time, but for now just wait.
                }
            } else {
                // Not yet time
                if (!storedStart) {
                    localStorage.setItem(STORAGE_KEY, startTime.toString());
                }
            }
        };

        // Run immediately on mount
        updateSession();

        // Run interval
        const interval = setInterval(updateSession, CHECK_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [userId]);

    return (
        <CoinRewardModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            amount={rewardAmount || 5}
        />
    );
}
