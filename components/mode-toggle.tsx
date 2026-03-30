"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="h-11 w-11 rounded-full border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)] opacity-60 backdrop-blur-xl" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)] shadow-[0_14px_34px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--site-sidebar-accent)]/30 hover:bg-[var(--site-sidebar-active)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.26)]"
      aria-label="Toggle Theme"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_26%,color-mix(in_srgb,var(--site-sidebar-accent)_18%,transparent),transparent_46%),radial-gradient(circle_at_76%_78%,color-mix(in_srgb,var(--site-secondary)_14%,transparent),transparent_42%)] opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
        <div className={`absolute inset-[5px] rounded-full border transition-colors duration-300 ${isDark ? "border-white/6" : "border-[var(--site-sidebar-border)]/60"}`} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ y: isDark ? 18 : -18, opacity: 0, rotate: isDark ? -110 : 110, scale: 0.72 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          exit={{ y: isDark ? -18 : 18, opacity: 0, rotate: isDark ? 110 : -110, scale: 0.72 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative z-10"
        >
          {isDark ? (
            <Moon className="h-5 w-5 text-[var(--site-sidebar-accent)] drop-shadow-[0_0_12px_var(--site-sidebar-accent)]" />
          ) : (
            <Sun className="h-5 w-5 text-[var(--site-secondary)] drop-shadow-[0_0_12px_rgba(0,229,255,0.28)]" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
