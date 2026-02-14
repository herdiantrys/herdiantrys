import { auth } from "@/auth";
import { getDictionary } from "@/get-dictionary";
import { redirect } from "next/navigation";
import { getNotifications } from "@/lib/actions/notification.actions";
import { getUserByEmail } from "@/lib/actions/user.actions";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import TrendingSidebar from "@/components/Dashboard/TrendingSidebar";
import { getTrendingPosts } from "@/lib/actions/trending.actions";
import NotificationList from "@/components/Notification/NotificationList";
import { ProfileColorProvider } from "@/components/Profile/ProfileColorContext";
import { getRanks } from "@/lib/actions/rank.actions";

export default async function NotificationsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const dict = await getDictionary((lang || 'en') as "en" | "id");

    // Parallel fetching
    const [user, notifications, trendingPosts, ranks] = await Promise.all([
        getUserByEmail(session.user.email),
        getNotifications(session.user.id || ""),
        getTrendingPosts(),
        getRanks()
    ]);

    if (!user) redirect("/login");

    return (
        <ProfileColorProvider initialColor={user.profileColor || null}>
            <div className="min-h-screen bg-dots-pattern pt-28 pb-10">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Left Sidebar */}
                        <div className="lg:col-span-1">
                            <DashboardSidebar user={user} dict={dict} ranks={ranks} />
                        </div>

                        {/* Middle - Notifications List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/5 mb-6">
                                <h1 className="text-2xl font-bold text-[var(--glass-text)] mb-2">Notifications</h1>
                                <p className="text-[var(--glass-text-muted)]">Stay updated with your latest interactions.</p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/5">
                                <NotificationList initialNotifications={notifications} userId={user._id} />
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="hidden lg:block lg:col-span-1">
                            <TrendingSidebar posts={trendingPosts} dict={dict} />
                        </div>
                    </div>
                </div>
            </div>
        </ProfileColorProvider>
    );
}
