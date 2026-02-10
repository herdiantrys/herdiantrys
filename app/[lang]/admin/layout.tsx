import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppLayoutAdapter from "@/components/AppLayoutAdapter";
import { getDictionary } from "@/get-dictionary";

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary((lang || 'en') as "en" | "id");
    const session = await auth();

    // Secure Role Check
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    return (
        <AppLayoutAdapter dict={dict}>
            <div className="container mx-auto px-4 pb-8 pt-24">
                {children}
            </div>
        </AppLayoutAdapter>
    );
}
