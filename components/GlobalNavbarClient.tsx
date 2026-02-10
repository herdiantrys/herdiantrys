"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
    Search, Moon, Sun, ChevronRight, User, Settings, LogOut, Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import NotificationDropdown from "@/components/Notification/NotificationDropdown";

// Types for props
type UserLike = {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
    id?: string;
    username?: string;
    points?: number;
} | null;

type GlobalNavbarClientProps = {
    user: UserLike;
    dict: any;
};

export default function GlobalNavbarClient({ user, dict }: GlobalNavbarClientProps) {


    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { theme, setTheme } = useTheme();

    // Logic: Floating Navbar for Guest on Home (supports /en, /id)
    const isFloatingNav = !user && (pathname === "/" || pathname === "/en" || pathname === "/id");

    // State
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Sync search input with URL
    useEffect(() => {
        const query = searchParams.get("search");
        if (query !== null && pathname === "/projects") {
            setSearchQuery(query);
        } else if (pathname !== "/projects") {
            // Optional: reset search when navigating away from works, 
            // or keep it if you want persistence across pages (usually reset is better unless distinct 'search mode')
            setSearchQuery("");
        }
    }, [searchParams, pathname]);

    // Scroll Effect & Hide/Show Logic
    const [isNavVisible, setIsNavVisible] = useState(true);
    const lastScrollY = useRef(0);
    const isProgrammaticScroll = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 20);

            // Hide on scroll down, show on scroll up (only for floating nav)
            // But skip if we are scrolling programmatically (e.g. clicking a menu link)
            if (isFloatingNav && currentScrollY > 100 && !isProgrammaticScroll.current) {
                if (currentScrollY > lastScrollY.current) {
                    setIsNavVisible(false); // Scrolling down
                } else {
                    setIsNavVisible(true);  // Scrolling up
                }
            } else if (!isFloatingNav || currentScrollY <= 100) {
                setIsNavVisible(true); // Always visible at top or if not floating
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isFloatingNav]);

    // Helper: Generate Breadcrumbs
    const getBreadcrumbs = () => {
        if (!pathname || pathname === "/") return [];
        const rawPaths = pathname.split("/").filter(Boolean);
        const breadcrumbs: { href: string; label: string }[] = [];

        let accumulateHref = "";

        rawPaths.forEach((path) => {
            accumulateHref += `/${path}`;
            if (path.toLowerCase() !== "en" && path.toLowerCase() !== "id") {
                let label = path.charAt(0).toUpperCase() + path.slice(1);
                // Replace dashes with spaces for nicer presentation
                label = label.replace(/-/g, " ");
                breadcrumbs.push({
                    href: accumulateHref,
                    label
                });
            }
        });

        return breadcrumbs;
    };
    const breadcrumbs = getBreadcrumbs();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/works?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <motion.header
            initial={isFloatingNav ? { y: -100, opacity: 0 } : { opacity: 1 }}
            animate={{
                y: isFloatingNav ? (isNavVisible ? 0 : -200) : 0,
                opacity: 1
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            id="global-navbar"
            style={isFloatingNav ? {} : {
                left: "var(--navbar-left)",
                width: "calc(100% - var(--navbar-left))"
            }}
            className={`
                transition-all duration-500 ease-in-out
                flex items-center justify-between
                ${isFloatingNav
                    ? "fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-2xl border border-white/20 z-50 px-6 py-3"
                    : `fixed top-0 right-0 h-[74px] px-8 z-40 ${scrolled
                        ? "bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-white/5 shadow-sm"
                        : "bg-transparent border-b border-transparent"
                    }`
                }
            `}
        >
            {/* Left: Breadcrumbs (Redesigned) */}
            {/* Left: Breadcrumbs (Standard) or Menu (Floating) */}
            <nav aria-label="Main Navigation" className="hidden md:flex items-center">
                {isFloatingNav ? (
                    <div className="flex items-center gap-1">
                        {[
                            { label: dict.nav.home || "Home", href: "#hero" },
                            { label: dict.nav.works || "Portfolio", href: "#portfolio" },
                            { label: dict.nav.services || "Services", href: "#services" },
                            { label: "About", href: "#about" },
                            { label: dict.nav.contact || "Contact", href: "#contact" },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    isProgrammaticScroll.current = true; // Set flag
                                    const element = document.querySelector(item.href);
                                    if (element) {
                                        element.scrollIntoView({ behavior: "smooth" });
                                        // Reset flag after animation
                                        setTimeout(() => {
                                            isProgrammaticScroll.current = false;
                                        }, 1000);
                                    }
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-600 dark:hover:text-white transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {breadcrumbs.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm"
                            >
                                <Link href="/" className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all group">
                                    <HomeIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                </Link>

                                {breadcrumbs.map((item, index) => (
                                    <div key={item.href} className="flex items-center">
                                        <ChevronRight className="w-3 h-3 text-muted-foreground/30 mx-1" />
                                        <Link
                                            href={item.href}
                                            className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-300 ${index === breadcrumbs.length - 1
                                                ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                                }`}
                                        >
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                {/* Map common paths to dict labels if available, else plain text */}
                                                {dict?.nav?.[item.label.toLowerCase().replace(/ /g, '-')] || item.label}
                                            </motion.span>
                                        </Link>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </nav>

            {/* Mobile Title (visible if breadcrumbs hidden) */}
            <div className="md:hidden font-bold text-lg">
                {pathname === "/" ? "Home" : breadcrumbs[breadcrumbs.length - 1]?.label || "Menu"}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">

                {/* Search Bar */}
                <form
                    onSubmit={handleSearch}
                    className="relative hidden md:block group"
                >
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-teal-500 transition-colors" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="
                            w-64 pl-10 pr-12 py-2 rounded-full 
                            bg-zinc-100 dark:bg-white/5 
                            border border-transparent focus:border-teal-500/50 
                            outline-none text-sm transition-all
                            placeholder:text-muted-foreground/70
                            focus:w-80 focus:bg-white dark:focus:bg-black
                            focus:shadow-[0_0_20px_rgba(20,184,166,0.1)]
                        "
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </form>

                <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 hidden md:block" />

                {/* Coin Badge (Gamification) */}
                {user && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Coins size={14} className="fill-amber-500/20" />
                        <span className="text-xs font-bold font-mono">{user.points || 0}</span>
                    </div>
                )}

                {/* Notifications */}
                <NotificationDropdown
                    userId={user?.id || ""}
                    dict={dict}
                    isOpen={isNotifOpen}
                    onToggle={() => setIsNotifOpen(!isNotifOpen)}
                    onClose={() => setIsNotifOpen(false)}
                />

                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors relative overflow-hidden"
                >
                    <div className="relative z-10">
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </div>
                </button>

                {/* User Dropdown */}
                {user ? (
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 p-1 pl-2 pr-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all"
                        >
                            <span className="text-sm font-medium hidden sm:block">
                                {user.name?.split(" ")[0]}
                            </span>
                            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white dark:ring-white/10 shadow-sm">
                                {user.image ? (
                                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-teal-500 flex items-center justify-center text-white font-bold">
                                        {(user.name?.[0] || "U").toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-64 p-2 rounded-2xl glass-panel shadow-2xl border border-white/20 dark:border-white/10 z-50 bg-white/80 dark:bg-[#111]/90 backdrop-blur-xl"
                                >
                                    <div className="px-4 py-3 border-b border-zinc-200 dark:border-white/5 mb-1">
                                        <p className="text-sm font-bold text-foreground">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>

                                    <div className="space-y-0.5">
                                        {['admin', 'superadmin'].includes(user.role?.toLowerCase() || '') && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-teal-500/10 hover:text-teal-500 transition-colors"
                                            >
                                                Admin Panel
                                            </Link>
                                        )}
                                        <Link
                                            href={`/user/${user.username || user.id}`}
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <User size={16} /> Profile
                                        </Link>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                                            <Settings size={16} /> Settings
                                        </button>
                                        <div className="h-px bg-zinc-200 dark:bg-white/5 my-1" />
                                        <button
                                            onClick={() => signOut()}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="px-6 py-2 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </motion.header>
    );
}

function HomeIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}
