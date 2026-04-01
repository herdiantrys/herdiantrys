"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { ModeToggle } from "@/components/mode-toggle";

type HomeFloatingNavbarProps = {
  dict: any;
};

export default function HomeFloatingNavbar({ dict }: HomeFloatingNavbarProps) {
  const [activeSection, setActiveSection] = useState("hero");
  const [isNavVisible, setIsNavVisible] = useState(true);
  const isProgrammaticScroll = useRef(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 100 && !isProgrammaticScroll.current) {
        setIsNavVisible(currentScrollY <= lastScrollY.current);
      } else if (currentScrollY <= 100) {
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = ["hero", "portfolio", "services", "testimonials", "partners", "about", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: isNavVisible ? 0 : -200, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      id="global-navbar"
      className="floating-dock fixed left-1/2 top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 flex w-[calc(100%-1rem)] max-w-6xl -translate-x-1/2 flex-col items-stretch gap-2 rounded-[2rem] border border-[var(--site-sidebar-border)] bg-[color-mix(in_srgb,var(--site-sidebar-bg)_82%,transparent)] px-3 py-2.5 shadow-[0_18px_42px_rgba(8,16,32,0.14)] sm:top-6 sm:w-[92%] sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:rounded-full sm:px-5"
    >
      <nav aria-label="Main Navigation" className="relative z-10 flex w-full min-w-0 items-center sm:w-auto">
        <div className="scrollbar-hide flex w-full max-w-full snap-x snap-mandatory items-center gap-1 overflow-x-auto rounded-full border border-[var(--site-sidebar-border)] bg-[color-mix(in_srgb,var(--site-sidebar-active)_76%,transparent)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:w-auto">
          {[
            { label: dict.nav?.home || "Home", href: "#hero", id: "hero" },
            { label: dict.nav?.works || "Portfolio", href: "#portfolio", id: "portfolio" },
            { label: dict.nav?.services || "Services", href: "#services", id: "services" },
            { label: dict.nav?.about || "About", href: "#about", id: "about" },
            { label: dict.nav?.contact || "Contact", href: "#contact", id: "contact" },
          ].map((item) => {
            const isActive = activeSection === item.id;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(event) => {
                  event.preventDefault();
                  isProgrammaticScroll.current = true;
                  const element = document.querySelector(item.href);

                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                    setActiveSection(item.id);
                    window.setTimeout(() => {
                      isProgrammaticScroll.current = false;
                    }, 1000);
                  }
                }}
                className={`relative shrink-0 snap-start whitespace-nowrap rounded-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all sm:px-5 sm:text-[11px] ${
                  isActive
                    ? "text-[var(--site-sidebar-accent)]"
                    : "text-[var(--site-sidebar-fg)]/70 hover:text-[var(--site-sidebar-accent)]"
                }`}
              >
                {isActive ? (
                  <motion.div
                    layoutId="floating-nav-active"
                    className="absolute inset-0 -z-10 rounded-full border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    transition={{ type: "spring", stiffness: 350, damping: 35 }}
                  />
                ) : null}
                <span>{item.label}</span>
                {isActive ? (
                  <span className="absolute bottom-[5px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--site-sidebar-accent)] shadow-[0_0_12px_var(--site-sidebar-accent)]" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="relative z-10 ml-0 flex w-full shrink-0 items-center justify-end gap-1.5 sm:ml-auto sm:w-auto sm:gap-2">
        <div className="hidden sm:block">
          <ModeToggle />
        </div>

        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--site-button)] px-5 py-2.5 text-sm font-bold uppercase tracking-[0.16em] text-[var(--site-button-text)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_18px_40px_rgba(0,229,255,0.2)] sm:w-auto"
        >
          {dict.nav?.login || "Sign In"}
        </Link>
      </div>
    </motion.header>
  );
}
