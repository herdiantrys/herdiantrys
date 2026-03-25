import type { Metadata } from "next";
import "../globals.css";
import { ThemeProvider } from "../../components/theme-provider";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ScrollProgressTracker from "@/components/Gamification/ScrollProgressTracker";

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
  return [{ lang: 'en' }, { lang: 'id' }]
}

import { getGlobalTheme } from "@/lib/actions/settings.actions";
import ThemeInjector from "../../components/Theme/ThemeInjector";
import { cookies } from "next/headers";
import LanguageCookieSyncer from "@/components/Settings/LanguageCookieSyncer";
import PageTracker from "@/components/PageTracker";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  try {
    const { lang } = await params;
    const session = await auth();
    const theme = await getGlobalTheme();
    const cookieStore = await cookies();

    let userLang = session?.user?.language;

    // Fetch fresh preferences from DB if logged in, because session might be stale
    if (session?.user?.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { preferences: true }
      });
      const prefs = (dbUser?.preferences as Record<string, unknown>) || {};
      if (prefs.language) {
        userLang = String(prefs.language);
      }
    }

    // Check if user language preference exists and differs from current Locale in URL
    const cookieLang = cookieStore.get("NEXT_LOCALE")?.value;
    const resolvedUserLang = userLang || "en";
    const needsSync = userLang && (userLang !== cookieLang || userLang !== lang);


    return (
      <html lang={lang} suppressHydrationWarning>
        <body className="min-h-screen antialiased">
          <PageTracker />
          {needsSync && <LanguageCookieSyncer userLanguage={resolvedUserLang} currentPathLang={lang} />}
          <ThemeInjector theme={theme} />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                className: "rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--glass-text)] font-medium backdrop-blur-2xl shadow-[var(--glass-shadow)]",
                classNames: {
                  toast: "group relative flex items-center gap-4 border p-4 overflow-hidden min-w-[320px] max-w-sm",
                  title: "text-sm font-bold text-[var(--glass-text)]",
                  description: "text-[13px] text-[var(--glass-text-muted)]",
                  actionButton: "rounded-xl bg-[var(--site-button)] px-3 py-1.5 text-xs font-bold text-[var(--site-button-text)] transition-opacity hover:opacity-90",
                  cancelButton: "rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs font-bold text-[var(--glass-text-muted)] transition-colors hover:bg-[var(--glass-bg-strong)] hover:text-[var(--glass-text)]",
                  closeButton: "left-auto right-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--glass-text)] transition-colors hover:bg-[var(--glass-bg-strong)]",
                  success: "bg-green-500/10 border-green-500/20 text-green-500 dark:text-green-400 [&>[data-icon]]:text-green-500",
                  error: "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400 [&>[data-icon]]:text-red-500",
                  warning: "bg-orange-500/10 border-orange-500/20 text-orange-500 dark:text-orange-400 [&>[data-icon]]:text-orange-500",
                  info: "bg-sky-500/10 border-sky-500/20 text-sky-500 dark:text-sky-400 [&>[data-icon]]:text-sky-500",
                  icon: "mr-2 h-5 w-5",
                }
              }}
            />
            {session?.user?.id && <ScrollProgressTracker userId={session.user.id} />}
          </ThemeProvider>
        </body>
      </html>
    );
  } catch (error: unknown) {
    console.error("CRITICAL LAYOUT ERROR:", error);
    throw error;
  }
}
