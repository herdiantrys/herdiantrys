"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

type Star = {
  x: number; // 0..100 vw
  y: number; // 0..100 vh
  size: number; // px
  opacity: number; // 0.2..1
  delay: number; // s
  duration: number; // s
  drift: number; // px vertical drift
  blur: number; // px
};

function makeStars(count: number, seed = 1): Star[] {
  // simple pseudo-random so results stay stable across renders
  let s = seed;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;

  const arr: Star[] = [];
  for (let i = 0; i < count; i++) {
    const size = Math.max(1, Math.round(rnd() * 2.5)); // 1–3 px
    arr.push({
      x: Math.round(rnd() * 100),
      y: Math.round(rnd() * 100),
      size,
      opacity: 0.35 + rnd() * 0.65,
      delay: rnd() * 6,
      duration: 2 + rnd() * 6,
      drift: 6 + rnd() * 16,
      blur: size === 1 ? 0.5 : size === 2 ? 1.5 : 2.5,
    });
  }
  return arr;
}

export default function GalaxyBackground({
  className = "",
  density = 420, // total stars across all layers
}: {
  className?: string;
  density?: number;
}) {
  // three parallax layers: far, mid, near
  const far = useMemo(() => makeStars(Math.round(density * 0.35), 11), [density]);
  const mid = useMemo(() => makeStars(Math.round(density * 0.40), 29), [density]);
  const near = useMemo(() => makeStars(Math.round(density * 0.25), 97), [density]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Soft nebulae/aurora with slow movement */}
      <motion.div
        className="absolute -inset-1"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        style={{ filter: "blur(40px)", opacity: 0.35 }}
      >
        <div className="absolute -top-24 -right-24 size-[420px] rounded-full bg-gradient-to-tr from-indigo-500/40 via-fuchsia-500/25 to-cyan-400/20" />
        <div className="absolute -bottom-24 -left-24 size-[520px] rounded-full bg-gradient-to-br from-blue-500/25 via-purple-500/20 to-teal-400/15" />
        <div className="absolute top-1/3 left-1/4 size-[380px] rounded-full bg-gradient-to-b from-fuchsia-400/25 to-transparent" />
      </motion.div>

      {/* FAR layer — smallest + slowest */}
      <div className="absolute inset-0">
        {far.map((st, i) => (
          <motion.span
            key={`far-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${st.x}vw`,
              top: `${st.y}vh`,
              width: st.size,
              height: st.size,
              opacity: st.opacity * 0.6,
              filter: `drop-shadow(0 0 ${st.blur}px rgba(255,255,255,0.6))`,
            }}
            animate={{ opacity: [0.15, st.opacity * 0.6, 0.15], y: [0, -st.drift * 0.25, 0] }}
            transition={{
              duration: st.duration * 1.4,
              delay: st.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* MID layer — medium stars */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: ["0%", "-2%", "0%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      >
        {mid.map((st, i) => (
          <motion.span
            key={`mid-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${st.x}vw`,
              top: `${st.y}vh`,
              width: st.size + 0.5,
              height: st.size + 0.5,
              opacity: st.opacity * 0.8,
              filter: `drop-shadow(0 0 ${st.blur + 0.5}px rgba(255,255,255,0.75))`,
            }}
            animate={{ opacity: [0.25, st.opacity * 0.9, 0.25], y: [0, -st.drift * 0.5, 0] }}
            transition={{
              duration: st.duration,
              delay: st.delay / 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* NEAR layer — brightest + fastest (a bit more parallax) */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: ["0%", "-4%", "0%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      >
        {near.map((st, i) => (
          <motion.span
            key={`near-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${st.x}vw`,
              top: `${st.y}vh`,
              width: st.size + 1,
              height: st.size + 1,
              opacity: st.opacity,
              filter: `drop-shadow(0 0 ${st.blur + 1.2}px rgba(255,255,255,0.9))`,
            }}
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -st.drift, 0] }}
            transition={{
              duration: st.duration * 0.8,
              delay: st.delay / 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Very subtle film grain */}
      <div
        className="absolute inset-0 mix-blend-screen opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)",
        }}
      />
    </div>
  );
}
