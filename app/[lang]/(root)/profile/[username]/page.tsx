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
import ActivityArea from "@/components/Dashboard/ActivityArea";
import { getUserInventory } from "@/lib/actions/inventory.actions";
import { getDictionary } from "@/get-dictionary";
import { ProfileColorProvider } from "@/components/Profile/ProfileColorContext";


export default async function UserProfilePage({ params }: { params: Promise<{ lang: string; username: string }> }) {
    const { lang, username } = await params;
    const session = await auth();
    const dict = await getDictionary((lang || 'en') as "en" | "id");

    const [user, trendingPosts] = await Promise.all([
        getUserByUsername(username),
        getTrendingPosts()
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

    const isOwner = session?.user?.email === user.email || (loggedInUserId && loggedInUserId === user._id);

    // Fetch activities and inventory in parallel
    const [activities, inventoryData] = await Promise.all([
        getUserActivities(username, loggedInUserId),
        getUserInventory(user._id)
    ]);

    // Sanitize data
    const safeUser = user ? JSON.parse(JSON.stringify(user)) : null;
    const safeLoggedInUser = loggedInUser ? JSON.parse(JSON.stringify(loggedInUser)) : null;

    return (
        <ProfileColorProvider initialColor={user.profileColor || null}>
            <div className="min-h-screen bg-dots-pattern pb-10 relative">
                <UserBanner user={user} isOwner={isOwner || false} />

                <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-[200px] md:pt-[400px]">

                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--glass-text-muted)] hover:text-teal-400 mb-6 transition-colors lg:hidden">
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Sidebar - Profile Info */}
                        <div className="lg:col-span-1">
                            <DashboardSidebar user={user} isPublic={!isOwner} dict={dict} />
                        </div>

                        {/* Middle - User Activity Feed Area with Tabs */}
                        <div className="lg:col-span-2">
                            <ActivityArea
                                user={safeLoggedInUser || safeUser} // Pass logged in user for actions, or profile user if guest (read-only mostly)
                                profileUser={safeUser}
                                activities={activities}
                                inventoryData={inventoryData}
                                dict={dict}
                                isOwner={isOwner}
                                dbUserId={loggedInUserId}
                            />
                        </div>

                        {/* Right Sidebar - Trending */}
                        <div className="hidden lg:block lg:col-span-1">
                            <TrendingSidebar posts={trendingPosts} dict={dict} />
                        </div>
                    </div>
                </div>
            </div>
        </ProfileColorProvider>
    );
}
