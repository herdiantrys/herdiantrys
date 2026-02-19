import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "../../components/theme-provider";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import ScrollProgressTracker from "@/components/Gamification/ScrollProgressTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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



    return (
      <html lang={lang} suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
          <ThemeInjector theme={theme} />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster position="top-center" richColors closeButton />
            {session?.user?.id && <ScrollProgressTracker userId={session.user.id} />}
          </ThemeProvider>
        </body>
      </html>
    );
  } catch (error: any) {
    console.error("CRITICAL LAYOUT ERROR:", error);
    throw error;
  }
}