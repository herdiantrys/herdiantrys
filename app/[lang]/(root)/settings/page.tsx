
import { auth } from "@/auth";
import { getDictionary } from "@/get-dictionary";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";
import LanguageSelector from "@/components/Settings/LanguageSelector";
import prisma from "@/lib/prisma";

import { ProfileColorProvider } from "@/components/Profile/ProfileColorContext";
import { getRanks } from "@/lib/actions/rank.actions";
import { getPortfolioConfig } from "@/lib/actions/portfolio.actions";
import SettingsClient from "@/components/Settings/SettingsClient";

export default async function SettingsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const dict = await getDictionary((lang || 'en') as "en" | "id");

    const USER_SANITY_QUERY = defineQuery(`
        *[_type == "user" && lower(email) == lower($email)][0] {
          _id,
          profileColor
        }
    `);

    const [sanityUser, prismaUser] = await Promise.all([
        client.withConfig({ useCdn: false }).fetch(USER_SANITY_QUERY, { email: session.user.email }, { cache: 'no-store' }),
        prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                headline: true,
                bio: true,
                location: true,
                website: true,
                preferences: true,
                lastUsernameChange: true,
                role: true,
                points: true,
                image: true
            }
        })
    ]);

    if (!prismaUser) {
        redirect("/login");
    }

    return (
        <ProfileColorProvider initialColor={sanityUser?.profileColor || null}>
            <div className="min-h-screen bg-dots-pattern pt-28 pb-20">
                <SettingsClient
                    user={prismaUser}
                    dict={dict}
                    currentLocale={lang}
                />
            </div>
        </ProfileColorProvider>
    );
}
