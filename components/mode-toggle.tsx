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
      <button className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 opacity-50"></button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden transition-all duration-300 shadow-sm
        ${isDark
          ? "bg-neutral-800/80 border-neutral-700 hover:shadow-[0_0_15px_rgba(45,212,191,0.25)]"
          : "bg-sky-100/80 border-sky-200 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)]"} 
        border`}
      aria-label="Toggle Theme"
    >
      {/* Background elements for Light Mode (Clouds/Sky) */}
      <AnimatePresence>
        {!isDark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="absolute top-1 left-1 w-6 h-6 bg-white/60 rounded-full blur-[2px]"></div>
            <div className="absolute bottom-0 right-1 w-4 h-4 bg-white/40 rounded-full blur-[1px]"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background elements for Dark Mode (Stars) */}
      <AnimatePresence>
        {isDark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 pointer-events-none"
          >
            <motion.div
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-2 left-2 w-[2px] h-[2px] bg-white rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1 }}
              className="absolute bottom-2 right-3 w-[2px] h-[2px] bg-white/80 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
              className="absolute top-4 right-1 w-[1.5px] h-[1.5px] bg-white/70 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ y: isDark ? 25 : -25, opacity: 0, rotate: isDark ? -180 : 180, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          exit={{ y: isDark ? -25 : 25, opacity: 0, rotate: isDark ? 180 : -180, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
          className="absolute z-10"
        >
          {isDark ? (
            <Moon className="w-5 h-5 text-teal-300 drop-shadow-[0_0_6px_rgba(45,212,191,0.6)] fill-teal-300/20" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] fill-amber-500/20" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
