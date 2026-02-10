"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, LayoutGrid, TrendingUp, User2, FileText } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import ActivityCard from "@/components/Dashboard/ActivityCard";
import UserCard from "@/components/Search/UserCard";
import { globalSearch, SearchResults } from "@/lib/actions/search.actions";

// Tabs configuration matching shop page
const TABS = [
    { id: "all", label: "All", icon: LayoutGrid },
    { id: "works", label: "Works", icon: TrendingUp },
    { id: "posts", label: "Posts", icon: FileText },
    { id: "users", label: "Users", icon: User2 },
];

export default function SearchPageClient({ dict, userId }: { dict: any; userId?: string }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const initialQuery = searchParams.get("q") || "";

    const [query, setQuery] = useState(initialQuery);
    const [activeTab, setActiveTab] = useState("all");
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResults>({ users: [], projects: [], posts: [] });
    const [hasSearched, setHasSearched] = useState(false);

    // Sync input with URL param
    useEffect(() => {
        const q = searchParams.get("q");
        if (q) {
            setQuery(q);
            performSearch(q);
        } else {
            setResults({ users: [], projects: [], posts: [] });
            setHasSearched(false);
        }
    }, [searchParams]);

    const performSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        try {
            const data = await globalSearch(searchQuery);

            const transformedPosts = data.posts.map(post => {
                if (!post.author) return null;
                return {
                    id: `post-${post.id}`,
                    type: 'user_post',
                    timestamp: post.createdAt,
                    actor: {
                        name: post.author.name || 'Unknown',
                        username: post.author.username || 'unknown',
                        image: post.author.imageURL || post.author.image,
                        equippedEffect: post.author.equippedEffect
                    },
                    details: {
                        description: post.text,
                        image: post.image,
                        video: post.video
                    },
                    likesCount: post._count?.likedBy || 0,
                    commentsCount: post._count?.comments || 0,
                    isLiked: false,
                    isBookmarked: false
                };
            }).filter(Boolean);

            setResults({
                users: data.users,
                projects: data.projects,
                posts: transformedPosts
            });
            setHasSearched(true);
        } catch (error) {
            console.error("Search failed:", error);
            setResults({ users: [], projects: [], posts: [] });
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            const pathParts = pathname.split('/').filter(Boolean);
            const lang = (pathParts[0] === 'en' || pathParts[0] === 'id') ? pathParts[0] : 'en';
            router.push(`/${lang}/search?q=${encodeURIComponent(query)}`);
        }
    };

    const getFilteredResults = () => {
        switch (activeTab) {
            case "works": return { ...results, users: [], posts: [] };
            case "posts": return { ...results, users: [], projects: [] };
            case "users": return { ...results, projects: [], posts: [] };
            default: return results;
        }
    };

    const filtered = getFilteredResults();
    const hasResults = filtered.users.length > 0 || filtered.projects.length > 0 || filtered.posts.length > 0;

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 sm:mb-12 pt-16 sm:pt-0"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 px-16 sm:px-4">
                        <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                            Search & Discover
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
                        Find creative works, inspiring posts, and talented creators
                    </p>
                </motion.div>

                {/* Search Input */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-3xl mx-auto mb-8 sm:mb-10"
                >
                    <form onSubmit={handleSearchSubmit} className="relative group">
                        {/* Glow on focus */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-2xl opacity-0 group-focus-within:opacity-20 blur-xl transition-all duration-500" />

                        <div className="relative flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-1.5 sm:p-2 transition-all duration-300 group-focus-within:border-teal-500/50 group-focus-within:shadow-2xl">
                            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shrink-0">
                                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>

                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search..."
                                className="flex-1 px-2 sm:px-3 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                autoFocus
                            />

                            <motion.button
                                type="submit"
                                disabled={!query.trim() || isLoading}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm sm:text-base font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden shrink-0"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Searching
                                        </>
                                    ) : (
                                        'Search'
                                    )}
                                </span>
                            </motion.button>
                        </div>
                    </form>

                    {/* Quick search suggestions */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-2"
                    >
                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                            Popular:
                        </span>
                        {['design', 'illustration', 'photography', 'web development'].map((tag, i) => (
                            <motion.button
                                key={tag}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                whileHover={{ scale: 1.05, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setQuery(tag);
                                    performSearch(tag);
                                }}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 hover:from-teal-500/20 hover:to-cyan-500/20 dark:from-teal-500/20 dark:to-cyan-500/20 dark:hover:from-teal-500/30 dark:hover:to-cyan-500/30 text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-500/30 hover:border-teal-300 dark:hover:border-teal-400 transition-all shadow-sm hover:shadow-md"
                            >
                                {tag}
                            </motion.button>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Shop-style Tabs */}
                <AnimatePresence>
                    {hasSearched && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-wrap gap-2 justify-center mb-10"
                        >
                            <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                                                ${isActive ? "text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/5"}
                                            `}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeSearchTab"
                                                    className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="relative z-10 flex items-center gap-2">
                                                <Icon size={16} />
                                                {tab.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Content */}
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-32"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-teal-500 rounded-full mb-6"
                                />
                                <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                                    Searching...
                                </p>
                            </motion.div>
                        ) : !hasSearched ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-32"
                            >
                                <Search className="w-20 h-20 mx-auto mb-6 text-gray-300 dark:text-gray-700" />
                                <p className="text-xl font-medium text-gray-500 dark:text-gray-400">
                                    Start typing to search
                                </p>
                            </motion.div>
                        ) : !hasResults ? (
                            <motion.div
                                key="no-results"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-32"
                            >
                                <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-xl border border-gray-200 dark:border-gray-800">
                                    <div className="text-5xl mb-4">🔍</div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        No Results Found
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Try different keywords or check the suggestions above
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-16"
                            >
                                {/* Users Section */}
                                {filtered.users.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                                                <User2 className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Users
                                            </h2>
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                                {filtered.users.length}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filtered.users.map((user, i) => (
                                                <motion.div
                                                    key={user.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <UserCard user={user} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Works Section */}
                                {filtered.projects.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                                                <TrendingUp className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Works
                                            </h2>
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                                {filtered.projects.length}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {filtered.projects.map((project: any, i) => (
                                                <motion.div
                                                    key={project.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <ProjectCard
                                                        project={{
                                                            ...project,
                                                            thumbnail: project.image,
                                                            slug: project.slug,
                                                            category: project.category?.title,
                                                            type: typeof project.type === 'string' ? project.type.toLowerCase() : 'image',
                                                            uploadDate: project.uploadDate || new Date().toISOString(),
                                                            views: project.views || 0,
                                                            likes: project._count?.likedBy || 0,
                                                            comments: project._count?.comments || 0
                                                        }}
                                                        onClick={() => router.push(`/projects/${project.slug}`)}
                                                    />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Posts Section */}
                                {filtered.posts.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                                                <FileText className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Posts
                                            </h2>
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                                {filtered.posts.length}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {filtered.posts.map((post: any, i) => (
                                                <motion.div
                                                    key={post.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="bg-white dark:bg-gray-900 rounded-2xl p-1 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow"
                                                >
                                                    <ActivityCard
                                                        activity={post}
                                                        userId={userId || ""}
                                                        dbUserId={userId || ""}
                                                        initialIsBookmarked={false}
                                                        currentUser={null}
                                                        t={dict?.dashboard || {}}
                                                        isSinglePostView={false}
                                                        initialShowComments={false}
                                                    />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
