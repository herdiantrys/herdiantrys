"use client";

import dynamic from "next/dynamic";

const PageTracker = dynamic(() => import("@/components/PageTracker"), { ssr: false });
const LanguageCookieSyncer = dynamic(
  () => import("@/components/Settings/LanguageCookieSyncer"),
  { ssr: false },
);
const ScrollProgressTracker = dynamic(
  () => import("@/components/Gamification/ScrollProgressTracker"),
  { ssr: false },
);
const ToasterClient = dynamic(() => import("@/components/ToasterClient"), { ssr: false });

type RootClientEnhancementsProps = {
  currentPathLang: string;
  needsLanguageSync: boolean;
  userLanguage: string;
  scrollTrackerUserId?: string | null;
};

export default function RootClientEnhancements({
  currentPathLang,
  needsLanguageSync,
  userLanguage,
  scrollTrackerUserId,
}: RootClientEnhancementsProps) {
  return (
    <>
      <PageTracker />
      {needsLanguageSync ? (
        <LanguageCookieSyncer
          userLanguage={userLanguage}
          currentPathLang={currentPathLang}
        />
      ) : null}
      <ToasterClient />
      {scrollTrackerUserId ? <ScrollProgressTracker userId={scrollTrackerUserId} /> : null}
    </>
  );
}
