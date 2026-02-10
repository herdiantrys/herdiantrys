"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import ActivityCard from "@/components/Dashboard/ActivityCard";
import UserCard from "@/components/Search/UserCard";
import { globalSearch, SearchResults } from "@/lib/actions/search.actions";

// Tabs configuration
const TABS = [
    { id: "all", label: "All" },
    { id: "works", label: "Works" },
    { id: "posts", label: "Posts" },
    { id: "users", label: "Users" },
];

export default function SearchPageClient({ dict, userId }: { dict: any; userId?: string }) {
    const searchParams = useSearchParams();
    const router = useRouter();
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
            // Transform posts to match ActivityCard expected format
            const transformedPosts = data.posts.map(post => {
                // Ensure author exists to prevent crashes
                if (!post.author) {
                    return null;
                }

                return {
                    id: `post-${post.id}`, // Prefix ID to ensure ActivityCard treats it correctly if needed, or keeping it unique
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
                    // These would need current user context to be accurate, setting defaults for now
                    isLiked: false,
                    isBookmarked: false
                };
            }).filter(Boolean); // Filter out any null posts

            // Transform projects for ProjectCard
            // Note: ProjectCard expects specific shape, we might need to adapt or ensure data matches

            setResults({
                users: data.users,
                projects: data.projects,
                posts: transformedPosts
            });
            setHasSearched(true);
        } catch (error) {
            console.error("Search failed", error);
            setResults({ users: [], projects: [], posts: [] }); // Clear results on error
            setHasSearched(true); // Ensure we show "No results" or state update instead of blank
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    // Filter results based on active tab
    const getFilteredResults = () => {
        switch (activeTab) {
            case "works":
                return { ...results, users: [], posts: [] };
            case "posts":
                return { ...results, users: [], projects: [] };
            case "users":
                return { ...results, projects: [], posts: [] };
            default:
                return results;
        }
    };

    const filtered = getFilteredResults();
    const hasResults = filtered.users.length > 0 || filtered.projects.length > 0 || filtered.posts.length > 0;

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">

            {/* Search Header */}
            <div className="max-w-3xl mx-auto mb-8">
                <form onSubmit={handleSearchSubmit} className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-teal-500 transition-colors" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for works, posts, or users..."
                        className="w-full pl-12 pr-4 py-4 rounded-full bg-white/5 border border-white/10 focus:border-teal-500/50 outline-none text-lg text-white placeholder:text-zinc-500 shadow-xl backdrop-blur-sm transition-all"
                        autoFocus
                    />
                    {isLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                        </div>
                    )}
                </form>

                {/* Tabs */}
                {hasSearched && (
                    <div className="flex items-center justify-center gap-2 mt-6 overflow-x-auto pb-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    px-6 py-2 rounded-full text-sm font-medium transition-all
                                    ${activeTab === tab.id
                                        ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                                        : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                                    }
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Results Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4" />
                    <p className="text-zinc-500">Searching the universe...</p>
                </div>
            ) : !hasSearched && !query ? (
                <div className="text-center py-20 text-zinc-500">
                    Type something to start searching
                </div>
            ) : !hasResults && hasSearched ? (
                <div className="text-center py-20">
                    <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                    <p className="text-zinc-400">Try adjusting your search query</p>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Users Section */}
                    {filtered.users.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                Users <span className="text-sm font-normal text-zinc-500">({filtered.users.length})</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filtered.users.map((user) => (
                                    <UserCard key={user.id} user={user} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Works Section */}
                    {filtered.projects.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                Works <span className="text-sm font-normal text-zinc-500">({filtered.projects.length})</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.projects.map((project: any) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={{
                                            ...project,
                                            thumbnail: project.image, // Map Prisma image to thumbnail
                                            // Ensure other required props for ProjectCard are present
                                            // Assuming ProjectCard can handle typical Prisma project shape or mapped shape
                                            slug: project.slug,
                                            category: project.category?.title,
                                            type: typeof project.type === 'string' ? project.type.toLowerCase() : 'image', // Handle mapping from UPPERCASE enum
                                            // Add dummy values for required fields not in search select
                                            uploadDate: project.uploadDate || new Date().toISOString(),
                                            views: project.views || 0,
                                            likes: project._count?.likedBy || 0,
                                            comments: project._count?.comments || 0
                                        }}
                                        onClick={() => router.push(`/projects/${project.slug}`)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Posts Section */}
                    {filtered.posts.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                Posts <span className="text-sm font-normal text-zinc-500">({filtered.posts.length})</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filtered.posts.map((post: any) => (
                                    <div key={post.id} className="bg-white/5 rounded-2xl p-1 border border-white/10">
                                        <ActivityCard
                                            activity={post}
                                            userId={userId || ""} // Current User ID needed for actions, pass empty if guest
                                            dbUserId={userId || ""}
                                            initialIsBookmarked={false} // Would need real state
                                            currentUser={null} // Pass null if guest
                                            t={dict?.dashboard || {}}
                                            isSinglePostView={false}
                                            initialShowComments={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
