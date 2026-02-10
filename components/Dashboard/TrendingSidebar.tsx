"use client";

import Link from "next/link";
import { TrendingPost } from "@/lib/actions/trending.actions";
import { Flame, Heart, MessageSquare } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";

export default function TrendingSidebar({ posts, dict }: { posts: TrendingPost[], dict?: any }) {
    const t = dict?.dashboard || {};
    return (
        <div className="sticky top-28 space-y-6">
            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-md border border-white/10 dark:border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                    <Flame className="text-orange-500 fill-orange-500 animate-pulse" />
                    <h3 className="font-bold text-[var(--glass-text)] text-lg">{t.trending_posts || "Trending Posts"}</h3>
                </div>

                <div className="space-y-6">
                    {posts.length > 0 ? posts.map((post, index) => (
                        <Link
                            href={`/post/${post.id}`}
                            key={post.id}
                            className="flex gap-4 group"
                        >
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                                {post.image ? (
                                    <img
                                        src={urlFor(post.image).width(100).url()}
                                        alt="Post content"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-teal-500/10 text-teal-500 font-bold text-xs uppercase">
                                        {post.author.name ? post.author.name.substring(0, 2) : "PO"}
                                    </div>
                                )}
                                <div className="absolute top-0 left-0 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg backdrop-blur-sm">
                                    #{index + 1}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-[var(--glass-text)] text-sm line-clamp-2 group-hover:text-teal-400 transition-colors">
                                    {post.excerpt}
                                </h4>
                                <p className="text-xs text-[var(--glass-text-muted)] mt-1 mb-2 truncate">
                                    {t.by || "by"} {post.author.name}
                                </p>

                                <div className="flex items-center gap-3 text-[10px] text-[var(--glass-text-muted)]">
                                    <span className="flex items-center gap-1">
                                        <Heart size={10} /> {post.stats.likes}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageSquare size={10} /> {post.stats.comments}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <p className="text-sm text-[var(--glass-text-muted)] text-center py-4">{t.no_trending || "No trending posts yet."}</p>
                    )}
                </div>
            </div>

            <div className="bg-gradient-to-br from-teal-500/20 to-cyan-600/20 backdrop-blur-md border border-teal-500/20 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl group-hover:bg-teal-500/30 transition-colors" />

                <h3 className="font-bold text-teal-400 mb-2 relative z-10">{t.creator_spotlight || "Creator Spotlight"}</h3>
                <p className="text-sm text-[var(--glass-text-muted)] relative z-10">
                    {t.creator_tip || "Consistent uploads boost your visibility by 40%. Keep creating!"}
                </p>
            </div>
        </div>
    );
}
