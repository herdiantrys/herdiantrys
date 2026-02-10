"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, Moon, Sun } from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import { ModeToggle } from "./mode-toggle";

type UserLike = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
} | null;

type NavbarClientProps = {
  user: UserLike;
};

export default function NavbarClient({ user }: NavbarClientProps) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState<string>("#about");
  const sections = useMemo(
    () => ["#about", "#works", "#skills", "#contact"],
    []
  );

  // Hide on scroll (headroom-like)
  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setHidden(y > lastY.current && y > 64);
          lastY.current = y;
          ticking.current = false;
        });
        ticking.current = true;
      }
      // close surfaces when scrolling
      setOpenDropdown(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active link by section in view
  useEffect(() => {
    const els = sections
      .map((sel) => document.querySelector(sel))
      .filter(Boolean) as Element[];
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(`#${visible[0].target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (
        openDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setOpenDropdown(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openDropdown]);

  const navItems = [
    { name: "About", href: "#about" },
    { name: "Works", href: "#works" },
    { name: "Skills", href: "#skills" },
    { name: "Contact", href: "#contact" },
  ];

  const navVariants = {
    visible: { y: 0, opacity: 1, transition: { duration: prefersReducedMotion ? 0 : 0.5 } },
    hidden: { y: -80, opacity: 0, transition: { duration: prefersReducedMotion ? 0 : 0.4 } },
  };

  return (
    <>
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate={hidden ? "hidden" : "visible"}
        className="fixed inset-x-0 top-0 z-50 mx-auto w-full backdrop-blur-xl bg-white/60 dark:bg-neutral-900/60 border-b border-black/5 dark:border-white/10"
        role="navigation"
        aria-label="Primary"
      >
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/30"
            >
              <span className="relative text-xl font-extrabold">MyPortfolio</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = active === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="relative rounded-lg px-3 py-2 text-sm font-medium"
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.name}
                    {/* underline dsb tetap */}
                  </Link>
                );
              })}

              {/* Theme toggle */}
              <ModeToggle />

              {/* User area (paling penting di sini) */}
              {user ? (
                <button
                  onClick={() => signOut()}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {user.name ?? "Account"}
                </button>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="rounded-lg px-3 py-2 text-sm font-medium bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-500 text-black shadow-sm"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile trigger */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-neutral-700 hover:bg-black/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/30 dark:text-neutral-300 dark:hover:bg-white/5"
              onClick={() => setOpenMobile(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Spacer to prevent content jump */}
      <div aria-hidden className="h-16" />

      {/* MOBILE SHEET */}
      <AnimatePresence>
        {openMobile && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpenMobile(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openMobile && (
          <motion.aside
            key="mobile-sheet"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: prefersReducedMotion ? 0 : 0.28 }}
            className="fixed right-0 top-0 z-50 h-full w-[84%] max-w-sm overflow-y-auto border-l border-white/10 bg-white/80 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold" onClick={() => setOpenMobile(false)}>
                MyPortfolio
              </Link>
              <button
                onClick={() => setOpenMobile(false)}
                className="inline-flex items-center rounded-lg p-2 hover:bg-black/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/30 dark:hover:bg-white/5"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block rounded-xl px-3 py-3 text-base font-medium text-neutral-800 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/5"
                  onClick={() => setOpenMobile(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="mt-6 h-px bg-gradient-to-r from-transparent via-neutral-300/50 to-transparent dark:via-white/10" />

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/30 dark:border-white/15 dark:hover:bg-white/5"
              >
                <Sun className="hidden h-4 w-4 dark:block" />
                <Moon className="h-4 w-4 dark:hidden" /> Toggle theme
              </button>
              <button
                onClick={() => signIn("google")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-500 px-4 py-2 text-sm font-semibold text-black shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/30"
                >
                Login
                </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
