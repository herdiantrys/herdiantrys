import GlassHero from "@/components/GlassHero";
import GlassPartners from "@/components/GlassPartners";
import GlassPortfolio, { Project } from "@/components/GlassPortfolio";
import GlassAbout from "@/components/GlassAbout";
import GlassContact from "@/components/GlassContact";
import GlassTestimonials from "@/components/GlassTestimonials";
import GlassServices from "@/components/GlassServices";
import Hero from "@/components/Hero";
import { getSanityProjects } from "@/lib/sanityProjects";
import { getSanityTestimonials } from "@/lib/sanityTestimonials";
import { getSanityPartners } from "@/lib/sanityPartners";
import { getProfile } from "@/lib/sanityProfile";
import { getServices } from "@/lib/sanityServices";
import { auth } from "@/auth";
import { getDictionary } from "@/get-dictionary";

const Home = async ({ params }: { params: { lang: string } }) => {
  const session = await auth();
  const userId = session?.user?.id;
  const lang = (params.lang || 'en') as "en" | "id";
  const dict = await getDictionary(lang);

  const [projects, testimonials, partners, profile, services] = await Promise.all([
    getSanityProjects(userId, true),
    getSanityTestimonials(),
    getSanityPartners(),
    getProfile(),
    getServices(),
  ]);

  return (
    <main className="min-h-screen overflow-hidden relative">
      <div id="hero">
        <Hero profile={profile} dict={dict} />
      </div>
      <div id="portfolio">
        <GlassPortfolio projects={projects} dict={dict} />
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