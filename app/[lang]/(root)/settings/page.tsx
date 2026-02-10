
import { auth } from "@/auth";
import { getDictionary } from "@/get-dictionary";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import SettingsForm from "@/components/Settings/SettingsForm";
import { ProfileColorProvider } from "@/components/Profile/ProfileColorContext";

export default async function SettingsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const dict = await getDictionary((lang || 'en') as "en" | "id");

    const USER_QUERY = defineQuery(`
        *[_type == "user" && lower(email) == lower($email)][0] {
          _id,
          username,
          fullName,
          profileImage,
          imageURL,
          bookmarks,
          equippedEffect,
          stats,
          bio,
          headline,
          location,
          socialLinks,
          bannerImage,
          points,
          preferences
        }
    `);

    const user = await client.withConfig({ useCdn: false }).fetch(USER_QUERY, { email: session.user.email }, { cache: 'no-store' });

    return (
        <ProfileColorProvider initialColor={user.profileColor || null}>
            <div className="min-h-screen bg-dots-pattern pt-28 pb-10">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Left Sidebar */}
                        <div className="lg:col-span-1">
                            <DashboardSidebar user={user} />
                        </div>

                        {/* Middle - Settings Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/5 mb-6">
                                <h1 className="text-2xl font-bold text-[var(--glass-text)] mb-2">Settings</h1>
                                <p className="text-[var(--glass-text-muted)]">Manage your account preferences and privacy.</p>
                            </div>

                            <SettingsForm userId={user._id} initialPreferences={user.preferences} />
                        </div>
                    </div>
                </div>
            </div>
        </ProfileColorProvider>
    );
}
