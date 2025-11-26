import GlassContact from "@/components/GlassContact";
import { getProfile } from "@/lib/sanityProfile";

export default async function ContactPage() {
    const profile = await getProfile();

    return (
        <main className="min-h-screen relative overflow-hidden pt-24">
            <div className="container mx-auto px-4">
                <GlassContact profile={profile} />
            </div>
        </main>
    );
}
