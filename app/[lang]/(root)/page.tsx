import Hero from "@/components/Hero";
import { getSanityProjects } from "@/lib/sanityProjects";
import dynamic from "next/dynamic";
import ScrollBackground from "@/components/ScrollBackground";

const GlassPartners = dynamic(() => import("@/components/GlassPartners"));
const GlassPortfolio = dynamic(() => import("@/components/GlassPortfolio"));
const GlassAbout = dynamic(() => import("@/components/GlassAbout"));
const GlassContact = dynamic(() => import("@/components/GlassContact"));
const GlassTestimonials = dynamic(() => import("@/components/GlassTestimonials"));
const GlassServices = dynamic(() => import("@/components/GlassServices"));
import { getSanityTestimonials } from "@/lib/sanityTestimonials";
import { getSanityPartners } from "@/lib/sanityPartners";
import { getProfile } from "@/lib/sanityProfile";
import { getServices } from "@/lib/sanityServices";
import { auth } from "@/auth";
import { getDictionary } from "@/get-dictionary";

const Home = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const dict = await getDictionary(lang as any);

  const [projects, testimonials, partners, profile, services] = await Promise.all([
    getSanityProjects(userId, true),
    getSanityTestimonials(),
    getSanityPartners(),
    getProfile(),
    getServices(),
  ]);

  return (
    <main className="min-h-screen overflow-hidden relative">
      <ScrollBackground />
      <div id="hero">
        <Hero profile={profile} dict={dict} />
      </div>
      <div id="portfolio">
        <GlassPortfolio projects={projects as any} dict={dict} />
      </div>
      <div id="services">
        <GlassServices services={services} dict={dict} />
      </div>
      <div id="testimonials">
        <GlassTestimonials testimonials={testimonials} dict={dict} />
      </div>
      <div id="partners">
        <GlassPartners partners={partners} dict={dict} />
      </div>
      <div id="about">
        <GlassAbout profile={profile} dict={dict} />
      </div>
      <div id="contact">
        <GlassContact profile={profile} dict={dict} />
      </div>
    </main>
  );
};

export default Home;