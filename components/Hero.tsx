"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

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

export default function HeroSection({ profile, dict }: { profile: HeroProfile; dict: HeroDictionary }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const opacityText = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const yImage = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const rotateOutline = useTransform(scrollYProgress, [0, 1], [0, 18]);

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
    if (typeof image === "string") return image;
    return image.asset?.url || image.url || null;
  };

  const heroImage = getImageUrl(profile?.bannerImage) || getImageUrl(profile?.profileImage) || "/profile.png";
  const rolePreview = roles.slice(0, 3);
  const profileName = profile?.fullName || "Herdian";

  return (
    <section
      ref={containerRef}
      className="relative isolate overflow-hidden px-6 pb-16 pt-36 sm:px-8 lg:px-12 lg:pb-24 lg:pt-44"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[6%] h-56 w-56 rounded-full bg-[var(--surface-cyan-glow)] blur-[100px]" />
        <div className="absolute right-[10%] top-[18%] h-72 w-72 rounded-full bg-[var(--surface-violet-glow)] blur-[140px]" />
        <div className="absolute bottom-[12%] left-[36%] h-64 w-64 rounded-full bg-[rgba(195,245,255,0.08)] blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-10rem)] max-w-7xl items-center gap-16 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div style={{ y: yText, opacity: opacityText }} className="relative">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--ghost-border)] bg-[var(--glass-bg)] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--site-secondary)] shadow-[0_0_24px_rgba(0,229,255,0.08)] backdrop-blur-xl"
          >
            <Sparkles size={14} className="text-[var(--site-accent)]" />
            {dict.hero.creative_role || "Digital Architect"}
          </motion.div>

          <div className="mt-8 max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--glass-text-muted)]"
            >
              The Ethereal Professional
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-5xl text-[3.25rem] font-black leading-[0.9] tracking-[-0.06em] text-[var(--foreground)] sm:text-[4.5rem] lg:text-[6.5rem]"
            >
              {dict.hero.greeting}
              <br />
              <span className="text-gradient">{profileName}</span>
            </motion.h1>

            <div className="mt-6 min-h-[3.5rem] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={roles[index]}
                  initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -18, filter: "blur(12px)" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="text-xl font-medium tracking-[-0.03em] text-[var(--glass-text-muted)] sm:text-2xl lg:text-3xl"
                >
                  {roles[index]}
                </motion.h2>
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 max-w-xl text-base leading-8 text-[var(--glass-text-muted)] sm:text-lg"
            >
              {dict.hero.description}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <button
              onClick={() => document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--site-button)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--site-button-text)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_18px_45px_rgba(0,229,255,0.24)]"
            >
              {dict.hero.view_portfolio}
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center rounded-full border border-[var(--ghost-border)] bg-[var(--glass-bg)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--glass-text)] transition-all duration-300 hover:border-[var(--site-accent)]/40 hover:bg-[var(--glass-bg-strong)]"
            >
              {dict.hero.contact_me}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 grid gap-4 sm:grid-cols-3"
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
          <div className="relative w-full max-w-[38rem]">
            <motion.div
              style={{
                rotate: rotateOutline,
                background: "color-mix(in srgb, var(--site-card) 24%, transparent)",
                boxShadow:
                  "0 0 0 1px color-mix(in srgb, var(--site-secondary) 10%, transparent), 0 0 55px color-mix(in srgb, var(--site-secondary) 18%, transparent)",
              }}
              className="absolute inset-[7%] rounded-[2.75rem] border border-[var(--site-secondary)]/22"
            />

            <div className="pointer-events-none absolute -left-5 top-[16%] hidden w-48 rounded-[1.75rem] border border-[var(--ghost-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-2xl lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--glass-text-muted)]">
                Live Layer
              </p>
              <p className="mt-2 text-base font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                Floating systems, glow depth, and elegant motion.
              </p>
            </div>

            <div className="pointer-events-none absolute -bottom-5 right-2 hidden w-52 rounded-[1.75rem] border border-[var(--ghost-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-2xl lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--glass-text-muted)]">
                Signature
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--glass-text-muted)]">
                Space Grotesk headlines, cyan-violet energy, and no-line tonal layering.
              </p>
            </div>

            <div className="glass-liquid relative overflow-hidden p-4 sm:p-5">
              <div className="absolute inset-x-[18%] top-0 h-32 bg-[radial-gradient(circle,rgba(0,229,255,0.2)_0%,transparent_70%)] blur-3xl" />
              <div className="absolute bottom-[-10%] right-[12%] h-40 w-40 rounded-full bg-[rgba(143,125,255,0.18)] blur-[90px]" />

              <div
                className="relative overflow-hidden rounded-[2.2rem]"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--glass-bg-strong) 76%, transparent), color-mix(in srgb, var(--glass-bg) 48%, transparent))",
                }}
              >
                <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,117,143,0.85)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,214,102,0.85)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(0,229,255,0.9)]" />
                  </div>
                  <span className="rounded-full border border-[var(--ghost-border)] bg-[var(--glass-bg)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--glass-text-muted)]">
                    Digital Architect
                  </span>
                </div>

                <NextImage
                  src={heroImage}
                  alt={profileName}
                  width={1080}
                  height={1275}
                  priority
                  className="relative z-0 h-[28rem] w-full object-cover object-top sm:h-[34rem] lg:h-[42rem]"
                />

                <div
                  className="absolute inset-x-0 bottom-0 h-40"
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
