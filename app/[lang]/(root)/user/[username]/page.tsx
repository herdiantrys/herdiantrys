import { defineQuery } from "next-sanity";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";

import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import TrendingSidebar from "@/components/Dashboard/TrendingSidebar";
import { getTrendingPosts } from "@/lib/actions/trending.actions";
import { getUserActivities } from "@/lib/actions/activity.actions";
import { auth } from "@/auth";
import { getUserByUsername, getUserByEmail } from "@/lib/actions/user.actions";
import CreatePost from "@/components/Dashboard/CreatePost";
import UserBanner from "@/components/UserBanner";
// ProfileTabs import removed

import ActivityArea from "@/components/Dashboard/ActivityArea";
import { getBookmarkedProjects } from "@/lib/actions/bookmark.actions";
import { Activity } from "@/lib/actions/activity.actions";
import { ProfileColorProvider } from "@/components/Profile/ProfileColorContext";
import ProfilePageWrapper from "@/components/Profile/ProfilePageWrapper";

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const session = await auth();

    // Fetch User Profile Data using centralized helper to ensure Stats and Points are included
    const [user, trendingPosts] = await Promise.all([
        getUserByUsername(username),
        getTrendingPosts()
    ]);

    if (!user) {
        return notFound();
    }

    // Check for logged in user ID for interaction state
    let loggedInUser = null;
    let loggedInUserId = "";
    if (session?.user?.email) {
        loggedInUser = await getUserByEmail(session.user.email);
        loggedInUserId = loggedInUser?._id || "";
    }

    // Determine ownership
    const isOwner = session?.user?.email === user.email || (loggedInUserId && loggedInUserId === user._id);

    // Fetch user activities
    const activities = await getUserActivities(username, loggedInUserId);

    // Fetch Inventory
    // Note: getUserInventory expects userId, checking if we can fetch for 'user._id' (profile user)
    // The current action might imply fetching for session user? checking signature... 
    // Usually inventory is public? Let's assume yes or check logic.
    // If not public, we might only fetch if isOwner. But let's fetch for profile user to show their items.
    // NOTE: user.id might be undefined if it comes from sanity without id mapping? 
    // user._id is sanity ID. getUserByUsername returns Prisma-like object but might have mapped IDs.
    // Let's assume user.id matches the needed ID for getUserInventory (which uses prisma id or clerk id?)
    // Actually user object from `getUserByUsername` has `id` (Prisma ID) and `_id` (Sanity ID usually).
    // Let's check `getUserInventory` implementation briefly or just try passing user.id (which should be the prisma ID).

    // We need to fetch Inventory for the PROFILE user, not the logged in user (unless we want to show OWN inventory on someone else's profile? No, usually show the profile user's inventory).

    // We also need Saved items ONLY if isOwner.

    let savedActivities: Activity[] = [];

    if (isOwner) {
        try {
            const bookmarkedProjects = await getBookmarkedProjects(user._id); // Uses Sanity ID usually
            savedActivities = bookmarkedProjects.map((item: any) => {
                if (item._type === 'post') {
                    return {
                        id: `post-${item._id}`,
                        type: "user_post",
                        timestamp: item._createdAt,
                        actor: {
                            name: item.postAuthor?.fullName || "Unknown",
                            username: item.postAuthor?.username || "unknown",
                            image: item.postAuthor?.profileImage || item.postAuthor?.imageURL
                        },
                        details: {
                            description: item.text,
                            image: item.postImage
                        },
                        likesCount: 0,
                        isLiked: false
                    };
                } else {
                    return {
                        id: `project-${item._id}`,
                        type: "new_project",
                        timestamp: item._createdAt || new Date().toISOString(),
                        actor: {
                            name: item.projectAuthor?.fullName || "Saved Project",
                            username: item.projectAuthor?.username || "system",
                            image: item.projectAuthor?.profileImage || item.projectAuthor?.imageURL
                        },
                        details: {
                            title: item.title,
                            slug: item.slug?.current,
                            image: item.projectImage,
                            description: "Saved in your collection"
                        },
                        likesCount: 0,
                        isLiked: false
                    };
                }
            });
        } catch (e) {
            console.log("Failed to fetch bookmarks", e);
        }
    }

    const uniqueSavedActivities = Array.from(new Map(savedActivities.map((item: any) => [item.id, item])).values());

    return (
        <ProfileColorProvider initialColor={user.profileColor}>
            <ProfilePageWrapper customBackground={user.equippedBackground}>
                <UserBanner user={user} isOwner={isOwner || false} />

                <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-[200px] md:pt-[400px]">

                    <div className="lg:hidden mb-6">
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--glass-text-muted)] hover:text-teal-400 transition-colors">
                            <ArrowLeft size={20} />
                            <span>Back to Dashboard</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Sidebar - Profile Info */}
                        <div className="lg:col-span-1">
                            <DashboardSidebar user={user} isPublic={!isOwner} />
                        </div>

                        {/* Middle - User Activity Feed Area */}
                        <div className="lg:col-span-2">
                            <Suspense fallback={<div className="h-40 glass-liquid rounded-3xl" />}>
                                <ActivityArea
                                    user={loggedInUser || { ...user, _id: session?.user?.id }} // Current interacting user
                                    profileUser={user} // The profile being viewed
                                    activities={activities}
                                    savedActivities={uniqueSavedActivities as Activity[]}
                                    dict={{}} // Pass empty if no dict avail on public profile, or fetch dict if needed
                                    isOwner={!!isOwner}
                                    dbUserId={session?.user?.id}
                                />
                            </Suspense>
                        </div>

                        {/* Right Sidebar - Trending */}
                        <div className="hidden lg:block lg:col-span-1">
                            <TrendingSidebar posts={trendingPosts} />
                        </div>
                    </div>
                </div>
            </ProfilePageWrapper>
        </ProfileColorProvider>
    );
}
