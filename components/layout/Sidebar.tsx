"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, FileText, Briefcase, ShoppingBag,
    Settings, LogOut, Menu, X, FolderOpen, Star, Handshake,
    Mail, Layout, ChevronLeft, ChevronRight, Home, User, ShieldCheck,
    Layers, Bell, MessageSquare, Search
} from "lucide-react";
import { getUnreadMessageCount } from "@/lib/actions/contact.actions";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";

type SidebarProps = {
    dict: any;
    isOpen: boolean; // Mobile toggle
    setIsOpen: (value: boolean) => void;
    user: any;
    isCollapsed: boolean; // Desktop collapse state
    setIsCollapsed: (value: boolean) => void;
};

export default function Sidebar({ dict, isOpen, setIsOpen, user, isCollapsed, setIsCollapsed }: SidebarProps) {
    const pathname = usePathname() || "";
    const [unreadCount, setUnreadCount] = useState(0);
    const isAdminSection = pathname.startsWith("/admin");

    // Invert isCollapsed for AdminSidebar style logic (where "isOpen" usually meant expanded)
    // AdminSidebar: isOpen=true (expanded), isOpen=false (collapsed)
    const isExpanded = !isCollapsed;

    useEffect(() => {
        if (!isAdminSection) return;
        const fetchUnread = async () => {
            const res = await getUnreadMessageCount();
            if (res.success) setUnreadCount(res.count);
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, [isAdminSection]);

    // Define Links
    const publicLinks = [
        { name: dict.nav.home || "Home", href: "/dashboard", icon: Home },
        { name: dict.nav.works || "Works", href: "/projects", icon: Briefcase },
        { name: "Search", href: "/search", icon: Search },
    ];

    if (user) {
        publicLinks.push({ name: "Shop", href: "/shop", icon: ShoppingBag });
        publicLinks.push({ name: "Notifications", href: "/notifications", icon: Bell });
        publicLinks.push({ name: "Settings", href: "/settings", icon: Settings });
    }

    publicLinks.push(
        { name: dict.nav.about || "About", href: "/about", icon: User },
        { name: dict.nav.contact || "Contact", href: "/contact", icon: Mail }
    );

    const adminLinks = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Portfolio", href: "/admin/content", icon: Layout },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Projects", href: "/admin/projects", icon: FolderOpen },
        { name: "Categories", href: "/admin/categories", icon: Layers },
        { name: "Posts", href: "/admin/posts", icon: FileText },
        { name: "Comments", href: "/admin/comments", icon: MessageSquare },
        { name: "Notifications", href: "/admin/notifications", icon: Bell },
        { name: "Services", href: "/admin/services", icon: Briefcase },
        { name: "Partners", href: "/admin/partners", icon: Handshake },
        { name: "Testimonials", href: "/admin/testimonials", icon: Star },
        { name: "Shop", href: "/admin/shop", icon: ShoppingBag },
        { name: "Contacts", href: "/admin/contacts", icon: Mail },
    ];

    const userRole = user?.role?.toLowerCase() || "";
    const isAuthorizedAdmin = userRole === 'admin' || userRole === 'superadmin';
    const showAdminSection = isAuthorizedAdmin && !isAdminSection;

    const isActive = (href: string) => {
        if (!isAdminSection && href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
        return pathname?.startsWith(href);
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                id="sidebar-mobile-toggle"
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-[14px] left-4 z-[101] p-3 bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl rounded-full text-gray-700 dark:text-white hover:bg-white/20 shadow-xl transition-all border border-white/20"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container - Fullscreen on Mobile / Liquid Glass on Desktop */}
            <aside
                id="sidebar"
                className={`
                    fixed top-0 left-0 z-[100] h-screen text-[var(--glass-text)] transition-all duration-300 ease-out bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-white/5 shadow-sm
                    ${isOpen ? "translate-x-0 w-full" : "-translate-x-full lg:translate-x-0 lg:z-40"}
                    ${isExpanded ? "lg:w-64" : "lg:w-20"}
                `}
            >
                <div className="flex flex-col h-full bg-white/50 dark:bg-black/20 relative">

                    {/* Liquid Shine Edge */}
                    <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none z-[120]" />


                    {/* Mobile Close Button - Integrated into Fullscreen */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden absolute top-6 right-6 p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all z-[110]"
                    >
                        <X size={28} />
                    </button>

                    {/* Desktop Toggle Handle - Premium Liquid Glass */}
                    <button
                        id="sidebar-desktop-toggle"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`
                            hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 
                            w-6 h-12 items-center justify-center
                            bg-white/10 dark:bg-black/60 backdrop-blur-3xl 
                            border border-white/20 dark:border-white/10 
                            rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.2)]
                            hover:w-7 hover:-right-4 hover:bg-white/20 
                            transition-all duration-300 ease-out z-[150] group
                        `}
                    >
                        <div className="absolute inset-x-0 inset-y-2 bg-teal-500/0 group-hover:bg-teal-500/10 rounded-lg transition-colors" />
                        <div className={`
                            transform transition-all duration-500 group-hover:scale-110
                            ${isExpanded ? "rotate-0" : "rotate-180"}
                        `}>
                            <ChevronLeft
                                size={14}
                                className="text-white/40 group-hover:text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]"
                            />
                        </div>

                        {/* Interactive Shine Edge */}
                        <div className="absolute inset-y-2 left-0 w-[1.5px] bg-gradient-to-b from-transparent via-teal-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Header */}
                    <div className="h-[80px] sm:h-[74px] flex items-center justify-center border-b border-white/5 transition-all duration-300 overflow-hidden relative group/header">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity" />
                        <Link href="/" onClick={() => setIsOpen(false)} className="block relative z-10">
                            <span className={`text-2xl sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 whitespace-nowrap transition-all duration-300 ${!isExpanded ? "lg:opacity-0 lg:w-0 lg:hidden" : "opacity-100 w-auto"}`}>
                                {isAdminSection ? "AdminPanel" : "Herdiant"}
                            </span>
                            {!isExpanded && (
                                <span className="text-xl font-bold text-teal-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
                                    {isAdminSection ? "AP" : "H"}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 overflow-y-auto py-8 sm:py-4 space-y-2 sm:space-y-1 overflow-x-hidden custom-scrollbar flex flex-col items-center sm:items-stretch">
                        {/* Main Navigation Section Indicator */}
                        {!isAdminSection && (
                            <div className={`px-6 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-500/40 transition-all duration-300 ${!isExpanded ? "lg:opacity-0" : "opacity-100"}`}>
                                {isExpanded ? "Main Menu" : ""}
                            </div>
                        )}

                        <div className="space-y-1 w-full flex flex-col items-center sm:items-stretch">
                            {((isAdminSection ? adminLinks : publicLinks)).map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        title={!isExpanded ? item.name : ""}
                                        onClick={() => setIsOpen(false)} // Close mobile on click
                                        className={`
                                                flex items-center px-8 sm:px-4 py-4 sm:py-3 mx-2 rounded-2xl sm:rounded-xl transition-all group relative duration-300 w-[85%] sm:w-auto
                                                ${active
                                                ? "text-teal-400 font-bold"
                                                : "text-[var(--glass-text-muted)] hover:text-white hover:bg-white/5"
                                            }
                                            `}
                                    >
                                        {/* Active Liquid Indicator - Unified with Admin UI */}
                                        {active && (
                                            <motion.div
                                                layoutId="global-sidebar-active-bg"
                                                className="absolute inset-0 rounded-2xl sm:rounded-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(45,212,191,0.15)] backdrop-blur-md -z-10"
                                                initial={false}
                                                transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                                            />
                                        )}

                                        {/* Liquid Shine Edge for Active Link */}
                                        {active && (
                                            <div className="absolute left-0 top-1/4 bottom-1/4 w-[2.5px] bg-teal-500 rounded-full shadow-[0_0_12px_rgba(20,184,166,0.8)]" />
                                        )}

                                        <div className="relative">
                                            <Icon
                                                size={isExpanded ? 20 : 24}
                                                className={`sm:min-w-[20px] transition-transform duration-300 group-hover:scale-110 ${active ? "text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]" : "opacity-70 group-hover:opacity-100"}`}
                                            />
                                            {/* Unread Badge */}
                                            {isAdminSection && item.name === "Contacts" && unreadCount > 0 && (
                                                <span className={`absolute -top-2 -right-2 bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg ${!isExpanded ? "lg:top-0 lg:right-0 lg:scale-75" : ""}`}>
                                                    {unreadCount > 99 ? "99+" : unreadCount}
                                                </span>
                                            )}
                                        </div>

                                        <span
                                            className={`ml-4 sm:ml-3 text-lg sm:text-sm tracking-tight whitespace-nowrap transition-all duration-300 ${!isExpanded ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"}`}
                                        >
                                            {item.name}
                                        </span>
                                    </Link>

                                );
                            })}
                        </div>


                        {/* Admin Management Section - Grouped under a single expandable or cleaner list */}
                        {showAdminSection && (
                            <>
                                <div className={`px-6 mt-10 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-500/40 transition-all duration-300 ${!isExpanded ? "lg:opacity-0" : "opacity-100"}`}>
                                    {isExpanded ? "Management" : ""}
                                </div>
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center px-8 sm:px-4 py-4 sm:py-3 mx-2 rounded-2xl sm:rounded-xl transition-all group relative duration-200 w-[85%] sm:w-auto hover:bg-white/5 text-[var(--glass-text-muted)] hover:text-teal-400 border border-transparent shadow-sm"
                                >
                                    <ShieldCheck size={24} className="sm:min-w-[20px] sm:w-[20px] sm:h-[20px] transition-transform group-hover:scale-110 text-teal-500/80" />
                                    <span className={`ml-4 sm:ml-3 text-lg sm:text-base font-semibold transition-all duration-300 ${!isExpanded ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
                                        Admin Panel
                                    </span>
                                </Link>

                                {/* Secondary Admin Links - Scaled down for elegance */}
                                <div className={`flex flex-col gap-0.5 mt-2 ${!isExpanded ? "items-center" : ""}`}>
                                    {adminLinks.filter(l => l.href !== "/admin").slice(0, 5).map((item) => { // Show first 5 key links for simplicity
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                title={!isExpanded ? item.name : ""}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center px-8 sm:px-4 py-3 sm:py-2.5 mx-2 rounded-2xl sm:rounded-xl transition-all group relative duration-200 w-[85%] sm:w-auto hover:bg-white/5 text-[var(--glass-text-muted)] hover:text-teal-400/80 border border-transparent"
                                            >
                                                <Icon size={isExpanded ? 18 : 22} className="sm:min-w-[18px] transition-transform group-hover:scale-105 opacity-70 group-hover:opacity-100" />
                                                <span className={`ml-4 sm:ml-3 text-base sm:text-sm font-medium transition-all duration-300 ${!isExpanded ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
                                                    {item.name}
                                                </span>
                                            </Link>
                                        );
                                    })}

                                    {/* 'More' link if condensed */}
                                    {isExpanded && (
                                        <Link href="/admin" className="ml-11 mt-2 text-xs font-medium text-teal-500/60 hover:text-teal-500 hover:underline transition-all">
                                            View all management tools...
                                        </Link>
                                    )}
                                </div>
                            </>
                        )}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/5 flex flex-col items-center sm:items-stretch overflow-hidden bg-black/10">
                        {isAdminSection ? (
                            <Link
                                href="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-8 sm:px-4 py-4 sm:py-3 rounded-2xl sm:rounded-xl hover:bg-white/5 text-red-400 border border-transparent hover:border-red-500/20 transition-all group whitespace-nowrap w-[85%] sm:w-auto"
                            >
                                <LogOut size={24} className="sm:min-w-[20px] sm:w-[20px] sm:h-[20px] transition-transform group-hover:-translate-x-1" />
                                <span className={`ml-4 sm:ml-3 text-lg sm:text-base font-medium transition-all duration-300 ${!isExpanded ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"}`}>Exit Admin</span>
                            </Link>
                        ) : (
                            <button
                                onClick={() => { setIsOpen(false); signOut(); }}
                                className="w-[85%] sm:w-auto flex items-center px-8 sm:px-4 py-4 sm:py-3 rounded-2xl sm:rounded-xl hover:bg-white/5 text-red-400 border border-transparent hover:border-red-500/20 transition-all group whitespace-nowrap"
                            >
                                <LogOut size={24} className="sm:min-w-[20px] sm:w-[20px] sm:h-[20px] transition-transform group-hover:-translate-x-1" />
                                <span className={`ml-4 sm:ml-3 text-lg sm:text-base font-medium transition-all duration-300 ${!isExpanded ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"}`}>Log Out</span>
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
