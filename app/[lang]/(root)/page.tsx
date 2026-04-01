import Hero from "@/components/Hero";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { getDictionary } from "@/get-dictionary";
import { getRequestUserContext } from "@/lib/request-user-context";
import { getSanityPartners } from "@/lib/sanityPartners";
import { getProfile } from "@/lib/sanityProfile";
import { getSanityProjects } from "@/lib/sanityProjects";
import { getServices } from "@/lib/sanityServices";
import { getSanityTestimonials } from "@/lib/sanityTestimonials";
import dynamic from "next/dynamic";

const GlassPartners = dynamic(() => import("@/components/GlassPartners"));
const GlassPortfolio = dynamic(() => import("@/components/GlassPortfolio"));
const GlassAbout = dynamic(() => import("@/components/GlassAbout"));
const GlassContact = dynamic(() => import("@/components/GlassContact"));
const GlassTestimonials = dynamic(() => import("@/components/GlassTestimonials"));
const GlassServices = dynamic(() => import("@/components/GlassServices"));

const Home = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params;
  const { userId } = await getRequestUserContext();
  const dict = await getDictionary(lang as any);

  const [projects, testimonials, partners, profile, services] = await Promise.all([
    getSanityProjects(userId, false),
    getSanityTestimonials(),
    getSanityPartners(),
    getProfile(),
    getServices(),
  ]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <SectionWrapper id="hero" parallax={false} className="py-0 pt-0 sm:py-0 sm:pt-0">
        <Hero profile={profile} dict={dict} />
      </SectionWrapper>

      <SectionWrapper id="portfolio">
        <GlassPortfolio projects={projects as any} dict={dict} />
      </SectionWrapper>

      <SectionWrapper
        id="services"
        className="before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-[var(--site-secondary)]/[0.08] before:to-transparent before:transition-opacity before:duration-500 dark:before:opacity-0"
      >
        <GlassServices services={services as any} dict={dict} />
      </SectionWrapper>

      <SectionWrapper id="testimonials">
        <GlassTestimonials testimonials={testimonials} dict={dict} />
      </SectionWrapper>

      <SectionWrapper
        id="partners"
        className="before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-[var(--site-secondary)]/[0.08] before:to-transparent before:transition-opacity before:duration-500 dark:before:opacity-0"
      >
        <GlassPartners partners={partners} dict={dict} />
      </SectionWrapper>

      <SectionWrapper id="about">
        <GlassAbout profile={profile} dict={dict} />
      </SectionWrapper>

      <SectionWrapper
        id="contact"
        className="before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-t before:from-[var(--site-secondary)]/[0.12] before:to-transparent before:transition-opacity before:duration-500 dark:before:opacity-0"
      >
        <GlassContact profile={profile} dict={dict} />
      </SectionWrapper>
    </main>
  );
};

export default Home;
