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
        <div
            className="fixed inset-x-0 z-[100] flex justify-center px-3 lg:hidden"
            style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.85rem)" }}
        >
            <div className="w-full max-w-md">
                <div
                    className="glass-liquid relative flex items-center justify-between overflow-hidden rounded-[2rem] border p-2 backdrop-blur-3xl"
                    style={{
                        borderColor: "var(--glass-border)",
                        boxShadow:
                            "var(--ambient-shadow), 0 10px 34px color-mix(in srgb, var(--site-accent) 12%, transparent)",
                    }}
                >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--site-secondary)]/10 via-[var(--site-accent)]/5 to-[var(--site-secondary)]/10" />

                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-label={item.name}
                                className="group relative flex min-w-0 flex-1 items-center justify-center rounded-[1.5rem] px-2 py-2.5 transition-all duration-300"
                            >
                                {active && (
                                    <motion.div
                                        layoutId="bottom-nav-active"
                                        className="absolute inset-0.5 rounded-[1.35rem] border"
                                        style={{
                                            background: "color-mix(in srgb, var(--site-card) 74%, transparent)",
                                            borderColor: "var(--glass-border)",
                                            boxShadow:
                                                "0 6px 24px color-mix(in srgb, var(--site-accent) 10%, transparent)",
                                        }}
                                        transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                                    />
                                )}

                                <div className="relative z-10 flex flex-col items-center gap-1">
                                    <div className="relative">
                                        <Icon
                                            size={22}
                                            className={`transition-all duration-500 ${active
                                                ? "scale-110 text-[var(--site-secondary)] drop-shadow-[0_0_8px_var(--site-secondary)]"
                                                : "text-[var(--glass-text-muted)] group-hover:text-[var(--foreground)]"
                                                }`}
                                        />

                                        {active && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--site-secondary)] shadow-[0_0_6px_var(--site-secondary)]"
                                            />
                                        )}
                                    </div>

                                    <span
                                        className={`max-w-full truncate text-[10px] font-black uppercase tracking-[0.12em] transition-colors ${active
                                            ? "text-[var(--glass-text)]"
                                            : "text-[var(--glass-text-muted)] group-hover:text-[var(--glass-text)]"
                                            }`}
                                    >
                                        {item.name}
                                    </span>
                                </div>

                                <motion.div
                                    whileTap={{ scale: 0.94, opacity: 0.5 }}
                                    className="absolute inset-0 rounded-[1.5rem]"
                                />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
