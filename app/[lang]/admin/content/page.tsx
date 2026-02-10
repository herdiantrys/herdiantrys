import { auth } from "@/auth";
import { getSiteContent } from "@/lib/actions/content.actions";
import ContentManager from "@/components/Admin/ContentManager";
import { redirect } from "next/navigation";

export default async function AdminContentPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const content = await getSiteContent();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Portfolio Management
                </h1>
                <p className="text-[var(--glass-text-muted)] mt-2">
                    Manage your homepage content, bio, skills, and experience.
                </p>
            </div>

            <ContentManager initialData={content || {}} />
        </div>
    );
}
