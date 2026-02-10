"use client";

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LayoutGrid, Bookmark, ShoppingBag, Bell } from "lucide-react";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import CreatePost from "@/components/Dashboard/CreatePost";
import { Activity } from "@/lib/actions/activity.actions";

interface ActivityAreaProps {
    user: any; // The current logged-in user (for actions)
    profileUser?: any; // The user whose profile is being viewed (optional, defaults to user)
    activities: Activity[];
    savedActivities?: Activity[];
    inventoryData?: {
        inventory: any[];
        equippedFrame: string | null;
        equippedBackground: string | null;
    };
    dict: any;
    isOwner: boolean;
    dbUserId?: string; // For prisma actions
}

export default function ActivityArea({
    user,
    profileUser,
    activities,
    savedActivities = [],
    inventoryData,
    dict,
    isOwner,
    dbUserId
}: ActivityAreaProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Derived state from URL (Source of Truth)
    const currentTab = searchParams.get('tab') as 'feed' | 'saved' | null;
    console.log("ActivityArea Debug:", {
        rawTab: searchParams.get('tab'),
        currentTab,
        pathname
    });
    const activeTab = (currentTab && ['feed', 'saved'].includes(currentTab)) ? currentTab : 'feed';
    const t = dict?.dashboard || {};

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tabId);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // If profileUser is provided, we are on a profile page. Otherwise dashboard.
    const targetUser = profileUser || user;

    // Filter tabs based on ownership. 
    // If not owner, hide 'saved'. 'Inventory' might be visible if we want to show other's items (usually yes).
    const tabs = [
        { id: 'feed', icon: LayoutGrid, label: t.feed || "Feed", show: true },
        { id: 'saved', icon: Bookmark, label: t.saved_nav || "Saved", show: isOwner }, // Only show saved for owner
    ].filter(tab => tab.show);

    return (
        <div className="w-full">
            {/* Tabs Header - Seamless Folder Style */}
            <div className="flex items-end px-6 gap-2 w-full relative z-30">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id as any)}
                            className={`relative group flex items-center gap-2 px-6 py-3 rounded-t-2xl text-sm font-medium transition-all duration-200 ease-out whitespace-nowrap backdrop-blur-xl
                                ${isActive
                                    ? "bg-white/80 dark:bg-black/40 text-teal-600 dark:text-teal-400 border-t border-x border-white/40 dark:border-white/10 mb-[-1px] pb-4 z-30 shadow-sm dark:shadow-none"
                                    : "bg-transparent text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/5 mb-0 pb-3"
                                }`}
                        >
                            {/* Liquid Shine Effect for Active Tab */}
                            {isActive && (
                                <span className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 to-cyan-500/5 rounded-t-2xl pointer-events-none" />
                            )}

                            <Icon size={16} className={`relative z-10 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-[var(--glass-text-muted)] group-hover:text-[var(--glass-text)]"}`} />
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area - Connected Folder Pane */}
            <div className="relative z-0 min-h-[400px] bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-xl transition-all duration-500">

                {/* Decorative gradients for liquid feel */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-teal-500/5 via-transparent to-purple-500/5 rounded-3xl pointer-events-none" />

                {activeTab === 'feed' && (
                    <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Header Section inside the folder */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--glass-text)] flex items-center gap-2">
                                    <LayoutGrid className="text-teal-600 dark:text-teal-500" size={24} />
                                    {isOwner && !profileUser ? (dict.dashboard.activity_feed_title || "Activity Feed") : `${targetUser.fullName}'s Activities`}
                                </h1>
                                <p className="text-[var(--glass-text-muted)] text-sm mt-1">
                                    {isOwner && !profileUser ? (dict.dashboard.activity_feed_desc || "Check out what's happening in the community.") : "Recent posts and updates."}
                                </p>
                            </div>
                        </div>

                        {/* Create Post only if owner or on dashboard */}
                        {isOwner && (
                            <div className="mb-8">
                                <CreatePost user={user} dict={dict} dbUserId={dbUserId} />
                            </div>
                        )}

                        <ActivityFeed
                            activities={activities}
                            userId={user._id}
                            dbUserId={dbUserId}
                            initialBookmarks={user.bookmarks?.map((b: any) => b._ref) || []}
                            currentUser={user}
                            dict={dict}
                        />
                    </div>
                )}

                {activeTab === 'saved' && isOwner && (
                    <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-black/5 dark:border-white/5">
                            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                <Bookmark size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--glass-text)]">Saved Collection</h1>
                                <p className="text-[var(--glass-text-muted)] text-sm">Your bookmarked posts and projects.</p>
                            </div>
                        </div>

                        {savedActivities.length > 0 ? (
                            <ActivityFeed
                                activities={savedActivities}
                                userId={user._id}
                                dbUserId={dbUserId}
                                initialBookmarks={user.bookmarks?.map((b: any) => b._ref) || []}
                                currentUser={user}
                                dict={dict}
                            />
                        ) : (
                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
                                    <Bookmark size={32} />
                                </div>
                                <p className="text-[var(--glass-text)] text-lg mb-2">No saved items yet.</p>
                                <p className="text-[var(--glass-text-muted)]">Bookmarks posts to see them here.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
