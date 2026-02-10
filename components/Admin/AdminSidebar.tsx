"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileText,
    Briefcase,
    ShoppingBag,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    FolderOpen,
    Star,
    Handshake,
    Mail,
    Layout,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { getUnreadMessageCount } from "@/lib/actions/contact.actions";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Portfolio", href: "/admin/content", icon: Layout },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Projects", href: "/admin/projects", icon: FolderOpen },
    { name: "Posts", href: "/admin/posts", icon: FileText },
    { name: "Services", href: "/admin/services", icon: Briefcase },
    { name: "Partners", href: "/admin/partners", icon: Handshake },
    { name: "Testimonials", href: "/admin/testimonials", icon: Star },
    { name: "Shop", href: "/admin/shop", icon: ShoppingBag },
    { name: "Contacts", href: "/admin/contacts", icon: Mail },
];

type AdminSidebarProps = {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
};

export default function AdminSidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: AdminSidebarProps) {
    const pathname = usePathname();
    const normalizedPath = pathname?.replace(/^\/[a-z]{2}/, "") || "/";
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            const res = await getUnreadMessageCount();
            if (res.success) {
                setUnreadCount(res.count);
            }
        };
        fetchUnread();

        // Poll every 30 seconds
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                id="admin-mobile-toggle"
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-20 left-4 z-[101] p-2 glass rounded-lg text-[var(--glass-text)] hover:bg-[var(--glass-border)] transition-colors"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <aside
                id="admin-sidebar"
                className={`
                    fixed top-0 left-0 z-[100] h-screen glass border-r-0 text-[var(--glass-text)] transition-all duration-300 ease-in-out
                    ${isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:z-40"}
                    ${!isCollapsed ? "lg:w-64" : "lg:w-20"}
                `}
            >
                <div className="flex flex-col h-full bg-white/5 dark:bg-black/20 backdrop-blur-md relative">

                    {/* Desktop Toggle Button */}
                    <button
                        id="admin-sidebar-toggle"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex absolute -right-4 top-24 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-full p-2 shadow-md hover:scale-110 transition-transform z-50"
                    >
                        {!isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>

                    {/* Header */}
                    <div className="h-[74px] flex items-center justify-center border-b border-[var(--glass-border)] transition-all duration-300 overflow-hidden">
                        <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500 whitespace-nowrap transition-all duration-300 ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
                            AdminPanel
                        </span>
                        {isCollapsed && (
                            <span className="text-xl font-bold text-teal-500 absolute">AP</span>
                        )}
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 overflow-y-auto py-4 space-y-1 overflow-x-hidden">
                        {menuItems.map((item) => {
                            const isActive = normalizedPath === item.href || (item.href !== "/admin" && normalizedPath.startsWith(item.href));
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    id={`admin-nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                                    href={item.href}
                                    title={isCollapsed ? item.name : ""}
                                    className={`
                                        flex items-center px-4 py-3 mx-2 rounded-xl transition-all group relative duration-200
                                        ${isActive
                                            ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-400 border border-teal-500/30 shadow-[0_0_20px_-5px_rgba(45,212,191,0.3)] backdrop-blur-sm"
                                            : "hover:bg-[var(--glass-border)] text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] border border-transparent"
                                        }
                                    `}
                                >
                                    <div className="relative">
                                        <Icon size={20} className={`min-w-[20px] ${isActive ? "text-teal-400" : "text-[var(--glass-text-muted)] group-hover:text-[var(--glass-text)]"}`} />
                                        {item.name === "Contacts" && unreadCount > 0 && (
                                            <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg ${isCollapsed ? "lg:top-0 lg:right-0 lg:scale-75" : ""}`}>
                                                {unreadCount > 99 ? "99+" : unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    <span
                                        className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"
                                            }`}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-[var(--glass-border)] overflow-hidden">
                        <Link id="admin-exit-button" href="/dashboard" className="flex items-center px-4 py-3 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors group text-red-400/80 whitespace-nowrap">
                            <LogOut size={20} className="min-w-[20px]" />
                            <span className={`ml-3 font-medium transition-all duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100 w-auto"}`}>Exit Admin</span>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
