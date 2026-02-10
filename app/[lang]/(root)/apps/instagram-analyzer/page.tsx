"use client";

import { useState } from "react";
import { Search, Instagram, Users, UserPlus, Grid, ExternalLink, Loader2, AlertCircle, Heart, MessageCircle, TrendingUp } from "lucide-react";
import { analyzeInstagramUser } from "@/lib/actions/instagram.actions";
import { motion, AnimatePresence } from "framer-motion";

export default function InstagramAnalyzerPage() {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await analyzeInstagramUser(username);
            if (data.success) {
                setResult(data.data);
            } else {
                setError(data.error || "Failed to fetch profile");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-12 container mx-auto px-4 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 mb-6 shadow-lg shadow-pink-500/10">
                    <Instagram size={40} className="text-pink-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-4">
                    Instagram Analyzer
                </h1>
                <p className="text-[var(--glass-text-muted)] text-lg max-w-2xl mx-auto">
                    Get detailed insights about any public Instagram profile instantly.
                </p>
            </div>

            {/* Search Input */}
            <div className="max-w-xl mx-auto mb-16 relative z-10">
                <form onSubmit={handleAnalyze} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 opacity-30 blur-lg rounded-2xl group-hover:opacity-50 transition-opacity" />
                    <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 overflow-hidden">
                        <Search className="ml-4 text-[var(--glass-text-muted)]" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter Instagram Username (e.g. taylorswift)"
                            className="w-full bg-transparent border-none outline-none text-[var(--glass-text)] placeholder-[var(--glass-text-muted)] px-4 py-3 text-lg"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !username}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-pink-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Analyze"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            <div className="relative min-h-[400px]">
                {/* Initial State / Placeholder */}
                {!result && !isLoading && !error && (
                    <div className="text-center py-20 opacity-50">
                        <Grid size={64} className="mx-auto mb-4 text-[var(--glass-text-muted)]" />
                        <p className="text-[var(--glass-text-muted)]">Results will appear here</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-2xl flex items-center gap-4 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                        <AlertCircle size={24} />
                        <div>
                            <h3 className="font-bold">Error</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {/* Success Data */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {/* Banner/Header */}
                        <div className="h-48 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 relative">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
                        </div>

                        <div className="px-8 pb-8 relative -mt-20">
                            <div className="flex flex-col md:flex-row items-end md:items-end gap-6 mb-8">
                                {/* Profile Image */}
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-md opacity-75 animate-pulse"></div>
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black bg-gray-800 overflow-hidden relative z-10">
                                        <img
                                            src={result.profileImage || "/default-avatar.png"}
                                            alt={result.username}
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                // Fallback Chain
                                                if (!target.dataset.triedDicebear) {
                                                    // First failure: Try Initials Avatar
                                                    target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${result.username}&backgroundColor=be185d,db2777,7c3aed`;
                                                    target.dataset.triedDicebear = "true";
                                                } else {
                                                    // Second failure: Default Grey
                                                    target.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Names */}
                                <div className="flex-1 text-center md:text-left mb-2">
                                    <h2 className="text-3xl font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-3">
                                        {result.fullName}
                                        {(result.isSimulation || result.bio.includes("Simulation")) && (
                                            <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs rounded-full font-medium uppercase tracking-wide">
                                                Simulation Mode
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-xl text-[var(--glass-text-muted)] flex items-center justify-center md:justify-start gap-1">
                                        @{result.username}
                                        <a href={`https://instagram.com/${result.username}`} target="_blank" rel="noreferrer" className="text-pink-400 hover:text-pink-300 ml-2">
                                            <ExternalLink size={16} />
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Data Source Badge */}
                            <div className={`mb-6 p-3 rounded-xl border flex items-center gap-3 ${result.isSimulation ? "bg-amber-500/10 border-amber-500/20 text-amber-200" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"}`}>
                                {result.isSimulation ? (
                                    <>
                                        <AlertCircle size={20} className="text-amber-500" />
                                        <div className="text-sm">
                                            <strong>Simulation Mode Active:</strong> Data is estimated based on industry standards because the public profile is restricted.
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp size={20} className="text-emerald-500" />
                                        <div className="text-sm">
                                            <strong>Real-Time Data:</strong> Analytics are calculated live from the latest public posts.
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Stats Grid */}
                            {/* Stats Grid 1: Basin Info */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <StatCard icon={<Users className="text-blue-400" />} value={result.followers} label="Followers" />
                                <StatCard icon={<UserPlus className="text-green-400" />} value={result.following} label="Following" />
                                <StatCard icon={<Grid className="text-pink-400" />} value={result.posts} label="Posts" />
                            </div>

                            {/* Stats Grid 2: Engagement (New) */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <StatCard icon={<Heart className="text-red-500" />} value={result.avgLikes || "N/A"} label="Avg. Likes" />
                                <StatCard icon={<MessageCircle className="text-indigo-400" />} value={result.avgComments || "N/A"} label="Avg. Comments" />
                                <StatCard
                                    icon={<TrendingUp className="text-yellow-400" />}
                                    value={result.engagementRate || "N/A"}
                                    label="Engagement Rate"
                                    highlight={true}
                                />
                            </div>

                            {/* Bio */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                <h3 className="text-sm font-bold text-[var(--glass-text-muted)] uppercase tracking-wider mb-2">Bio</h3>
                                <p className="text-[var(--glass-text)] text-lg whitespace-pre-wrap leading-relaxed">
                                    {result.bio}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, value, label, highlight = false }: { icon: any, value: string, label: string, highlight?: boolean }) {
    return (
        <div className={`bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors ${highlight ? "bg-white/10 border-yellow-500/30" : ""}`}>
            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-white/5 mb-2">
                {icon}
            </div>
            <div className={`text-2xl font-bold mb-1 ${highlight ? "text-yellow-400" : "text-[var(--glass-text)]"}`}>{value}</div>
            <div className="text-xs text-[var(--glass-text-muted)] uppercase tracking-wide">{label}</div>
        </div>
    );
}
