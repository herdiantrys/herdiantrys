"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, User, LogOut, Settings } from "lucide-react";
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
};

const navLinks = [
  { name: "Home", href: "#hero" },
  { name: "Portfolio", href: "#portfolio" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export default function UserNavbar({ user }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("#hero");

  // Memoize sections to avoid unnecessary re-renders in the effect
  const sections = useMemo(() => navLinks.map(link => link.href), []);

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
      const element = document.querySelector(section);
      if (element) observer.observe(element);
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out transform translate-y-0 opacity-100 ${scrolled ? "py-4" : "py-6"}`}
      >
        <div className="container mx-auto px-6">
          <div
            className={`rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300 bg-white/25 dark:bg-black/25 glass ${scrolled ? "backdrop-blur-xl shadow-lg" : "backdrop-blur-md"
              }`}
          >
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold tracking-tighter">
              <span className="text-gradient">Herdian</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
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
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  {/* Hover effect for non-active links */}
                  {activeSection !== link.href && (
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500/50 to-cyan-500/50 transition-all duration-300 group-hover:w-full" />
                  )}
                </a>
              ))}

              {/* Theme Toggle */}
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-full hover:bg-[var(--glass-border)] transition-colors text-[var(--glass-text)]"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* User area */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-[var(--glass-border)] transition-colors border border-transparent hover:border-[var(--glass-border)]"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold shadow-lg">
                      {user.image ? (
                        <img src={user.image} alt={user.name || "User"} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (user.name?.[0] || "U").toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-medium text-[var(--glass-text)] hidden sm:block">
                      {user.name?.split(" ")[0] || "Account"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9, rotateX: -15 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9, rotateX: -15 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          mass: 0.8
                        }}
                        style={{ transformOrigin: "top right" }}
                        className="absolute right-0 mt-6 w-64 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden py-2 z-50 ring-1 ring-white/10"
                      >
                        <div className="px-4 py-3 border-b border-[var(--glass-border)]/50 mb-2 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
                          <p className="text-sm font-bold text-[var(--glass-text)] truncate">{user.name}</p>
                          <p className="text-xs text-[var(--glass-text-muted)] truncate">{user.email}</p>
                        </div>

                        <Link
                          href={user.username ? `/user/${user.username}` : "/profile"}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--glass-text)] hover:bg-[var(--glass-border)] transition-all duration-200 group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <div className="p-1.5 rounded-lg bg-teal-500/10 group-hover:bg-teal-500/20 transition-colors text-teal-500">
                            <User size={16} />
                          </div>
                          Profile
                        </Link>

                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            // Add settings logic here if needed
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--glass-text)] hover:bg-[var(--glass-border)] transition-all duration-200 text-left group"
                        >
                          <div className="p-1.5 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors text-cyan-500">
                            <Settings size={16} />
                          </div>
                          Settings
                        </button>

                        <div className="h-px bg-[var(--glass-border)]/50 my-2 mx-4" />

                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-all duration-200 text-left group"
                        >
                          <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors text-red-500">
                            <LogOut size={16} />
                          </div>
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  href="/login"
                  className="relative px-6 py-2 rounded-full font-medium text-[var(--glass-text)] dark:text-white transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_20px_rgba(32,178,170,0.5)] bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/20 overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <span className="relative z-10 text-gradient">Login</span>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-3xl md:hidden flex flex-col justify-center items-center"
          >
            {/* Close Button */}
            <button
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
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className={`text-4xl font-bold tracking-tight transition-colors ${activeSection === link.href
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500"
                      : "text-white hover:text-teal-400"
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
                    onClick={() => {
                      signIn("google");
                      setIsOpen(false);
                    }}
                    className="px-8 py-3 rounded-full font-bold text-lg text-black bg-white hover:bg-gray-200 transition-colors"
                  >
                    Login
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="text-xl font-medium text-red-500 hover:text-red-400 transition-colors"
                  >
                    Logout
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