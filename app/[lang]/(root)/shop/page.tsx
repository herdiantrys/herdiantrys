import { getDictionary } from "@/get-dictionary";
import { Sparkles, ShoppingBag, Coins } from "lucide-react";
import { getShopItems, seedShopItems } from "@/lib/actions/shop.actions";
import { auth } from "@/auth";
import { getUserByEmail } from "@/lib/actions/user.actions";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";
import ShopGrid from "@/components/Shop/ShopGrid";

export default async function ShopPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { lang: langParam } = await params;
    const { session_id } = await searchParams;

    // Verify Stripe Payment if session_id is present
    if (session_id && typeof session_id === 'string') {
        const { verifyStripeSession } = await import("@/lib/actions/stripe.actions");
        await verifyStripeSession(session_id);
    }

    const lang = (langParam || 'en') as "en" | "id";
    const dict = await getDictionary(lang);
    const session = await auth();

    // Fetch from Prisma
    const effects = await getShopItems();

    // Check for Shop Completion Achievement (Catch-up for legacy users)
    if (session?.user?.id) {
        const { trackShopCompletion } = await import("@/lib/actions/gamification.actions");
        trackShopCompletion(session.user.id).catch(err => console.error("Recheck Error:", err));
    }

    // Fetch Logged In User Data
    let user = null;
    if (session?.user?.email) {
        // Fetch from Prisma Source of Truth
        // mapped to the shape expected by the UI (points, inventory)
        const dbUser = await getUserByEmail(session.user.email);
        if (dbUser) {
            user = {
                ...dbUser,
            };
        }
    }

    return (
        <main className="min-h-screen pt-28 pb-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass bg-white/5 border border-purple-500/30 text-purple-400 mb-6">
                        <ShoppingBag size={16} />
                        <span className="text-sm font-medium tracking-wide uppercase">Profile Shop</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
                        Customize Your Look
                    </h1>
                    <p className="text-xl text-[var(--glass-text-muted)] max-w-2xl mx-auto">
                        Spend your hard-earned points on exclusive profile effects and frames. Stand out from the crowd!
                        <br />
                        <span className="text-amber-400 font-bold mt-2 block">
                            Your Balance: {user?.points || 0} Points
                        </span>
                    </p>
                </div>

                <ShopGrid
                    items={effects}
                    userPoints={user?.points || 0}
                    userInventory={(user as any)?.inventory || []}
                    userId={user?._id}
                    username={user?.username}
                />
            </div>
        </main>
    );
}
