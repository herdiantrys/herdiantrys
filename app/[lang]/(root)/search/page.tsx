
import SearchPageClient from "@/components/Search/SearchPageClient";
import { auth } from "@/auth";
import { getDictionary } from "@/get-dictionary";

export default async function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const session = await auth();
    const dict = await getDictionary((lang || "en") as "en" | "id");

    return (
        <main className="min-h-screen pt-24 bg-dots-pattern relative">
            <div className="absolute inset-0 bg-zinc-900/5 dark:bg-black/20 pointer-events-none" />
            <SearchPageClient
                dict={dict}
                userId={session?.user?.id}
            />
        </main>
    );
}
