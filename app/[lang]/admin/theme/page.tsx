"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminThemeClient from "@/components/Admin/AdminThemeClient";
import { getGlobalTheme } from "@/lib/actions/settings.actions";

export default async function AdminThemePage({ params }: { params: Promise<{ lang: string }> }) {
    const session = await auth();
    const { lang } = await params;

    // Strict SUPER_ADMIN check
    if (!session || session.user.role !== "SUPER_ADMIN") {
        redirect(`/${lang}/dashboard`);
    }

    const theme = await getGlobalTheme();

    return (
        <main className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-[1600px]">
                <AdminThemeClient initialTheme={theme} />
            </div>
        </main>
    );
}
