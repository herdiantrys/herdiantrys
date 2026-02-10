
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, Sun, Moon, User, LogOut, Settings, Bell, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signOut } from "next-auth/react";
import NotificationDropdown from "@/components/Notification/NotificationDropdown";
import { usePathname, useRouter } from "next/navigation";

type UserLike = {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    id?: string | null; // Added id
    role?: string | null; // Added role
} | null;

type TopBarProps = {
    user: UserLike;
    dict: any;
    onMenuClick: () => void;
};

export default function TopBar({ user, dict, onMenuClick }: TopBarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            console.log("[TopBar] Search triggered:", searchQuery);

            // Extract language from current pathname (e.g., "/en/..." -> "en")
            const pathParts = pathname.split('/').filter(Boolean);
            const lang = (pathParts[0] === 'en' || pathParts[0] === 'id') ? pathParts[0] : 'en';

            const url = `/${lang}/search?q=${encodeURIComponent(searchQuery)}`;
            console.log("[TopBar] Navigating to:", url);
            router.push(url);
        }
    };

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false); // Added state
    const { theme, setTheme } = useTheme();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
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

    const handleThemeToggle = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    // Breadcrumb logic
    const getBreadcrumbs = () => {
        if (pathname === "/") return "Home";
        return pathname.split("/").filter(Boolean).map(segment =>
            segment.charAt(0).toUpperCase() + segment.slice(1)
        ).join("  >  ");
    };

    return (
        <header className="sticky top-0 z-30 h-20 w-full bg-white/50 dark:bg-black/20 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 flex items-center justify-between px-6 md:px-8 transition-colors">
            <div className="flex items-center gap-6">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
                >
                    <Menu size={22} className="text-gray-800 dark:text-gray-200" />
                </button>

                {/* Dynamic Breadcrumb */}
                <div className="hidden md:flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Location</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                        <span className="opacity-50">App</span>
                        <span className="text-teal-500">/</span>
                        <span>{getBreadcrumbs()}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="hidden md:flex items-center relative mr-2 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="bg-gray-100 dark:bg-white/5 border border-transparent focus:border-teal-500/30 rounded-full pl-9 pr-4 py-2 text-sm w-48 focus:w-60 transition-all focus:outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                    />
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={handleThemeToggle}
                    className="w-10 h-10 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:scale-105 transition-all shadow-sm"
                >
                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                {/* Notifications */}
                <NotificationDropdown
                    userId={user?.id || ""}
                    dict={dict}
                    isOpen={isNotifOpen}
                    onToggle={() => setIsNotifOpen(!isNotifOpen)}
                    onClose={() => setIsNotifOpen(false)}
                />

                {/* Separator */}
                <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-2 hidden sm:block"></div>

                {/* User Menu */}
                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:border-teal-500/30 transition-all hover:shadow-md group"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-500 p-[2px] group-hover:rotate-12 transition-transform">
                                <div className="w-full h-full rounded-full bg-white dark:bg-black overflow-hidden relative">
                                    {user.image ? (
                                        <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-teal-600 font-bold bg-teal-50">
                                            {user.name?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-left hidden sm:block pr-2">
                                <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight">{user.name?.split(" ")[0]}</p>
                                <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Online</p>
                            </div>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95, rotateX: -10 }}
                                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95, rotateX: 10 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    style={{ transformOrigin: "top right" }}
                                    className="absolute right-0 mt-3 w-72 glass-liquid rounded-3xl shadow-2xl p-2 z-50 ring-1 ring-white/20 dark:ring-white/5"
                                >
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-white/5 dark:to-white/0 mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                                                {user.image && <img src={user.image} className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-base">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Link
                                            href={user.username ? `/user/${user.username}` : "/profile"}
                                            className="flex items-center gap-3 px-4 py-3 text-sm rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-200 font-medium"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <div className="p-2 rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400"><User size={16} /></div>
                                            My Profile
                                        </Link>
                                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-200 font-medium">
                                            <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"><Settings size={16} /></div>
                                            Settings
                                        </button>
                                        <div className="h-px bg-gray-200 dark:bg-white/5 my-1 mx-2" />
                                        <button
                                            onClick={() => signOut()}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors text-red-600 dark:text-red-400 font-bold"
                                        >
                                            <div className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"><LogOut size={16} /></div>
                                            Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <button
                        onClick={() => signIn("google")}
                        className="px-6 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                    >
                        {dict.nav.login}
                    </button>
                )}
            </div>
        </header>
    );
}
