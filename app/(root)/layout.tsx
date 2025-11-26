import "../globals.css";
import GlobalNavbar from "@/components/GlobalNavbar";
import { SanityLive } from "@/sanity/lib/live";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import ParticleWave from "@/components/ParticleWave";
import Footer from "@/components/Footer";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProviderWrapper>
      <GlobalNavbar />
      <ParticleWave />
      {children}
      <Footer />
      <SanityLive />
    </SessionProviderWrapper>
  );
}
