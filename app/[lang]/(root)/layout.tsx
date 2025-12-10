import Navbar from "@/components/Navbar";
import { SanityLive } from "@/sanity/lib/live";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import ParticleWave from "@/components/ParticleWave";
import Footer from "@/components/Footer";
import { getDictionary } from "@/get-dictionary";

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  const lang = (params.lang || 'en') as "en" | "id";
  const dict = await getDictionary(lang);

  return (
    <SessionProviderWrapper>
      <Navbar dict={dict} />
      <ParticleWave />
      {children}
      <Footer dict={dict} />
      <SanityLive />
    </SessionProviderWrapper>
  );
}
