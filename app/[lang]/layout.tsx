import type { Metadata } from "next";
import "../globals.css";
import RootClientEnhancements from "@/components/RootClientEnhancements";
import { ThemeProvider } from "../../components/theme-provider";
import { getRequestUserContext } from "@/lib/request-user-context";

export const metadata: Metadata = {
  metadataBase: new URL("https://herdiantry.id"),
  title: {
    default: "Herdian Portfolio",
    template: "%s | Herdian Portfolio",
  },
  description: "Professional portfolio of Herdian featuring full-stack development projects and skills.",
  openGraph: {
    title: "Herdian Portfolio",
    description: "Explore my portfolio showcasing top-tier web development projects and skills.",
    url: "https://herdiantry.id",
    siteName: "Herdian Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Herdian Portfolio",
    description: "Professional portfolio of Herdian.",
  },
};

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "id" }];
}

import { getGlobalTheme } from "@/lib/actions/settings.actions";
import ThemeInjector from "../../components/Theme/ThemeInjector";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  try {
    const { lang } = await params;
    const { preferredLanguage, session } = await getRequestUserContext();
    const theme = await getGlobalTheme();
    const cookieStore = await cookies();

    const cookieLang = cookieStore.get("NEXT_LOCALE")?.value;
    const resolvedUserLang = preferredLanguage || "en";
    const needsSync = !!session?.user?.id && (resolvedUserLang !== cookieLang || resolvedUserLang !== lang);

    return (
      <html lang={lang} suppressHydrationWarning>
        <body className="min-h-screen antialiased">
          <ThemeInjector theme={theme} />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <RootClientEnhancements
              currentPathLang={lang}
              needsLanguageSync={needsSync}
              userLanguage={resolvedUserLang}
              scrollTrackerUserId={session?.user?.id}
            />
          </ThemeProvider>
        </body>
      </html>
    );
  } catch (error: unknown) {
    console.error("CRITICAL LAYOUT ERROR:", error);
    throw error;
  }
}
