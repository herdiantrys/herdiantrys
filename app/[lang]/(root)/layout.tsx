import AppLayoutAdapter from "@/components/AppLayoutAdapter";
import { SanityLive } from "@/sanity/lib/live";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Footer from "@/components/Footer";
import { getDictionary } from "@/get-dictionary";


export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary((lang || 'en') as "en" | "id");

  return (
    <SessionProviderWrapper>
      <AppLayoutAdapter dict={dict}>

        {children}
        <Footer dict={dict} />
      </AppLayoutAdapter>
      <SanityLive />
    </SessionProviderWrapper>
  );
}
