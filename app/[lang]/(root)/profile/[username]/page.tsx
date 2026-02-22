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
import { serializeForClient } from "@/lib/utils";
import CreatePost from "@/components/Dashboard/CreatePost";
import UserBanner from "@/components/UserBanner";
import ActivityArea from "@/components/Dashboard/ActivityArea";
import { getUserInventory } from "@/lib/actions/inventory.actions";
import { getDictionary } from "@/get-dictionary";
import { ProfileColorProvider } from "@/components/Profile/ProfileColorContext";
import { getRanks } from "@/lib/actions/rank.actions";
import BadgesSidebar from "@/components/Dashboard/BadgesSidebar";
import PortfolioWidget from "@/components/Dashboard/PortfolioWidget";
import { trackProfileVisit } from "@/lib/actions/gamification.actions";
import ProfilePageWrapper from "@/components/Profile/ProfilePageWrapper";
import { getBookmarkedProjects } from "@/lib/actions/bookmark.actions";
import { Activity } from "@/lib/actions/activity.actions";


export default async function UserProfilePage({ params }: { params: Promise<{ lang: string; username: string }> }) {
    const { lang, username } = await params;
    const session = await auth();
    const dict = await getDictionary((lang || 'en') as "en" | "id");

    const [user, trendingPosts, ranks] = await Promise.all([
        getUserByUsername(username),
        getTrendingPosts(),
        getRanks()
    ]);

    if (!user) {
        return notFound();
    }

    // Check for logged in user for interaction state
    let loggedInUser = null;
    let loggedInUserId = "";
    if (session?.user?.email) {
        loggedInUser = await getUserByEmail(session.user.email);
        loggedInUserId = loggedInUser?._id || "";
    }

    // Verify ownership for sensitive data
    const isOwner = session?.user?.email === user.email || (loggedInUserId !== "" && loggedInUserId === user._id);

    // SaaS Portfolio Check - Moved to dedicated sub-route /portfolio
    // Standard profile continues below

    // Fetch activities and inventory in parallel for standard profile
    const [activities, inventoryData] = await Promise.all([
        getUserActivities(username, loggedInUserId),
        getUserInventory(user._id)
    ]);

    // Track Profile Visit if not owner and user is logged in
    if (!isOwner && loggedInUserId && user.id) {
        trackProfileVisit(loggedInUserId, user.id).catch(err => console.error("Profile Visit Track Error:", err));
    }

    // Fetch Saved items ONLY if isOwner
    let savedActivities: Activity[] = [];
    if (isOwner) {
        try {
            const bookmarkedProjects = await getBookmarkedProjects(user._id);
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

        }
    }

    const uniqueSavedActivities = Array.from(new Map(savedActivities.map((item: any) => [item.id, item])).values());

    // Sanitize data
    const safeUser = serializeForClient(user);
    const safeLoggedInUser = serializeForClient(loggedInUser);
    const safeTrendingPosts = serializeForClient(trendingPosts);

    return (
        <ProfileColorProvider initialColor={user.profileColor || null}>
            <ProfilePageWrapper customBackground={user.equippedBackground}>
                <UserBanner user={user} isOwner={isOwner || false} />

                <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-[200px] md:pt-[400px]">

                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--glass-text-muted)] hover:text-teal-400 mb-6 transition-colors lg:hidden">
                        <ArrowLeft size={20} />
                        <span>{dict.profile.back_to_dashboard || "Back to Dashboard"}</span>
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Sidebar - Profile Info */}
                        <div className="lg:col-span-1">
                            <DashboardSidebar user={user} isPublic={!isOwner} dict={dict} ranks={ranks} />
                        </div>

                        {/* Middle - User Activity Feed Area with Tabs */}
                        <div className="lg:col-span-2">
                            <ActivityArea
                                user={safeLoggedInUser || safeUser} // Pass logged in user for actions, or profile user if guest (read-only mostly)
                                profileUser={safeUser}
                                activities={activities}
                                savedActivities={uniqueSavedActivities as Activity[]}
                                inventoryData={inventoryData}
                                dict={dict}
                                isOwner={isOwner}
                                dbUserId={loggedInUserId}
                            />
                        </div>

                        {/* Right Sidebar - Trending */}
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="space-y-6">
                                <BadgesSidebar user={safeUser} isOwner={isOwner} dict={dict} />
                                <PortfolioWidget user={safeUser} dict={dict} />
                                <TrendingSidebar posts={safeTrendingPosts} dict={dict} />
                            </div>
                        </div>
                    </div>
                </div>
            </ProfilePageWrapper>
        </ProfileColorProvider>
    );
}
