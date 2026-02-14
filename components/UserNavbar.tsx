"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, User, LogOut, Settings, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signOut } from "next-auth/react";

type UserLike = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
} | null;

type NavbarClientProps = {
  user: UserLike;
  dict: any;
};

export default function UserNavbar({ user, dict }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("#hero");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Create navLinks inside component to access dict
  const navLinks = [
    { name: dict.nav.home, href: "#hero" },
    { name: dict.nav.works, href: "#portfolio" },
    { name: dict.nav.about, href: "#about" },
    { name: dict.nav.contact, href: "#contact" },
  ];

  // Memoize sections to avoid unnecessary re-renders in the effect
  const sections = useMemo(() => navLinks.map(link => link.href), [navLinks]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active section tracking
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -35% 0px", // Adjusted for better accuracy
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length > 0) {
        setActiveSection(`#${visible[0].target.id}`);
      } else if (window.scrollY < 100) {
        // Fallback for top of page
        setActiveSection("#hero");
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((section) => {
      try {
        const element = document.querySelector(section);
        if (element) observer.observe(element);
      } catch (e) {
        console.warn("Invalid selector:", section);
      }
    });

    // Handle bottom of page detection
    const handleScrollBottom = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // If we're at the bottom of the page (within 50px)
      if (windowHeight + scrollTop >= documentHeight - 50) {
        setActiveSection("#contact");
      }
    };

    window.addEventListener("scroll", handleScrollBottom);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScrollBottom);
    };
  }, [sections]);

  const handleThemeToggle = () => {
    document.body.classList.add("theming");
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => {
      document.body.classList.remove("theming");
    }, 300);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      setIsOpen(false);
      setActiveSection(href);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <nav
        id="user-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out transform translate-y-0 opacity-100 ${scrolled ? "py-4" : "py-6"}`}
      >
        <div className="container mx-auto px-6">
          <div
            className={`glass-liquid rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? "shadow-lg" : ""}`}
          >
            {/* Logo */}
            <Link id="navbar-logo" href="/" className="text-2xl font-bold tracking-tighter">
              <span className="text-gradient">Herdian</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`text-sm font-medium transition-colors relative group ${activeSection === link.href
                    ? "text-[var(--glass-text)]"
                    : "text-[var(--glass-text-muted)] hover:text-[var(--glass-text)]"
                    }`}
                >
                  {link.name}
                  {activeSection === link.href && (
                    <motion.span
                      layoutId="activeSection"
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[var(--site-accent-prev)] to-[var(--site-accent-next)]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  {/* Hover effect for non-active links */}
                  {activeSection !== link.href && (
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--site-accent-prev)]/50 to-[var(--site-accent-next)]/50 transition-all duration-300 group-hover:w-full" />
                  )}
                </a>
              ))}

              {/* User area */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    id="user-menu-button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-[var(--glass-border)] transition-colors border border-transparent hover:border-[var(--glass-border)]"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--site-accent-prev)] to-[var(--site-accent-next)] flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/10">
                      {user.image ? (
                        <img src={user.image} alt={user.name || "User"} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (user.name?.[0] || "U").toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-medium text-[var(--glass-text)] hidden sm:block">
                      {user.name?.split(" ")[0] || dict.nav.account}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        id="user-dropdown-menu"
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="glass-liquid absolute right-0 mt-4 w-72 overflow-hidden z-50 ring-1 ring-black/5 dark:ring-white/10"
                      >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                        </div>

                        <div className="p-2 space-y-1">
                          <Link
                            id="dropdown-item-profile"
                            href={user.username ? `/user/${user.username}` : "/profile"}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <div className="p-2 rounded-lg bg-[var(--site-accent)]/10 text-[var(--site-accent)] group-hover:bg-[var(--site-accent)]/20 transition-colors">
                              <User size={18} />
                            </div>
                            {dict.nav.profile}
                          </Link>

                          <button
                            id="dropdown-item-settings"
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                          >
                            <div className="p-2 rounded-lg bg-[var(--site-accent-next)]/10 text-[var(--site-accent-next)] group-hover:bg-[var(--site-accent-next)]/20 transition-colors">
                              <Settings size={18} />
                            </div>
                            Settings
                          </button>

                          {/* Theme Toggle Item */}
                          <div id="dropdown-item-theme-container" className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 rounded-xl transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                              </div>
                              <span>Dark Mode</span>
                            </div>

                            <button
                              id="dropdown-theme-toggle"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent closing dropdown
                                handleThemeToggle();
                              }}
                              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-[var(--site-accent)]' : 'bg-gray-600'}`}
                            >
                              <motion.div
                                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md"
                                animate={{ x: theme === 'dark' ? 20 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="h-px bg-white/5 my-1 mx-2" />

                        <div className="p-2">
                          <button
                            id="dropdown-item-logout"
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group"
                          >
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500/20 transition-colors">
                              <LogOut size={18} />
                            </div>
                            {dict.nav.logout}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  id="nav-login-button"
                  href="/login"
                  className="relative px-6 py-2 rounded-full font-medium text-[var(--glass-text)] dark:text-white transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_20px_rgba(32,178,170,0.5)] bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/20 overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <span className="relative z-10 text-gradient">{dict.nav.login}</span>
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-full hover:bg-[var(--glass-border)] transition-colors text-[var(--glass-text)]"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                id="mobile-menu-toggle"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-[var(--glass-border)] transition-colors text-[var(--glass-text)]"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-3xl md:hidden flex flex-col justify-center items-center"
          >
            {/* Close Button */}
            <button
              id="mobile-menu-close"
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-white"
            >
              <X size={32} />
            </button>

            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <a
                    id={`mobile-nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className={`text-4xl font-bold tracking-tight transition-colors ${activeSection === link.href
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-[var(--site-accent-prev)] to-[var(--site-accent-next)]"
                      : "text-white hover:text-[var(--site-accent)]"
                      }`}
                  >
                    {link.name}
                  </a>
                </motion.div>
              ))}

              {/* Auth Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                {!user ? (
                  <button
                    id="mobile-nav-login"
                    onClick={() => {
                      signIn("google", { callbackUrl: "/dashboard" });
                      setIsOpen(false);
                    }}
                    className="px-8 py-3 rounded-full font-bold text-lg text-black bg-white hover:bg-gray-200 transition-colors"
                  >
                    {dict.nav.login}
                  </button>
                ) : (
                  <button
                    id="mobile-nav-logout"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="text-xl font-medium text-red-500 hover:text-red-400 transition-colors"
                  >
                    {dict.nav.logout}
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}