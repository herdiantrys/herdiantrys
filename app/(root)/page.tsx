import fs from "fs";
import path from "path";
import GlassHero from "@/components/GlassHero";
import GlassPartners from "@/components/GlassPartners";
import GlassPortfolio, { Project } from "@/components/GlassPortfolio";
import GlassAbout from "@/components/GlassAbout";
import GlassContact from "@/components/GlassContact";
import GlassTestimonials from "@/components/GlassTestimonials";
import GlassServices from "@/components/GlassServices";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { getSanityProjects } from "@/lib/sanityProjects";
import { getSanityTestimonials } from "@/lib/sanityTestimonials";
import { getSanityPartners } from "@/lib/sanityPartners";
import { getProfile } from "@/lib/sanityProfile";
import { getServices } from "@/lib/sanityServices";
import { auth } from "@/auth";

const Home = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  const projects = await getSanityProjects(userId, true);
  const testimonials = await getSanityTestimonials();
  const partners = await getSanityPartners();
  const profile = await getProfile();
  const services = await getServices();

  return (
    <main className="min-h-screen overflow-hidden relative">
      <Navbar />

      <div id="hero">
        <Hero profile={profile} />
      </div>
      <div id="portfolio">
        <GlassPortfolio projects={projects} />
      </div>
      <div id="services">
        <GlassServices services={services} />
      </div>
      <div id="testimonials">
        <GlassTestimonials testimonials={testimonials} />
      </div>
      <div id="partners">
        <GlassPartners partners={partners} />
      </div>
      <div id="about">
        <GlassAbout profile={profile} />
      </div>
      <div id="contact">
        <GlassContact profile={profile} />
      </div>
    </main>
  );
};

export default Home;