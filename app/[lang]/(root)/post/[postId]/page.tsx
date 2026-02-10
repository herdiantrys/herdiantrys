
import { auth } from "@/auth";
import { getDictionary } from "@/get-dictionary";
import { redirect, notFound } from "next/navigation";
import { getUserByEmail } from "@/lib/actions/user.actions";
import { getPostById } from "@/lib/actions/post.actions";
import { getTrendingPosts } from "@/lib/actions/trending.actions";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import TrendingSidebar from "@/components/Dashboard/TrendingSidebar";
import ActivityCard from "@/components/Dashboard/ActivityCard";
import { Activity } from "@/lib/actions/activity.actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProfileColorProvider } from "@/components/Profile/ProfileColorContext";

export default async function SinglePostPage({ params }: { params: Promise<{ lang: string; postId: string }> }) {
    const { lang, postId } = await params;
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const dict = await getDictionary((lang || 'en') as "en" | "id");
    const t = dict?.dashboard || {};

    // Fetch data in parallel
    const [user, post, trendingPosts] = await Promise.all([
        getUserByEmail(session.user.email),
        getPostById(postId, session.user.id),
        getTrendingPosts()
    ]);

    if (!user) {
        redirect("/login");
    }

    if (!post) {
        notFound();
    }

    // Sanitize data to prevent serialization errors with Date objects
    const safeUser = JSON.parse(JSON.stringify(user));
    const safeTrendingPosts = JSON.parse(JSON.stringify(trendingPosts));
    // Post is used for Activity creation which handles dates manually, but safe to sanitize if needed.
    // We only pass specific fields from post to ActivityCard, so post itself doesn't need full sanitization 
    // BUT we pass `currentUser={user}` to ActivityCard, so that needs `safeUser`.

    // Transform Post to Activity format for the Card
    const activity: Activity = {
        id: `post-${post.id}`,
        type: "user_post",
        timestamp: post.createdAt.toISOString(),
        actor: {
            name: post.author.name || "Unknown",
            username: post.author.username || "unknown",
            image: post.author.imageURL || post.author.image,
            equippedEffect: post.author.equippedEffect || undefined
        },
        details: {
            description: post.text,
            image: post.image,
            video: post.video,
            title: undefined,
            slug: undefined
        },
        likesCount: post.likesCount,
        isLiked: post.isLiked,
        commentsCount: post.commentsCount
    };

    return (
        <ProfileColorProvider initialColor={safeUser.profileColor || null}>
            <div
                className="min-h-screen bg-dots-pattern pt-28 pb-10 transition-colors duration-500 relative"
                // @ts-ignore
                style={{ backgroundColor: post.author.profileColor || undefined }}
            >
                {post.author.profileColor && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/50 z-0 pointer-events-none transition-colors duration-500" />
                )}
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Sidebar */}
                        <div className="hidden lg:block lg:col-span-1">
                            <DashboardSidebar user={safeUser} dict={dict} />
                        </div>

                        {/* Middle Content */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Back Button */}
                            <div className="flex items-center gap-2 mb-4">
                                <Link
                                    href="/dashboard"
                                    className="p-2 rounded-full hover:bg-white/10 text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </Link>
                                <span className="text-lg font-bold text-[var(--glass-text)]">Post</span>
                            </div>

                            <ActivityCard
                                activity={activity}
                                userId={safeUser.id}
                                dbUserId={safeUser.id}
                                // @ts-ignore
                                initialIsBookmarked={post.isBookmarked}
                                currentUser={safeUser}
                                t={t}
                                isSinglePostView={true}
                                initialShowComments={true}
                            />
                        </div>

                        {/* Right Sidebar */}
                        <div className="hidden lg:block lg:col-span-1">
                            <TrendingSidebar posts={safeTrendingPosts} dict={dict} />
                        </div>
                    </div>
                </div>
            </div>
        </ProfileColorProvider>
    );
}
