import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PortfolioEditor from "@/components/Portfolio/PortfolioEditor";
import { getPortfolioConfig } from "@/lib/actions/portfolio.actions";
import { getUserByEmail } from "@/lib/actions/user.actions";

export default async function PortfolioEditorPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/auth/signin");

    const user = await getUserByEmail(session.user.email);
    if (!user) redirect("/auth/signin");

    // Fetch config
    const config = await getPortfolioConfig(user.id);

    // Check if they own the item? (Ideally yes, but let's let the editor handle the state or just check here)
    // For now we assume they can access the page but saving might fail if not purchased, 
    // OR we show a locking screen. 
    // But since I didn't implement the locking screen component yet, let's just show the editor.
    // The Update action checks ownership.

    // Serialize user to avoid Date object issues in client component
    const safeUser = JSON.parse(JSON.stringify(user));

    return (
        <div className="min-h-screen bg-[#020617] text-white pt-24 pb-12">
            <PortfolioEditor config={config} userId={user.id} user={safeUser} />
        </div>
    );
}
