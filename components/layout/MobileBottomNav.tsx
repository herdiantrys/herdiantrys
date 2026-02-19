"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User, Briefcase } from "lucide-react";

type NavItem = {
    name: string;
    href: string;
    icon: any;
};

export default function MobileBottomNav({ user, dict }: { user: any; dict: any }) {
    const pathname = usePathname() || "";
    // Normalize path to ignore locale prefix (e.g. /en/dashboard -> /dashboard)
    const normalizedPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";

    const navItems: NavItem[] = [
        { name: "Home", href: "/dashboard", icon: Home },
        { name: "Search", href: "/search", icon: Search },
        { name: "Projects", href: "/projects", icon: Briefcase },
        { name: "Profile", href: user ? `/profile/${user.username || user.id}` : "/login", icon: User },
    ];

    const isActive = (href: string) => {
        if (href === "/dashboard") return normalizedPath === "/dashboard" || normalizedPath === "/";
        return normalizedPath.startsWith(href);
    };

    return (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md">
            <div className="glass-liquid backdrop-blur-3xl rounded-[30px] p-2 flex items-center justify-around relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20">
                {/* Background Ambient Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--site-secondary)]/10 via-[var(--site-accent)]/5 to-[var(--site-secondary)]/10 pointer-events-none" />

                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-14 h-14 transition-all duration-300 group"
                        >
                            {/* Active Indicator Background */}
                            {active && (
                                <motion.div
                                    layoutId="bottom-nav-active"
                                    className="absolute inset-1 bg-white/10 dark:bg-white/5 border border-white/20 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                                    transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                                />
                            )}

                            {/* Icon Container */}
                            <div className="relative z-10">
                                <Icon
                                    size={24}
                                    className={`transition-all duration-500 ${active
                                        ? "text-[var(--site-secondary)] scale-110 drop-shadow-[0_0_8px_var(--site-secondary)]"
                                        : "text-zinc-400 group-hover:text-zinc-200"
                                        }`}
                                />

                                {/* Dot Indicator Under Active Icon */}
                                {active && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--site-secondary)] shadow-[0_0_6px_var(--site-secondary)]"
                                    />
                                )}
                            </div>

                            {/* Tap Ripple Effect */}
                            <motion.div
                                whileTap={{ scale: 0.9, opacity: 0.5 }}
                                className="absolute inset-0 rounded-2xl"
                            />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
