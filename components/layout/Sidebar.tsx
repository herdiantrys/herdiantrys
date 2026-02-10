"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, FileText, Briefcase, ShoppingBag,
    Settings, LogOut, Menu, X, FolderOpen, Star, Handshake,
    Mail, Layout, ChevronLeft, ChevronRight, Home, User, ShieldCheck,
    Layers, Bell, MessageSquare
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
        { name: dict.nav.about || "About", href: "/about", icon: User },
        { name: dict.nav.contact || "Contact", href: "/contact", icon: Mail },
    ];

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

    if (user?.role === 'admin' || user?.role === 'superadmin') {
        if (!isAdminSection) {
            publicLinks.push({ name: "Admin Panel", href: "/admin", icon: ShieldCheck });
            // Add all admin links except the dashboard (which is redundant with Admin Panel)
            adminLinks.forEach(link => {
                if (link.href !== "/admin") {
                    publicLinks.push(link);
                }
            });
        }
    }

    const currentLinks = isAdminSection ? adminLinks : publicLinks;

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
                className="lg:hidden fixed top-4 left-4 z-[101] p-2 glass rounded-lg text-[var(--glass-text)] hover:bg-[var(--glass-border)] transition-colors"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container - Exact AdminSidebar styling */}
            <aside
                id="sidebar"
                className={`
                    fixed top-0 left-0 z-[100] h-screen glass border-r-0 text-[var(--glass-text)] transition-all duration-300 ease-in-out
                    ${isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:z-40"}
                    ${isExpanded ? "lg:w-64" : "lg:w-20"}
                `}
            >
                <div className="flex flex-col h-full bg-white/5 dark:bg-black/20 backdrop-blur-md relative">

                    {/* Desktop Toggle Button */}
                    <button
                        id="sidebar-desktop-toggle"
                        onClick={() => setIsCollapsed(!isCollapsed)} // Toggle collapse
                        className="hidden lg:flex absolute -right-4 top-24 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-full p-2 shadow-md hover:scale-110 transition-transform z-50"
                    >
                        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>

                    {/* Header */}
                    <div className="h-[74px] flex items-center justify-center border-b border-[var(--glass-border)] transition-all duration-300 overflow-hidden">
                        <Link href="/" className="block relative">
                            <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500 whitespace-nowrap transition-all duration-300 ${!isExpanded ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}>
                                {isAdminSection ? "AdminPanel" : "Herdiant"}
                            </span>
                            {!isExpanded && (
                                <span className="text-xl font-bold text-teal-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                    {isAdminSection ? "AP" : "H"}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 overflow-y-auto py-4 space-y-1 overflow-x-hidden custom-scrollbar">
                        {currentLinks.map((item) => {
                            const active = isActive(item.href);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={!isExpanded ? item.name : ""}
                                    onClick={() => setIsOpen(false)} // Close mobile on click
                                    className={`
                                        flex items-center px-4 py-3 mx-2 rounded-xl transition-all group relative duration-200
                                        ${active
                                            ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-400 border border-teal-500/30 shadow-[0_0_20px_-5px_rgba(45,212,191,0.3)] backdrop-blur-sm"
                                            : "hover:bg-[var(--glass-border)] text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] border border-transparent"
                                        }
                                    `}
                                >
                                    <div className="relative">
                                        <Icon size={20} className={`min-w-[20px] ${active ? "text-teal-400" : "text-[var(--glass-text-muted)] group-hover:text-[var(--glass-text)]"}`} />
                                        {/* Unread Badge */}
                                        {isAdminSection && item.name === "Contacts" && unreadCount > 0 && (
                                            <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg ${!isExpanded ? "lg:top-0 lg:right-0 lg:scale-75" : ""}`}>
                                                {unreadCount > 99 ? "99+" : unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    <span
                                        className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 ${!isExpanded ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"}`}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-[var(--glass-border)] overflow-hidden">
                        {isAdminSection ? (
                            <Link
                                href="/dashboard"
                                className="flex items-center px-4 py-3 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors group text-red-400/80 whitespace-nowrap"
                            >
                                <LogOut size={20} className="min-w-[20px]" />
                                <span className={`ml-3 font-medium transition-all duration-300 ${!isExpanded ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"}`}>Exit Admin</span>
                            </Link>
                        ) : (
                            <button
                                onClick={() => signOut()}
                                className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors group text-red-400/80 whitespace-nowrap"
                            >
                                <LogOut size={20} className="min-w-[20px]" />
                                <span className={`ml-3 font-medium transition-all duration-300 ${!isExpanded ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"}`}>Log Out</span>
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
