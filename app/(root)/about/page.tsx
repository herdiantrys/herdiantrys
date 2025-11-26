import GlassAbout from "@/components/GlassAbout";
import { getProfile } from "@/lib/sanityProfile";

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <main className="min-h-screen relative overflow-hidden pt-24">
      <div className="container mx-auto px-4">
        <GlassAbout profile={profile} />
      </div>
    </main>
  );
}