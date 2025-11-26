"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
};

export default function GlobalNavbarClient({ user }: NavbarClientProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Do not render on the home page, login, or register
    if (pathname === "/" || pathname === "/login" || pathname === "/register") return null;

    const handleThemeToggle = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    if (!mounted) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            <div className="w-full px-6 py-4 bg-white/25 dark:bg-black/25 glass backdrop-blur-xl shadow-lg border-b border-[var(--glass-border)]">
                <div className="container mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold tracking-tighter">
                        <span className="text-gradient">Herdian</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/dashboard" className={`text-sm font-medium transition-colors ${pathname === "/dashboard" ? "text-[var(--glass-text)]" : "text-[var(--glass-text-muted)] hover:text-[var(--glass-text)]"}`}>
                            Home
                        </Link>
                        <Link href="/works" className={`text-sm font-medium transition-colors ${pathname.startsWith("/works") ? "text-[var(--glass-text)]" : "text-[var(--glass-text-muted)] hover:text-[var(--glass-text)]"}`}>
                            Works
                        </Link>
                        <Link href="/about" className={`text-sm font-medium transition-colors ${pathname.startsWith("/about") ? "text-[var(--glass-text)]" : "text-[var(--glass-text-muted)] hover:text-[var(--glass-text)]"}`}>
                            About
                        </Link>
                        <Link href="/contact" className={`text-sm font-medium transition-colors ${pathname.startsWith("/contact") ? "text-[var(--glass-text)]" : "text-[var(--glass-text-muted)] hover:text-[var(--glass-text)]"}`}>
                            Contact
                        </Link>

                        {/* Search Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--glass-text-muted)]">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-1.5 rounded-full bg-[var(--glass-bg)]/50 border border-[var(--glass-border)] text-sm text-[var(--glass-text)] focus:outline-none focus:border-teal-500/50 focus:bg-[var(--glass-bg)] transition-all w-48 focus:w-64"
                            />
                        </div>

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
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                            className="absolute right-0 mt-4 w-64 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md shadow-xl overflow-hidden py-2 z-50"
                                        >
                                            <div className="px-4 py-3 border-b border-[var(--glass-border)]/50 mb-2">
                                                <p className="text-sm font-bold text-[var(--glass-text)] truncate">{user.name}</p>
                                                <p className="text-xs text-[var(--glass-text-muted)] truncate">{user.email}</p>
                                            </div>

                                            <Link
                                                href={user.username ? `/user/${user.username}` : "/profile"}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--glass-text)] hover:bg-[var(--glass-border)] transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <User size={16} />
                                                Profile
                                            </Link>

                                            <button
                                                onClick={() => signOut()}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn("google")}
                                className="px-6 py-2 rounded-full font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:shadow-lg transition-all"
                            >
                                Login
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-full hover:bg-[var(--glass-border)] transition-colors text-[var(--glass-text)]"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl md:hidden flex flex-col justify-center items-center"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                        >
                            <X size={32} />
                        </button>

                        <div className="flex flex-col items-center gap-8">
                            {[
                                { href: "/dashboard", label: "Home" },
                                { href: "/works", label: "Works" },
                                { href: "/about", label: "About" },
                                { href: "/contact", label: "Contact" },
                            ].map((link, index) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`text-4xl font-bold tracking-tight transition-colors ${pathname === link.href || pathname.startsWith(link.href) && link.href !== "/dashboard"
                                            ? "text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500"
                                            : "text-white hover:text-teal-400"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}

                            {/* Mobile Search */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ delay: 0.4 }}
                                className="relative w-64 mt-4"
                            >
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 transition-all"
                                />
                            </motion.div>

                            {/* Auth Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ delay: 0.5 }}
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
                                    <div className="flex flex-col items-center gap-4">
                                        <Link
                                            href={user.username ? `/user/${user.username}` : "/profile"}
                                            onClick={() => setIsOpen(false)}
                                            className="text-xl font-medium text-gray-300 hover:text-white transition-colors"
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                signOut();
                                                setIsOpen(false);
                                            }}
                                            className="text-xl font-medium text-red-500 hover:text-red-400 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
