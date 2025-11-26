"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";

export default function HeroSection({ profile }: { profile: any }) {
  const [index, setIndex] = useState(0);
  const roles = profile?.headline && profile.headline.length > 0 ? profile.headline : ["Creative Developer", "UI/UX Designer"];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center dark:text-white overflow-hidden mt-[-64px]">
      <div className="relative z-10 container mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass bg-white/10 border border-teal-500/30 text-teal-600 dark:text-teal-300 mb-6"
          >
            <Sparkles size={16} />
            <span className="text-sm font-medium tracking-wide uppercase">Creative Digital Artist</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-5xl lg:text-7xl font-bold leading-tight mb-6"
          >
            Hi There! I'm <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-500 to-emerald-500 animate-gradient-x">
              {profile?.fullName || "Herdian"}
            </span>
          </motion.h1>

          <div className="h-12 mb-8 flex items-center justify-center lg:justify-start overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h3
                key={roles[index]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
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
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg text-[var(--glass-text-muted)] max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed"
          >
            Crafting visual experiences that blend imagination with digital precision.
            Specializing in brand identity, character design, and immersive illustrations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <button
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              View Portfolio
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-2xl glass bg-white/5 border border-white/10 hover:bg-white/10 text-[var(--glass-text)] font-semibold hover:scale-105 transition-all duration-300"
            >
              Contact Me
            </button>
          </motion.div>
        </motion.div>

      </div>
      {/* Right content - image */}
      <div className="absolute flex justify-center lg:justify-end bottom-0 left-1/2 lg:left-[calc(62%-540px)] hidden lg:block pointer-events-none z-10">
        <div className="relative w-96 h-112 lg:w-[1080px] lg:h-[1275px] [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
          {/* Animated outline box behind image */}
          <div className="absolute inset-0 w-[500px] h-[500px] left-[30%] top-[35%] rounded-3xl border-4 border-cyan-400/50 animate-spin-slow bg-white/5"></div>

          {profile?.profileImage ? (
            <Image
              src={urlFor(profile.profileImage).url()}
              alt={profile.fullName || "Hero Model"}
              width={1080}
              height={1275}
              className="relative object-cover w-full h-full rounded-3xl top-[64px]"
            />
          ) : (
            <Image
              src="/profile.png"
              alt="Hero Model"
              width={1080}
              height={1275}
              className="relative object-cover w-full h-full rounded-3xl top-[64px]"
            />
          )}
        </div>
      </div>
      {/* 3/4 background */}
      <div className="absolute top-0 bottom-0 right-0 w-[45%] bg-gradient-to-b from-teal-500/50 to-transparent rounded-l-full hidden lg:block pointer-events-none"></div>

    </section>
  );
}
