"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { resolveAssetUrl } from "@/lib/media";

type HeroMedia = {
  asset?: {
    url?: string | null;
  } | null;
  url?: string | null;
};

type HeroProfile = {
  fullName?: string | null;
  headline?: string | string[] | null;
  bannerImage?: string | HeroMedia | null;
  profileImage?: string | HeroMedia | null;
};

type HeroDictionary = {
  hero: {
    creative_role?: string;
    greeting: string;
    description: string;
    view_portfolio: string;
    contact_me: string;
  };
};

export default function HeroSection({ profile, dict }: { profile: HeroProfile | null; dict: HeroDictionary }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const fantasyMasterpiece = encodeURI("/images/ranks/RANK 10_Eternal Sovereign.png");
  const fantasyDetail = encodeURI("/images/ranks/RANK 6_Spellblade.png");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const opacityText = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const yImage = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const rotateOutline = useTransform(scrollYProgress, [0, 1], [0, 18]);
  const yBackdropPrimary = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yBackdropSecondary = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const xBackdropPrimary = useTransform(scrollYProgress, [0, 1], [0, -56]);
  const xBackdropSecondary = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const rotateBackdropPrimary = useTransform(scrollYProgress, [0, 1], [-8, 4]);
  const rotateBackdropSecondary = useTransform(scrollYProgress, [0, 1], [10, -7]);
  const backdropOpacity = useTransform(scrollYProgress, [0, 0.16, 0.82, 1], [0.08, 0.24, 0.18, 0.06]);

  const rawRoles = Array.isArray(profile?.headline) && profile.headline.length > 0
    ? profile.headline
    : typeof profile?.headline === "string" && profile.headline.length > 0
      ? [profile.headline]
      : ["Creative Developer", "UI/UX Designer", "Digital Storyteller"];

  const roles = rawRoles.flatMap((role: string) =>
    typeof role === "string" && role.includes(",")
      ? role.split(",").map((entry) => entry.trim()).filter(Boolean)
      : role,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [roles.length]);

  const getImageUrl = (image: string | HeroMedia | null | undefined) => {
    if (!image) return null;
    const rawUrl = typeof image === "string" ? image : image.asset?.url || image.url || null;
    return rawUrl ? resolveAssetUrl(rawUrl, "/profile.png") : null;
  };

  const heroImage = getImageUrl(profile?.bannerImage) || getImageUrl(profile?.profileImage) || "/profile.png";
  const rolePreview = roles.slice(0, 3);
  const profileName = profile?.fullName || "Herdian";

  return (
    <section
      ref={containerRef}
      className="relative isolate overflow-hidden px-4 pb-12 pt-[4.75rem] sm:px-8 sm:pb-14 sm:pt-[5.25rem] lg:px-12 lg:pb-20 lg:pt-[5rem] xl:pt-[5.5rem]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[6%] h-56 w-56 rounded-full bg-[var(--surface-cyan-glow)] blur-[100px]" />
        <div className="absolute right-[10%] top-[18%] h-72 w-72 rounded-full bg-[var(--surface-violet-glow)] blur-[140px]" />
        <div className="absolute bottom-[12%] left-[36%] h-64 w-64 rounded-full bg-[rgba(195,245,255,0.08)] blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent" />

        <motion.div
          style={{ x: xBackdropPrimary, y: yBackdropPrimary, rotate: rotateBackdropPrimary, opacity: backdropOpacity }}
          className="absolute right-[-18%] top-[2%] h-[24rem] w-[18rem] lg:right-[-6%] lg:top-[1%] lg:h-[36rem] lg:w-[29rem] xl:h-[42rem] xl:w-[34rem]"
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle_at_22%_22%,rgba(0,229,255,0.18),transparent_30%),radial-gradient(circle_at_76%_74%,rgba(143,125,255,0.22),transparent_34%)] blur-3xl" />
            <div
              className="absolute inset-0 overflow-hidden rounded-[3rem]"
              style={{
                maskImage: "linear-gradient(155deg, transparent 0%, black 14%, black 86%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(155deg, transparent 0%, black 14%, black 86%, transparent 100%)",
              }}
            >
              <NextImage
                src={fantasyMasterpiece}
                alt="Fantasy digital painting background"
                fill
                sizes="(min-width: 1280px) 34rem, (min-width: 1024px) 29rem, 18rem"
                className="object-cover object-center scale-[1.12] saturate-[1.18] contrast-[1.04]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(7,13,27,0.9)_8%,rgba(7,13,27,0.38)_34%,rgba(7,13,27,0.78)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_36%_24%,rgba(0,229,255,0.16),transparent_28%),radial-gradient(circle_at_68%_58%,rgba(143,125,255,0.2),transparent_30%)]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ x: xBackdropSecondary, y: yBackdropSecondary, rotate: rotateBackdropSecondary, opacity: backdropOpacity }}
          className="absolute left-[42%] top-[44%] hidden h-[22rem] w-[16rem] xl:block"
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.14),transparent_34%),radial-gradient(circle_at_bottom,rgba(143,125,255,0.18),transparent_38%)] blur-2xl" />
            <div
              className="absolute inset-0 overflow-hidden rounded-[2.5rem]"
              style={{
                maskImage: "linear-gradient(165deg, transparent 0%, black 18%, black 82%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(165deg, transparent 0%, black 18%, black 82%, transparent 100%)",
              }}
            >
              <NextImage
                src={fantasyDetail}
                alt="Fantasy detail background"
                fill
                sizes="16rem"
                className="object-cover object-center scale-[1.16] saturate-[1.12]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(7,13,27,0.88),rgba(7,13,27,0.18),rgba(7,13,27,0.9))]" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-6rem)] max-w-7xl items-start gap-12 pt-3 sm:min-h-[calc(100svh-6.5rem)] sm:gap-14 sm:pt-4 lg:min-h-[calc(100svh-6.25rem)] lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:pt-0">
        <motion.div style={{ y: yText, opacity: opacityText }} className="relative">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--ghost-border)] bg-[var(--glass-bg)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--site-secondary)] shadow-[0_0_24px_rgba(0,229,255,0.08)] backdrop-blur-xl sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.32em]"
          >
            <Sparkles size={14} className="text-[var(--site-accent)]" />
            {dict.hero.creative_role || "Digital Architect"}
          </motion.div>

          <div className="mt-7 max-w-3xl sm:mt-8">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--glass-text-muted)] sm:mb-5 sm:text-[11px] sm:tracking-[0.34em]"
            >
              The Ethereal Professional
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-5xl text-[clamp(3rem,15vw,6.5rem)] font-black leading-[0.9] tracking-[-0.06em] text-[var(--foreground)]"
            >
              {dict.hero.greeting}
              <br />
              <span className="text-gradient">{profileName}</span>
            </motion.h1>

            <div className="mt-5 min-h-[3rem] overflow-hidden sm:mt-6 sm:min-h-[3.5rem]">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={roles[index]}
                  initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -18, filter: "blur(12px)" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="text-lg font-medium tracking-[-0.03em] text-[var(--glass-text-muted)] sm:text-2xl lg:text-3xl"
                >
                  {roles[index]}
                </motion.h2>
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-[15px] leading-7 text-[var(--glass-text-muted)] sm:mt-8 sm:text-lg sm:leading-8"
            >
              {dict.hero.description}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4"
          >
            <button
              onClick={() => document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--site-button)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--site-button-text)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_18px_45px_rgba(0,229,255,0.24)] sm:w-auto"
            >
              {dict.hero.view_portfolio}
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex w-full items-center justify-center rounded-full border border-[var(--ghost-border)] bg-[var(--glass-bg)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--glass-text)] transition-all duration-300 hover:border-[var(--site-accent)]/40 hover:bg-[var(--glass-bg-strong)] sm:w-auto"
            >
              {dict.hero.contact_me}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="glass-liquid p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--glass-text-muted)]">
                North Star
              </p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                Editorial systems with cinematic depth.
              </p>
            </div>

            <div className="glass-liquid p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--glass-text-muted)]">
                Disciplines
              </p>
              <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-[var(--site-secondary)]">
                {String(roles.length).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm text-[var(--glass-text-muted)]">Integrated into one digital language.</p>
            </div>

            <div className="glass-liquid p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--glass-text-muted)]">
                Stack Preview
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {rolePreview.map((role) => (
                  <span
                    key={role}
                    className="rounded-full border border-[var(--ghost-border)] bg-[var(--glass-bg)] px-3 py-1 text-xs font-medium text-[var(--glass-text)]"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: yImage, scale: scaleImage }}
          className="relative mx-auto flex w-full max-w-[42rem] justify-center lg:justify-end"
        >
          <div className="relative isolate w-full max-w-[38rem]">
            <motion.div
              style={{
                rotate: rotateOutline,
                background: "color-mix(in srgb, var(--site-card) 24%, transparent)",
                boxShadow:
                  "0 0 0 1px color-mix(in srgb, var(--site-secondary) 10%, transparent), 0 0 55px color-mix(in srgb, var(--site-secondary) 18%, transparent)",
              }}
              className="absolute inset-[7%] z-0 rounded-[2.75rem] border border-[var(--site-secondary)]/22"
            />

            <div className="pointer-events-none absolute -left-5 top-[16%] z-30 hidden w-48 rounded-[1.75rem] border border-[var(--ghost-border)] bg-[var(--glass-bg)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-2xl lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--glass-text-muted)]">
                Live Layer
              </p>
              <p className="mt-2 text-base font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                Floating systems, glow depth, and elegant motion.
              </p>
            </div>

            <div className="pointer-events-none absolute -bottom-5 right-2 z-30 hidden w-52 rounded-[1.75rem] border border-[var(--ghost-border)] bg-[var(--glass-bg)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-2xl lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--glass-text-muted)]">
                Signature
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--glass-text-muted)]">
                Space Grotesk headlines, cyan-violet energy, and no-line tonal layering.
              </p>
            </div>

            <div className="glass-liquid relative z-20 overflow-hidden p-3 sm:p-5">
              <div className="absolute inset-x-[18%] top-0 z-0 h-32 bg-[radial-gradient(circle,rgba(0,229,255,0.2)_0%,transparent_70%)] blur-3xl" />
              <div className="absolute bottom-[-10%] right-[12%] z-0 h-40 w-40 rounded-full bg-[rgba(143,125,255,0.18)] blur-[90px]" />

              <div
                className="relative z-10 overflow-hidden rounded-[2.2rem]"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--glass-bg-strong) 76%, transparent), color-mix(in srgb, var(--glass-bg) 48%, transparent))",
                }}
              >
                <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,117,143,0.85)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,214,102,0.85)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(0,229,255,0.9)]" />
                  </div>
                  <span className="rounded-full border border-[var(--ghost-border)] bg-[var(--glass-bg)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--glass-text-muted)] sm:px-3 sm:text-[10px] sm:tracking-[0.28em]">
                    Digital Architect
                  </span>
                </div>

                <NextImage
                  src={heroImage}
                  alt={profileName}
                  width={1080}
                  height={1275}
                  priority
                  className="relative z-10 h-[22rem] w-full object-cover object-top sm:h-[30rem] lg:h-[42rem]"
                />

                <div
                  className="absolute inset-x-0 bottom-0 z-20 h-40"
                  style={{
                    background:
                      "linear-gradient(to top, color-mix(in srgb, var(--site-primary) 94%, transparent), color-mix(in srgb, var(--site-primary) 52%, transparent), transparent)",
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
