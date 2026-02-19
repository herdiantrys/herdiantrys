import { notFound } from "next/navigation";
import { getUserByUsername, getUserByEmail } from "@/lib/actions/user.actions";
import { getPortfolioConfig, getPortfolioProjects } from "@/lib/actions/portfolio.actions";
import PortfolioPreview from "@/components/Portfolio/PortfolioPreview";
import { auth } from "@/auth";
import Link from "next/link";
import { EyeOff, Settings } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; username: string }> }) {
    const { username } = await params;
    const user = await getUserByUsername(username);

    if (!user) {
        return {
            title: "User Not Found",
        };
    }

    return {
        title: `${user.name} - Portfolio`,
        description: user.headline || `Check out ${user.name}'s portfolio on our platform.`,
    };
}

export default async function PortfolioPage({ params }: { params: Promise<{ lang: string; username: string }> }) {
    const { lang, username } = await params;
    const session = await auth();

    const user = await getUserByUsername(username);
    if (!user) {
        return notFound();
    }

    const portfolioConfig = await getPortfolioConfig(user.id);

    // Determine if viewer is the owner
    let isOwner = false;
    if (session?.user?.email) {
        const loggedInUser = await getUserByEmail(session.user.email);
        isOwner = loggedInUser?.id === user.id;
    }

    // If portfolio is disabled, it shouldn't be publicly viewable, EXCEPT by the owner
    if (!portfolioConfig?.isEnabled && !isOwner) {
        return notFound();
    }

    const projects = await getPortfolioProjects(user.id);

    return (
        <div className="relative">
            {!portfolioConfig?.isEnabled && isOwner && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500/10 backdrop-blur-md border-b border-yellow-500/20 px-4 py-2 flex items-center justify-center gap-4 text-yellow-500 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <EyeOff size={16} />
                        <span>Preview Mode: This portfolio is currently hidden from the public.</span>
                    </div>
                    <Link
                        href="/dashboard/portfolio"
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors text-xs font-bold"
                    >
                        <Settings size={14} />
                        Enable in Editor
                    </Link>
                </div>
            )}
            <PortfolioPreview config={portfolioConfig} user={user} projects={projects} />
        </div>
    );
}
