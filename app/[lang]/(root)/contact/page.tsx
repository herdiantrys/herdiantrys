import GlassContact from "@/components/GlassContact";
import { getProfile } from "@/lib/sanityProfile";
import { getDictionary } from "@/get-dictionary";

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const profile = await getProfile();
    const dict = await getDictionary(lang as "en" | "id");

    return (
        <main className="min-h-screen relative overflow-hidden pt-28">
            <div className="container mx-auto px-4">
                <GlassContact profile={profile} dict={dict} />
            </div>
        </main>
    );
}
