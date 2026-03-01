import { auth } from "@/auth";
import { getDictionary } from "@/get-dictionary";
import { redirect } from "next/navigation";
import { getRecentActivities } from "@/lib/actions/activity.actions";
import { getUserByEmail } from "@/lib/actions/user.actions";
import ActivityFeed from "@/components/Dashboard/ActivityFeed"; import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import TrendingSidebar from "@/components/Dashboard/TrendingSidebar";
// ProfileTabs import removed
import CreatePost from "@/components/Dashboard/CreatePost";
import { getTrendingPosts } from "@/lib/actions/trending.actions";
import ActivityArea from "@/components/Dashboard/ActivityArea";
import PortfolioWidget from "@/components/Dashboard/PortfolioWidget";
import { getBookmarkedProjects } from "@/lib/actions/bookmark.actions";
import { Activity } from "@/lib/actions/activity.actions";
import { ProfileColorProvider } from "@/components/Profile/ProfileColorContext";
import { getUserInventory } from "@/lib/actions/inventory.actions";
import { getRanks } from "@/lib/actions/rank.actions";
import { serializeForClient } from "@/lib/utils";
import BadgesSidebar from "@/components/Dashboard/BadgesSidebar";

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const dict = await getDictionary((lang || 'en') as "en" | "id");

    // Parallel fetching for performance
    const [user, activities, trendingPosts, inventoryData, ranks] = await Promise.all([
        getUserByEmail(session.user.email),
        getRecentActivities(session.user.id),
        getTrendingPosts(),
        session.user.id ? getUserInventory(session.user.id) : null,
        getRanks()
    ]);

    if (!user) {
        redirect("/login");
    }

    // Fetch Saved Projects
    const bookmarkedProjects = await getBookmarkedProjects(user._id);

    // Normalize Saved Projects to Activity format
    const savedActivities: Activity[] = bookmarkedProjects.map((item: any) => {
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

    const uniqueSavedActivities = Array.from(new Map(savedActivities.map((item: any) => [item.id, item])).values());

    // Sanitize data to prevent serialization errors
    const safeUser = serializeForClient(user);
    const safeTrendingPosts = serializeForClient(trendingPosts);

    return (
        <ProfileColorProvider initialColor={safeUser.profileColor}>
            <div className="min-h-screen bg-dots-pattern pt-28 pb-10">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Left Sidebar - User Profile & Nav */}
                        <div className="hidden lg:block lg:col-span-1">
                            <DashboardSidebar user={safeUser} dict={dict} ranks={ranks} />
                        </div>

                        {/* Middle - Activity Feed Area with Tabs */}
                        <div className="lg:col-span-2">
                            <ActivityArea
                                user={safeUser}
                                activities={activities}
                                savedActivities={uniqueSavedActivities as Activity[]}
                                inventoryData={inventoryData as any}
                                dict={dict}
                                isOwner={true}
                                dbUserId={session.user.id}
                            />
                        </div>

                        {/* Right Sidebar - Trending / Suggestions */}
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="space-y-6">
                                <BadgesSidebar user={safeUser} isOwner={true} dict={dict} />
                                <PortfolioWidget user={safeUser} dict={dict} />
                                <TrendingSidebar posts={safeTrendingPosts} dict={dict} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProfileColorProvider>
    );
}
