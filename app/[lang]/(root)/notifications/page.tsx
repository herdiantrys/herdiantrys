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
                            <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-slate-200/70 dark:border-white/10 shadow-xl dark:shadow-none transition-colors mb-6">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-[var(--glass-text)] mb-2">{dict?.notifications_messages?.page_title || "Notifications"}</h1>
                                <p className="text-slate-500 dark:text-[var(--glass-text-muted)]">{dict?.notifications_messages?.page_desc || "Stay updated with your latest interactions."}</p>
                            </div>

                            <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-slate-200/70 dark:border-white/10 shadow-xl dark:shadow-none transition-colors">
                                <NotificationList initialNotifications={notifications} userId={user._id} dict={dict} />
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
