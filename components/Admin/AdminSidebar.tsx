"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileText,
    Briefcase,
    ShoppingBag,
    LogOut,
    FolderOpen,
    Star,
    Handshake,
    Mail,
    Layout,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Palette,
    Layers,
    ChevronDown,
    FolderKanban,
    Menu,
    X,
} from "lucide-react";
import { getUnreadMessageCount } from "@/lib/actions/contact.actions";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = {
    name: string;
    href: string;
    icon: any;
    badge?: number;
};

type NavGroup = {
    label: string;
    items: (NavItem | {
        name: string;
        icon: any;
        dropdown: NavItem[];
    })[];
};

const buildMenuGroups = (unreadCount: number): NavGroup[] => [
    {
        label: "Main",
        items: [
            { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ]
    },
    {
        label: "Management",
        items: [
            { name: "Users", href: "/admin/users", icon: Users },
            { name: "Ranks", href: "/admin/ranks", icon: Trophy },
            { name: "Shop", href: "/admin/shop", icon: ShoppingBag },
            { name: "Digital Products", href: "/admin/digitalproducts", icon: FolderOpen },
        ]
    },
    {
        label: "Content",
        items: [
            {
                name: "Portfolio",
                icon: FolderKanban,
                dropdown: [
                    { name: "Projects", href: "/admin/projects", icon: FolderOpen },
                    { name: "Categories", href: "/admin/projects/categories", icon: Layers },
                ],
            },
            { name: "Posts", href: "/admin/posts", icon: FileText },
            { name: "Site Content", href: "/admin/content", icon: Layout },
            { name: "Services", href: "/admin/services", icon: Briefcase },
            {
                name: "Color Space",
                icon: Palette,
                dropdown: [
                    { name: "Single Colors", href: "/admin/colors", icon: Palette },
                    { name: "Palettes", href: "/admin/color-palettes", icon: Layers },
                ],
            },
        ]
    },
    {
        label: "Engagement",
        items: [
            { name: "Partners", href: "/admin/partners", icon: Handshake },
            { name: "Testimonials", href: "/admin/testimonials", icon: Star },
            { name: "Contacts", href: "/admin/contacts", icon: Mail, badge: unreadCount },
        ]
    },
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
    // Track open dropdowns by group item name
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchUnread = async () => {
            const res = await getUnreadMessageCount();
            if (res.success) setUnreadCount(res.count);
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    // Auto-open dropdowns that contain the active path
    useEffect(() => {
        const menuGroups = buildMenuGroups(0);
        const newOpen: Record<string, boolean> = {};
        for (const group of menuGroups) {
            for (const item of group.items) {
                if ("dropdown" in item) {
                    const hasActive = item.dropdown.some(
                        sub => normalizedPath === sub.href || normalizedPath.startsWith(sub.href + "/")
                    );
                    if (hasActive) newOpen[item.name] = true;
                }
            }
        }
        setOpenDropdowns(prev => ({ ...prev, ...newOpen }));
    }, [normalizedPath]);

    const toggleDropdown = (name: string) => {
        setOpenDropdowns(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const menuGroups = buildMenuGroups(unreadCount);

    const isItemActive = (href: string) =>
        normalizedPath === href || (href !== "/admin" && normalizedPath.startsWith(href + "/")) || (href !== "/admin" && normalizedPath.startsWith(href));

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
                    fixed top-0 left-0 z-[100] h-screen transition-all duration-500 ease-in-out
                    ${isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:z-40"}
                    ${!isCollapsed ? "lg:w-64" : "lg:w-20"}
                `}
            >
                <div className="flex flex-col h-full bg-white/80 dark:bg-black/20 backdrop-blur-3xl border-r border-slate-200/80 dark:border-white/5 shadow-[1px_0_20px_rgba(0,0,0,0.04)] dark:shadow-none relative">

                    {/* Shine */}
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />

                    {/* Collapse Toggle */}
                    <button
                        id="admin-sidebar-toggle"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`
                            hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 
                            w-6 h-12 items-center justify-center
                            bg-white dark:bg-black/60 backdrop-blur-3xl 
                            border border-slate-200 dark:border-white/10 
                            rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]
                            hover:w-7 hover:-right-4 hover:bg-slate-50 dark:hover:bg-white/20 
                            transition-all duration-300 ease-out z-[150] group
                        `}
                    >
                        <div className="absolute inset-x-0 inset-y-2 bg-[var(--site-secondary)]/0 group-hover:bg-[var(--site-secondary)]/10 rounded-lg transition-colors" />
                        <div className={`transform transition-all duration-500 group-hover:scale-110 ${!isCollapsed ? "rotate-0" : "rotate-180"}`}>
                            <ChevronLeft size={14} className="text-black/60 dark:text-white/40 group-hover:text-[var(--site-secondary)] drop-shadow-[0_0_8px_var(--site-secondary)]" />
                        </div>
                        <div className="absolute inset-y-2 left-0 w-[1.5px] bg-gradient-to-b from-transparent via-[var(--site-secondary)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Header */}
                    <div className="h-[74px] flex items-center px-6 border-b border-slate-200/80 dark:border-white/5 transition-all duration-300 overflow-hidden shrink-0">
                        <span className={`text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[var(--site-secondary)] to-[var(--site-secondary)] whitespace-nowrap transition-all duration-500 ${isCollapsed ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"}`}>
                            Admin<span className="text-foreground/80 font-medium">Panel</span>
                        </span>
                        {isCollapsed && (
                            <div className="absolute inset-x-0 flex justify-center">
                                <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--site-secondary)] to-[var(--site-secondary)]">A</span>
                            </div>
                        )}
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 overflow-y-auto py-6 space-y-6 overflow-x-hidden custom-scrollbar">
                        {menuGroups.map((group, groupIndex) => (
                            <div key={group.label}>
                                {/* Group Label */}
                                <div className={`px-6 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400/80 dark:text-gray-400/60 transition-all duration-300 ${isCollapsed ? "opacity-0 h-0 overflow-hidden mb-0" : "opacity-100"}`}>
                                    {group.label}
                                </div>
                                {isCollapsed && groupIndex > 0 && (
                                    <div className="w-8 mx-auto h-[1px] bg-slate-200 dark:bg-white/10 my-2" />
                                )}

                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;

                                        // — Dropdown item —
                                        if ("dropdown" in item) {
                                            const isAnySubActive = item.dropdown.some(sub => isItemActive(sub.href));
                                            const isOpen = openDropdowns[item.name] ?? false;

                                            return (
                                                <div key={item.name}>
                                                    <button
                                                        onClick={() => !isCollapsed && toggleDropdown(item.name)}
                                                        title={isCollapsed ? item.name : ""}
                                                        className={`
                                                            w-full flex items-center px-4 py-3 mx-2 rounded-xl transition-all group relative duration-300 text-slate-700 dark:text-white
                                                            ${isAnySubActive ? "font-bold" : "hover:bg-slate-100/80 dark:hover:bg-white/5"}
                                                            ${isCollapsed ? "justify-center" : ""}
                                                        `}
                                                        style={{ width: isCollapsed ? undefined : "calc(100% - 16px)" }}
                                                    >
                                                        {isAnySubActive && (
                                                            <motion.div
                                                                layoutId="admin-active-bg"
                                                                className="absolute inset-0 rounded-xl bg-[var(--site-accent)]/8 dark:bg-white/10 border border-[var(--site-accent)]/20 dark:border-white/20 shadow-sm dark:shadow-[0_8px_32px_var(--site-secondary)]/15 -z-10"
                                                                transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                                                            />
                                                        )}
                                                        <Icon size={20} className={`text-[var(--site-secondary)] min-w-[20px] transition-transform duration-300 group-hover:scale-110 ${isAnySubActive ? "drop-shadow-[0_0_8px_var(--site-secondary)]" : "opacity-70 group-hover:opacity-100"}`} />
                                                        <span className={`ml-3 text-sm tracking-tight whitespace-nowrap flex-1 text-left transition-all duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100"}`}>
                                                            {item.name}
                                                        </span>
                                                        {!isCollapsed && (
                                                            <ChevronDown
                                                                size={14}
                                                                className={`shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                                            />
                                                        )}
                                                    </button>

                                                    {/* Dropdown Items */}
                                                    <AnimatePresence>
                                                        {(isOpen && !isCollapsed) && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="ml-6 mr-2 mt-1 mb-1 space-y-0.5 pl-4 border-l border-[var(--site-accent)]/30 dark:border-[var(--site-secondary)]/20">
                                                                    {item.dropdown.map(sub => {
                                                                        const SubIcon = sub.icon;
                                                                        const isSubActive = isItemActive(sub.href);
                                                                        return (
                                                                            <Link
                                                                                key={sub.href}
                                                                                href={sub.href}
                                                                                className={`
                                                                                    flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group/sub relative
                                                                                    ${isSubActive
                                                                                        ? "text-[var(--site-accent)] font-bold bg-[var(--site-accent)]/10 dark:text-[var(--site-secondary)] dark:bg-[var(--site-secondary)]/10"
                                                                                        : "text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                                                                                    }
                                                                                `}
                                                                            >
                                                                                <SubIcon size={15} className={`shrink-0 transition-transform group-hover/sub:scale-110 ${isSubActive ? "text-[var(--site-secondary)]" : "opacity-60"}`} />
                                                                                <span className="truncate">{sub.name}</span>
                                                                            </Link>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        }

                                        // — Regular item —
                                        const isActive = isItemActive(item.href);
                                        return (
                                            <Link
                                                key={item.href}
                                                id={`admin-nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                href={item.href}
                                                title={isCollapsed ? item.name : ""}
                                                className={`
                                                    flex items-center px-4 py-3 mx-2 rounded-xl transition-all group relative duration-300 text-slate-700 dark:text-white
                                                    ${isActive ? "font-bold" : "hover:bg-slate-100/80 dark:hover:bg-white/5"}
                                                `}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="admin-active-bg"
                                                        className="absolute inset-0 rounded-xl bg-[var(--site-accent)]/8 dark:bg-white/10 border border-[var(--site-accent)]/20 dark:border-white/20 shadow-sm dark:shadow-[0_8px_32px_var(--site-secondary)]/15 -z-10"
                                                        transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                                                    />
                                                )}
                                                <div className="relative">
                                                    <Icon size={20} className={`text-[var(--site-secondary)] min-w-[20px] transition-transform duration-300 group-hover:scale-110 ${isActive ? "drop-shadow-[0_0_8px_var(--site-secondary)]" : "opacity-70 group-hover:opacity-100"}`} />
                                                    {"badge" in item && (item as any).badge > 0 && (
                                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                                                            {(item as any).badge > 99 ? "99+" : (item as any).badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`ml-3 text-sm tracking-tight whitespace-nowrap transition-all duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
                                                    {item.name}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200/80 dark:border-[var(--glass-border)] overflow-hidden">
                        <Link id="admin-exit-button" href="/dashboard" className="flex items-center px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-600 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors group whitespace-nowrap">
                            <LogOut size={20} className="min-w-[20px] text-[var(--site-secondary)]" />
                            <span className={`ml-3 font-medium transition-all duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100 w-auto"}`}>Exit Admin</span>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
