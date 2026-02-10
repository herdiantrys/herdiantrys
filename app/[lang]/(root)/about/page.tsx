import GlassAbout from "@/components/GlassAbout";
import { getProfile } from "@/lib/sanityProfile";
import { getDictionary } from "@/get-dictionary";

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const profile = await getProfile();
  const dict = await getDictionary((lang || 'en') as "en" | "id");

  return (
    <main className="min-h-screen relative overflow-hidden pt-28">
      <div className="container mx-auto px-4">
        <GlassAbout profile={profile} dict={dict} />
      </div>
    </main>
  );
}