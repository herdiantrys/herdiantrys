import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PortfolioEditor from "@/components/Portfolio/PortfolioEditor";
import { getPortfolioConfig } from "@/lib/actions/portfolio.actions";
import { getUserByEmail } from "@/lib/actions/user.actions";
import prisma from "@/lib/prisma";
import { serializeForClient } from "@/lib/utils";

export default async function PortfolioEditorPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/auth/signin");

    const user = await getUserByEmail(session.user.email);
    if (!user) redirect("/auth/signin");

    // Fetch config
    const config = await getPortfolioConfig(user.id);

    // Check if they own the item
    const hasPortfolioItem = user.inventory?.some((item: any) => item.shopItem?.type === 'SAAS_TEMPLATE');

    if (!hasPortfolioItem) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl max-w-md space-y-4">
                    <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold">Access Restricted</h1>
                    <p className="text-gray-400">
                        You need to purchase the <span className="text-teal-400 font-semibold">Professional Portfolio Template</span> to access this feature.
                    </p>
                    <a href="/shop" className="inline-block px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors">
                        Go to Shop
                    </a>
                </div>
            </div>
        );
    }

    // Serialize user to avoid Date object issues in client component
    const safeUser = serializeForClient(user);

    // Fetch projects for preview
    const projects = await prisma.project.findMany({
        where: {
            authorId: user.id,
            status: 'PUBLISHED',
            isArchived: false,
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            image: true,
            createdAt: true
        },
        take: 6
    });

    return (
        <div className="min-h-screen bg-[#020617] text-white pt-24 pb-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-2">Portfolio Editor</h1>
                <p className="text-gray-400 mb-8">Customize your personal landing page.</p>
                <PortfolioEditor
                    userId={user.id}
                    username={user.username || ""}
                    initialConfig={config}
                    user={safeUser}
                    projects={projects}
                />
            </div>
        </div>
    );
}
