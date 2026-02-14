"use client";

import NextImage from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";

export default function HeroSection({ profile, dict }: { profile: any, dict: any }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax Transforms
  const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yImage = useTransform(scrollYProgress, [0, 1], [0, -100]); // Moves slightly up for depth
  const rotateOutline = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const roles = Array.isArray(profile?.headline) && profile.headline.length > 0
    ? profile.headline
    : (typeof profile?.headline === 'string' && profile.headline.length > 0
      ? [profile.headline]
      : ["Creative Developer", "UI/UX Designer"]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col-reverse lg:block dark:text-white overflow-hidden mt-[-64px] pt-40 lg:pt-48">
      <div className="relative z-10 container mx-auto px-6 lg:px-10 flex flex-col justify-center lg:grid lg:grid-cols-2 gap-12 items-center text-center lg:text-left min-h-[50vh] lg:min-h-[calc(100vh-300px)]">
        {/* Left content */}
        <motion.div
          style={{ y: yText, opacity: opacityText }}
          className="flex-1 pb-20 lg:pb-0"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-liquid text-[var(--site-secondary)] dark:text-[var(--site-secondary)] mb-6 font-semibold shadow-[0_0_20px_var(--site-secondary)]"
          >
            <Sparkles size={16} className="animate-pulse" />
            <span className="text-sm font-medium tracking-wide uppercase">{dict.hero.creative_role}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
            className="text-5xl lg:text-7xl font-bold leading-tight mb-6"
          >
            {dict.hero.greeting} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--site-secondary)] via-[var(--site-secondary)] to-[var(--site-secondary)] animate-gradient-x">
              {profile?.fullName || "Herdian"}
            </span>
          </motion.h1>

          <div className="h-12 mb-8 flex items-center justify-center lg:justify-start overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h3
                key={roles[index]}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.5 }}
                className="text-2xl lg:text-3xl text-[var(--glass-text-muted)] font-light"
              >
                {roles[index]}
              </motion.h3>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg text-[var(--glass-text-muted)] max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed"
          >
            {dict.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <button
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-site-accent-prev to-site-accent-next text-white font-bold shadow-lg shadow-site-accent/30 hover:shadow-site-accent/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {dict.hero.view_portfolio}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 glass-liquid text-[var(--glass-text)] font-semibold hover:scale-105 hover:bg-white/40 dark:hover:bg-black/50 transition-all duration-300"
            >
              {dict.hero.contact_me}
            </button>
          </motion.div>
        </motion.div>

      </div>

      {/* Right content - image */}
      <motion.div
        style={{ y: yImage, scale: scaleImage }}
        className="relative w-full h-[50vh] lg:absolute lg:flex lg:justify-end lg:top-0 lg:left-[60%] lg:-translate-x-1/2 lg:h-screen lg:w-auto lg:aspect-[1080/1275] pointer-events-none z-0 lg:z-10 flex items-end justify-center"
      >
        <div className="relative w-[90vw] h-[50vh] lg:w-full lg:h-full [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]">
          {/* Animated outline box behind image */}
          <motion.div
            style={{ rotate: rotateOutline }}
            className="absolute inset-0 w-[300px] h-[300px] left-1/2 -translate-x-1/2 top-[20%] lg:w-[46%] lg:h-[39%] lg:left-[30%] lg:translate-x-0 lg:top-[35%] rounded-3xl border-4 border-[var(--site-secondary)]/50 bg-white/5 backdrop-blur-sm"
          ></motion.div>

          {profile?.bannerImage ? (
            <NextImage
              id="hero-banner"
              src={profile.bannerImage}
              alt={profile.fullName || "Hero Model"}
              width={1080}
              height={1275}
              className="relative object-cover object-top w-full h-full rounded-3xl top-[20px] lg:top-[64px]"
              priority
            />
          ) : profile?.profileImage ? (
            <NextImage
              src={urlFor(profile.profileImage).url()}
              alt={profile.fullName || "Hero Model"}
              width={1080}
              height={1275}
              className="relative object-cover object-top w-full h-full rounded-3xl top-[20px] lg:top-[64px]"
              priority
            />
          ) : (
            <NextImage
              src="/profile.png"
              alt="Hero Model"
              width={1080}
              height={1275}
              className="relative object-cover object-top w-full h-full rounded-3xl top-[20px] lg:top-[64px]"
              priority
            />
          )}
        </div>
      </motion.div>

      {/* 3/4 background */}
      <div className="absolute top-0 bottom-0 right-0 w-[45%] bg-gradient-to-b from-[var(--site-secondary)]/50 to-transparent rounded-l-full hidden lg:block pointer-events-none"></div>

    </section>
  );
}
