import Hero from "@/components/Hero";
import { getSanityProjects } from "@/lib/sanityProjects";
import dynamic from "next/dynamic";


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
import SectionWrapper from "@/components/ui/SectionWrapper";

const Home = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const dict = await getDictionary(lang as any);

  const [projects, testimonials, partners, profile, services] = await Promise.all([
    getSanityProjects(userId, false),
    getSanityTestimonials(),
    getSanityPartners(),
    getProfile(),
    getServices(),
  ]);

  return (
    <main className="min-h-screen overflow-hidden relative">
      <SectionWrapper id="hero" parallax={false} className="pt-0 sm:pt-0 py-0 sm:py-0">
        <Hero profile={profile} dict={dict} />
      </SectionWrapper>

      <SectionWrapper id="portfolio">
        <GlassPortfolio projects={projects as any} dict={dict} />
      </SectionWrapper>

      <SectionWrapper
        id="services"
        className="before:absolute before:inset-0 before:bg-gradient-to-b before:from-[var(--site-secondary)]/[0.08] before:to-transparent before:-z-10 dark:before:opacity-0 before:transition-opacity before:duration-500"
      >
        <GlassServices services={services as any} dict={dict} />
      </SectionWrapper>

      <SectionWrapper id="testimonials">
        <GlassTestimonials testimonials={testimonials} dict={dict} />
      </SectionWrapper>

      <SectionWrapper
        id="partners"
        className="before:absolute before:inset-0 before:bg-gradient-to-b before:from-[var(--site-secondary)]/[0.08] before:to-transparent before:-z-10 dark:before:opacity-0 before:transition-opacity before:duration-500"
      >
        <GlassPartners partners={partners} dict={dict} />
      </SectionWrapper>

      <SectionWrapper id="about">
        <GlassAbout profile={profile} dict={dict} />
      </SectionWrapper>

      <SectionWrapper
        id="contact"
        className="before:absolute before:inset-0 before:bg-gradient-to-t before:from-[var(--site-secondary)]/[0.12] before:to-transparent before:-z-10 dark:before:opacity-0 before:transition-opacity before:duration-500"
      >
        <GlassContact profile={profile} dict={dict} />
      </SectionWrapper>
    </main>
  );
};

export default Home;