import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/get-dictionary";
import { getUserByEmail } from "@/lib/actions/user.actions";
import { serializeForClient } from "@/lib/utils";
import MessagingHub from "@/components/Messages/MessagingHub";

export default async function MessagesPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const dict = await getDictionary((lang || 'en') as "en" | "id");
    const user = await getUserByEmail(session.user.email);

    if (!user) {
        redirect("/login");
    }

    const safeUser = serializeForClient(user);

    return (
        <div className="min-h-screen bg-dots-pattern pt-28 pb-10">
            <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                <MessagingHub user={safeUser} dict={dict} />
            </div>
        </div>
    );
}
