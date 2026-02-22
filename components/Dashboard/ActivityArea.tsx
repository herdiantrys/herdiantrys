"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LayoutGrid, Bookmark, ShoppingBag, Bell, Trophy } from "lucide-react";
import { getRecentActivities, getUserActivities, Activity } from "@/lib/actions/activity.actions";
import { Loader2, Plus } from "lucide-react";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import CreatePost from "@/components/Dashboard/CreatePost";
import AchievementsList from "@/components/Gamification/AchievementsList";
import InventoryList from "@/components/Dashboard/InventoryList";

interface ActivityAreaProps {
    user: any; // The current logged-in user (for actions)
    profileUser?: any; // The user whose profile is being viewed (optional, defaults to user)
    activities: Activity[];
    savedActivities?: Activity[];
    inventoryData?: {
        inventory: any[];
        equippedFrame: string | null;
        equippedBackground: string | null;
        profileColor: string | null;
        frameColor: string | null;
    };
    dict: any;
    isOwner: boolean;
    dbUserId?: string; // For prisma actions
}

export default function ActivityArea({
    user,
    profileUser,
    activities: initialActivities,
    savedActivities = [],
    inventoryData,
    dict,
    isOwner,
    dbUserId
}: ActivityAreaProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Activities state for Load More
    const LIMIT = 10;
    const [activities, setActivities] = useState<Activity[]>(initialActivities);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialActivities.length >= LIMIT);

    useEffect(() => {
        setActivities(initialActivities);
        setHasMore(initialActivities.length >= LIMIT);
    }, [initialActivities]);

    const handleLoadMore = async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);

        try {
            const lastActivity = activities[activities.length - 1];
            const before = lastActivity?.timestamp;

            let nextBatch: Activity[] = [];
            if (profileUser) {
                // Fetch specific user activities
                nextBatch = await getUserActivities(profileUser.username, dbUserId || user._id, LIMIT, before);
            } else {
                // Fetch recent global activities
                nextBatch = await getRecentActivities(dbUserId || user._id, LIMIT, before);
            }

            if (!nextBatch || nextBatch.length === 0) {
                setHasMore(false);
            } else {
                setActivities(prev => {
                    // Prevent duplicates
                    const existingIds = new Set(prev.map(a => a.id));
                    const uniqueNew = nextBatch.filter(a => !existingIds.has(a.id));
                    return [...prev, ...uniqueNew];
                });
                // If the total returned is less than the limit we asked for from each source, 
                // it's possible some sources have more, but usually if it's very low, we're near the end.
                // A better check: if ANY source returned LIMIT. But here we fetch from 4 sources.
                // If total is less than LIMIT, it's safe to say we're done.
                if (nextBatch.length < LIMIT) setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to load more activities:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived state from URL (Source of Truth)
    const currentTab = searchParams.get('tab') as 'feed' | 'projects' | 'saved' | 'achievements' | 'inventory' | null;
    const activeTab = (currentTab && ['feed', 'projects', 'saved', 'achievements', 'inventory'].includes(currentTab)) ? currentTab : 'feed';
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
        { id: 'projects', icon: Trophy, label: t.tab_projects || "Projects", show: true },
        { id: 'inventory', icon: ShoppingBag, label: t.tab_inventory || "Inventory", show: true },
        { id: 'saved', icon: Bookmark, label: t.saved_nav || "Saved", show: isOwner }, // Only show saved for owner
        { id: 'achievements', icon: Trophy, label: t.tab_achievements || "Achievements", show: true }, // Always show achievements
    ].filter(tab => tab.show);

    return (
        <div className="w-full">
            {/* Tabs Header - Seamless Folder Style with Mobile Scroll */}
            <div className="flex items-end px-4 md:px-6 gap-2 w-full relative z-30 overflow-x-auto scrollbar-hide scroll-smooth">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id as any)}
                            className={`relative group flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3 min-w-[90px] sm:min-w-auto rounded-t-xl sm:rounded-t-2xl text-xs sm:text-sm font-medium transition-all duration-200 ease-out whitespace-nowrap backdrop-blur-xl
                                ${isActive
                                    ? "bg-white/80 dark:bg-black/40 text-[var(--site-secondary)] border-t border-x border-white/40 dark:border-white/10 mb-[-1px] pb-3 sm:pb-4 z-30 shadow-sm dark:shadow-none"
                                    : "bg-transparent text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/5 mb-0 pb-2.5 sm:pb-3"
                                }`}
                        >
                            {/* Liquid Shine Effect for Active Tab */}
                            {isActive && (
                                <span className="absolute inset-0 bg-[var(--site-secondary)]/5 rounded-t-2xl pointer-events-none" />
                            )}

                            <Icon size={16} className={`relative z-10 ${isActive ? "text-[var(--site-secondary)]" : "text-[var(--glass-text-muted)] group-hover:text-[var(--glass-text)]"}`} />
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area - Connected Folder Pane */}
            <div className="relative z-0 min-h-[400px] bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl transition-all duration-500">

                {/* Decorative gradients for liquid feel */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[var(--site-secondary)]/5 via-transparent to-[var(--site-accent)]/5 rounded-3xl pointer-events-none" />

                {activeTab === 'feed' && (
                    <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Header Section inside the folder */}
                        <div className="flex items-center justify-between mb-4 sm:mb-8">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-[var(--glass-text)] flex items-center gap-2">
                                    <LayoutGrid className="text-[var(--site-secondary)]" size={24} />
                                    {isOwner && !profileUser ? (dict.dashboard.activity_feed_title || "Activity Feed") : `${targetUser.fullName}'s Activities`}
                                </h1>
                                <p className="text-[var(--glass-text-muted)] text-sm mt-1">
                                    {isOwner && !profileUser ? (dict.dashboard.activity_feed_desc || "Check out what's happening in the community.") : (t.recent_updates_desc || "Recent posts and updates.")}
                                </p>
                            </div>
                        </div>

                        {/* Create Post only if owner or on dashboard */}
                        {isOwner && !profileUser && (
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

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-[var(--site-secondary)]/10 hover:text-[var(--site-secondary)] border border-white/40 dark:border-white/10 transition-all duration-200 font-medium text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <Plus className="group-hover:rotate-90 transition-transform duration-300" size={18} />
                                    )}
                                    {isLoading ? (t.loading || "Loading...") : (t.load_more_activity || "Load More Activity")}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-black/5 dark:border-white/5">
                            <div className="p-3 rounded-xl bg-[var(--site-secondary)]/10 text-[var(--site-secondary)]">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--glass-text)]">{t.tab_projects || "Projects"}</h1>
                                <p className="text-[var(--glass-text-muted)] text-sm">{isOwner ? (t.your_published_projects || "Your published projects.") : `${targetUser.fullName}${t.others_projects || "'s projects."}`}</p>
                            </div>
                        </div>

                        {activities.filter(a => a.type === 'new_project').length > 0 ? (
                            <>
                                <ActivityFeed
                                    activities={activities.filter(a => a.type === 'new_project')}
                                    userId={user._id}
                                    dbUserId={dbUserId}
                                    initialBookmarks={user.bookmarks?.map((b: any) => b._ref) || []}
                                    currentUser={user}
                                    dict={dict}
                                />
                                {hasMore && (
                                    <div className="mt-8 flex justify-center">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isLoading}
                                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-[var(--site-secondary)]/10 hover:text-[var(--site-secondary)] border border-white/40 dark:border-white/10 transition-all duration-200 font-medium text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                            {isLoading ? (t.loading || "Loading...") : (t.load_more_projects || "Load More Projects")}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
                                    <Trophy size={32} />
                                </div>
                                <p className="text-[var(--glass-text)] text-lg mb-2">{t.no_projects_yet || "No projects yet."}</p>
                                <p className="text-[var(--glass-text-muted)]">{t.share_work_prompt || "Share your work to see projects here."}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'saved' && isOwner && (
                    <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-black/5 dark:border-white/5">
                            <div className="p-3 rounded-xl bg-[var(--site-secondary)]/10 text-[var(--site-secondary)]">
                                <Bookmark size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--glass-text)]">{t.saved_collection || "Saved Collection"}</h1>
                                <p className="text-[var(--glass-text-muted)] text-sm">{t.saved_collection_desc || "Your bookmarked posts and projects."}</p>
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
                                <p className="text-[var(--glass-text)] text-lg mb-2">{t.no_saved_items || "No saved items yet."}</p>
                                <p className="text-[var(--glass-text-muted)]">{t.bookmark_prompt || "Bookmark posts to see them here."}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-black/5 dark:border-white/5">
                            <div className="p-3 rounded-xl bg-[var(--site-secondary)]/10 text-[var(--site-secondary)]">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--glass-text)]">{t.tab_achievements || "Achievements"}</h1>
                                <p className="text-[var(--glass-text-muted)] text-sm">{t.achievements_desc || "Badges earned through community participation."}</p>
                            </div>
                        </div>
                        <AchievementsList user={targetUser} isOwner={isOwner} />
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-black/5 dark:border-white/5">
                            <div className="p-3 rounded-xl bg-[var(--site-secondary)]/10 text-[var(--site-secondary)]">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--glass-text)]">{t.my_inventory || "My Inventory"}</h1>
                                <p className="text-[var(--glass-text-muted)] text-sm">{t.inventory_desc || "Manage your purchased profile effects and items."}</p>
                            </div>
                        </div>
                        <InventoryList
                            userId={targetUser._id}
                            inventory={inventoryData?.inventory || []}
                            equippedFrame={inventoryData?.equippedFrame || null}
                            equippedBackground={inventoryData?.equippedBackground || null}
                            profileColor={inventoryData?.profileColor || null}
                            frameColor={inventoryData?.frameColor || null}
                            isOwner={isOwner}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
