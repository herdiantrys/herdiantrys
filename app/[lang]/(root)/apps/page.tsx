import { getDictionary } from "@/get-dictionary";
import { Sparkles, Instagram } from "lucide-react";
import Link from "next/link";

export default async function AppsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: langParam } = await params;
    const lang = (langParam || 'en') as "en" | "id";
    const dict = await getDictionary(lang);

    return (
        <main className="min-h-screen pt-28 pb-12 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass bg-white/5 border border-teal-500/30 text-teal-400 mb-6">
                        <Sparkles size={16} />
                        <span className="text-sm font-medium tracking-wide uppercase">Coming Soon</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                        Our Apps
                    </h1>
                    <p className="text-xl text-[var(--glass-text-muted)] max-w-2xl mx-auto">
                        Explore our collection of powerful applications designed to enhance your digital experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                    {/* Instagram Analyzer Card */}
                    <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/20 dark:border-white/10 shadow-lg flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-pink-500/20 flex items-center justify-center text-white">
                            <Instagram size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--glass-text)] mb-2">Instagram Analyzer</h3>
                        <p className="text-sm text-[var(--glass-text-muted)] mb-6">
                            Analyze any public Instagram profile instantly. Get follower stats, engagement info, and more.
                        </p>
                        <Link href="/apps/instagram-analyzer" className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-pink-500/25 transition-all">
                            Open App
                        </Link>
                    </div>

                    {/* Placeholder Cards */}
                    {[1, 2].map((item) => (
                        <div key={item} className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/20 dark:border-white/10 shadow-lg flex flex-col items-center text-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-6 shadow-lg shadow-teal-500/20"></div>
                            <h3 className="text-xl font-bold text-[var(--glass-text)] mb-2">Coming Soon</h3>
                            <p className="text-sm text-[var(--glass-text-muted)] mb-6">
                                More powerful tools are under development. Stay tuned for updates!
                            </p>
                            <button disabled className="px-6 py-2 rounded-xl bg-white/10 border border-white/10 text-[var(--glass-text)] cursor-not-allowed font-medium">
                                Locked
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
