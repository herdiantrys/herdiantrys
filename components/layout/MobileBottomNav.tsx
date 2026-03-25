"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Briefcase, type LucideIcon } from "lucide-react";

type NavItem = {
    name: string;
    href: string;
    icon: LucideIcon;
};

type MobileBottomNavUser = {
    username?: string | null;
    id?: string | null;
} | null;

type MobileBottomNavDict = {
    nav?: {
        home?: string;
        projects?: string;
        profile?: string;
    };
};

export default function MobileBottomNav({ user, dict }: { user: MobileBottomNavUser; dict: MobileBottomNavDict }) {
    const pathname = usePathname() || "";
    // Normalize path to ignore locale prefix (e.g. /en/dashboard -> /dashboard)
    const normalizedPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";

    const navItems: NavItem[] = [
        { name: dict.nav?.home || "Home", href: "/dashboard", icon: Home },
        { name: dict.nav?.projects || "Works", href: "/projects", icon: Briefcase },
        { name: dict.nav?.profile || "Profile", href: user ? `/profile/${user.username || user.id}` : "/login", icon: User },
    ];

    const isActive = (href: string) => {
        if (href === "/dashboard") return normalizedPath === "/dashboard" || normalizedPath === "/";
        return normalizedPath.startsWith(href);
    };

    return (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md">
            <div
                className="glass-liquid relative flex items-center justify-around overflow-hidden rounded-[30px] border p-2 backdrop-blur-3xl"
                style={{
                    borderColor: "var(--glass-border)",
                    boxShadow:
                        "var(--ambient-shadow), 0 10px 34px color-mix(in srgb, var(--site-accent) 12%, transparent)",
                }}
            >
                {/* Background Ambient Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--site-secondary)]/10 via-[var(--site-accent)]/5 to-[var(--site-secondary)]/10 pointer-events-none" />

                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-label={item.name}
                            className="relative flex flex-col items-center justify-center w-14 h-14 transition-all duration-300 group"
                        >
                            {/* Active Indicator Background */}
                            {active && (
                                <motion.div
                                    layoutId="bottom-nav-active"
                                    className="absolute inset-1 rounded-2xl border"
                                    style={{
                                        background: "color-mix(in srgb, var(--site-card) 74%, transparent)",
                                        borderColor: "var(--glass-border)",
                                        boxShadow:
                                            "0 6px 24px color-mix(in srgb, var(--site-accent) 10%, transparent)",
                                    }}
                                    transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                                />
                            )}

                            {/* Icon Container */}
                            <div className="relative z-10">
                                <Icon
                                    size={24}
                                    className={`transition-all duration-500 ${active
                                        ? "text-[var(--site-secondary)] scale-110 drop-shadow-[0_0_8px_var(--site-secondary)]"
                                        : "text-[var(--glass-text-muted)] group-hover:text-[var(--foreground)]"
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
