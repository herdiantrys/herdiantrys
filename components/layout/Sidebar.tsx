"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    LayoutDashboard, Users, FileText, Briefcase, ShoppingBag,
    Settings, LogOut, Menu, X, FolderOpen, Star, Handshake,
    Mail, Layout, ChevronLeft, ChevronRight, ChevronDown, Home, User, ShieldCheck,
    Layers, Bell, MessageSquare, Search, Palette, Trophy, Coins,
    FileSliders, Zap, Package
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import NotificationDropdown from "@/components/Notification/NotificationDropdown";
import { ModeToggle } from "@/components/mode-toggle";
import AvatarWithEffect from "../AvatarWithEffect";
import { getUnreadMessageCount as getDirectUnreadCount } from "@/lib/actions/message.actions";
import { getUnreadMessageCount } from "@/lib/actions/contact.actions";


type SidebarProps = {
    dict: any;
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    user: any;
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    setIsMessageOpen: (value: boolean) => void;
    unreadMessages: number;
};

export default function Sidebar({ dict, isOpen, setIsOpen, user, isCollapsed, setIsCollapsed, setIsMessageOpen, unreadMessages }: SidebarProps) {
    const pathname = usePathname() || "";
    const normalizedPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";

    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const isAdminSection = normalizedPath.startsWith("/admin");

    const [isAdminMode, setIsAdminMode] = useState(isAdminSection);

    useEffect(() => {
        setIsAdminMode(isAdminSection);
    }, [isAdminSection]);

    const isExpanded = !isCollapsed;

    const userRole = user?.role?.toLowerCase() || "";
    const isAuthorizedAdmin = ["admin", "super_admin"].includes(userRole);

    useEffect(() => {
        if (!user) return;
        const fetchAllUnread = async () => {
            if (isAuthorizedAdmin) {
                const res = await getUnreadMessageCount();
                if (res.success) setUnreadCount(res.count);
            }
        };
        fetchAllUnread();
        const interval = setInterval(fetchAllUnread, 15000);
        return () => clearInterval(interval);
    }, [user, isAuthorizedAdmin]);

    const adminSections = [
        {
            title: dict.nav?.overview || "Overview",
            items: [
                { name: dict.nav?.dashboard || "Dashboard", href: "/admin", icon: LayoutDashboard },
                { name: dict.nav?.users || "Users", href: "/admin/users", icon: Users },
                {
                    name: "Setups",
                    icon: FileSliders,
                    dropdown: [
                        { name: dict.nav?.setup || "Setup", href: "/admin/content", icon: FileSliders },
                        { name: dict.nav?.theme || "Theme", href: "/admin/theme", icon: Palette },
                    ]
                },
            ]
        },
        {
            title: dict.nav?.content || "Content",
            items: [
                {
                    name: "Portfolio",
                    icon: FolderOpen,
                    dropdown: [
                        { name: dict.nav?.projects || "Projects", href: "/admin/projects", icon: FolderOpen },
                        { name: dict.nav?.categories || "Categories", href: "/admin/projects/categories", icon: Layers },
                        { name: dict.nav?.services || "Services", href: "/admin/services", icon: Briefcase },
                        { name: dict.nav?.partners || "Partners", href: "/admin/partners", icon: Handshake },
                        { name: dict.nav?.testimonials || "Testimonials", href: "/admin/testimonials", icon: Star },
                    ]
                },
                {
                    name: "Color Space",
                    icon: Palette,
                    dropdown: [
                        { name: dict.nav?.colors || "Colors", href: "/admin/colors", icon: Palette },
                        { name: dict.nav?.color_palettes || "Palettes", href: "/admin/color-palettes", icon: Layers },
                    ]
                },
            ]
        },
        {
            title: dict.nav?.engagement || "Engagement",
            items: [
                { name: dict.nav?.posts || "Posts", href: "/admin/posts", icon: FileText },
                { name: dict.nav?.contacts || "Contacts", href: "/admin/contacts", icon: Mail },
            ]
        },
        {
            title: dict.nav?.system || "System",
            items: [
                { name: dict.nav?.shop || "Shop", href: "/admin/shop", icon: ShoppingBag },
                { name: "Digital Products", href: "/admin/digitalproducts", icon: Package },
                { name: dict.nav?.ranks || "Ranks", href: "/admin/ranks", icon: Trophy },
            ]
        }
    ];

    const isActive = (href: string) => {
        if (href === "/dashboard" || href === "/") {
            return normalizedPath === "/dashboard" || normalizedPath === "/";
        }
        if (href === "/admin") {
            return normalizedPath === "/admin";
        }
        return normalizedPath?.startsWith(href);
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                id="sidebar-mobile-toggle"
                onClick={() => setIsOpen(!isOpen)}
                className={`lg:hidden fixed top-3 left-3 z-[101] p-2.5 bg-[var(--site-sidebar-bg)] backdrop-blur-xl rounded-2xl text-[var(--site-sidebar-fg)] hover:opacity-90 shadow-xl shadow-black/10 transition-all border border-[var(--site-sidebar-border)] ${isOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"}`}
            >
                <Menu size={20} />
            </button>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-[115] bg-black/40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                id="sidebar"
                className={`fixed top-0 left-0 z-[120] h-screen transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:z-40"}
                    ${isExpanded ? "w-[260px] lg:w-64" : "w-[260px] lg:w-[72px]"}
                `}
            >
                <div className="flex flex-col h-full bg-[var(--site-sidebar-bg)] backdrop-blur-3xl border-r border-[var(--site-sidebar-border)] relative shadow-[4px_0_24px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_32px_rgba(0,0,0,0.3)]">

                    {/* Subtle gradient on the side */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-r-none">
                        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[var(--site-accent)]/10 to-transparent" />
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden absolute top-4 right-4 p-2 rounded-xl bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)] text-[var(--site-sidebar-fg)] hover:opacity-80 transition-all z-[110]"
                    >
                        <X size={18} />
                    </button>

                    {/* Desktop Collapse Handle */}
                    <button
                        id="sidebar-desktop-toggle"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`
                            hidden lg:flex absolute -right-3 top-20 z-[150]
                            w-6 h-6 items-center justify-center
                            bg-[var(--site-sidebar-bg)]
                            border border-[var(--site-sidebar-border)]
                            rounded-full shadow-md shadow-black/10 dark:shadow-black/30
                            hover:bg-[var(--site-sidebar-accent)] hover:border-[var(--site-sidebar-accent)]
                            hover:shadow-[0_0_12px_var(--site-sidebar-accent)]/40
                            transition-all duration-300 group
                        `}
                    >
                        <ChevronLeft
                            size={12}
                            className={`text-[var(--site-sidebar-fg)]/50 group-hover:text-white transition-all duration-300 ${isExpanded ? "rotate-0" : "rotate-180"}`}
                        />
                    </button>

                    {/* Logo Header */}
                    <div className="h-[70px] flex items-center px-5 border-b border-[var(--site-sidebar-border)] shrink-0">
                        <Link href={isAdminMode ? "/admin" : "/"} onClick={() => setIsOpen(false)} className="block w-full">
                            <div className={`flex items-center gap-3 ${!isExpanded ? "lg:justify-center" : ""}`}>
                                <div className="relative shrink-0">
                                    <Image
                                        src="/logo.svg"
                                        alt="Logo"
                                        width={28}
                                        height={28}
                                        className="w-7 h-7 object-contain"
                                        priority
                                    />
                                </div>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="overflow-hidden whitespace-nowrap"
                                        >
                                            {isAdminMode ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-m font-bold tracking-tight text-slate-800 dark:text-white">
                                                        Admin <span className="text-[var(--site-accent)]">Panel.</span>
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-m font-bold tracking-tight text-slate-800 dark:text-white">
                                                    Herdiantry<span className="text-[var(--site-accent)]">.</span>
                                                </span>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden custom-scrollbar flex flex-col items-stretch">
                        {isAdminMode ? (
                            <div className="px-3 space-y-5">
                                {adminSections.map((section) => (
                                    <SidebarSection key={section.title} label={section.title} isExpanded={isExpanded} show={true}>
                                        {section.items.map((item: any) => (
                                            'dropdown' in item ? (
                                                <SidebarDropdown
                                                    key={item.name}
                                                    item={item}
                                                    isExpanded={isExpanded}
                                                    normalizedPath={normalizedPath}
                                                    setIsOpen={setIsOpen}
                                                />
                                            ) : (
                                                <SidebarLink
                                                    key={item.href}
                                                    item={item}
                                                    active={isActive(item.href)}
                                                    isExpanded={isExpanded}
                                                    setIsOpen={setIsOpen}
                                                    setIsCollapsed={setIsCollapsed}
                                                    unreadCount={item.name === "Contacts" ? unreadCount : 0}
                                                />
                                            )
                                        ))}
                                    </SidebarSection>
                                ))}
                            </div>
                        ) : (
                            <div className="px-3 space-y-5">
                                <SidebarSection label={dict.nav?.main_menu || "Main Menu"} isExpanded={isExpanded} show={true}>
                                    {[
                                        { name: dict.nav?.home || "Home", href: "/dashboard", icon: Home },
                                        { name: dict.nav?.works || "Works", href: "/projects", icon: Briefcase },
                                        { name: dict.nav?.shop || "Shop", href: "/shop", icon: ShoppingBag },
                                        { name: "Digital Products", href: "/digitalproducts", icon: Layers },
                                        { name: dict.nav?.app_store || "Apps", href: "/apps", icon: Layout },
                                    ].map((item) => (
                                        <SidebarLink
                                            key={item.href}
                                            item={item}
                                            active={isActive(item.href)}
                                            isExpanded={isExpanded}
                                            setIsOpen={setIsOpen}
                                            setIsCollapsed={setIsCollapsed}
                                        />
                                    ))}
                                </SidebarSection>

                                <SidebarSection label={dict.nav?.user || "Account"} isExpanded={isExpanded} show={!!user}>
                                    {[
                                        { name: dict.nav?.profile || "Profile", href: `/profile/${user?.username || user?.id || 'me'}`, icon: User },
                                        { name: "My Inventory", href: "/dashboard/inventory", icon: Package },
                                        { name: dict.nav?.messages || "Messages", href: "#", icon: MessageSquare, onClick: () => setIsMessageOpen(true), unread: unreadMessages },
                                        { name: dict.nav?.notifications || "Notifications", href: "/notifications", icon: Bell },
                                        { name: dict.nav?.settings || "Settings", href: "/settings", icon: Settings },
                                    ].map((item: any) => (
                                        <SidebarLink
                                            key={item.href || item.name}
                                            item={item}
                                            active={item.href !== "#" && isActive(item.href)}
                                            isExpanded={isExpanded}
                                            setIsOpen={setIsOpen}
                                            onClick={item.onClick}
                                            unreadCount={item.unread || 0}
                                            setIsCollapsed={setIsCollapsed}
                                        />
                                    ))}
                                </SidebarSection>
                            </div>
                        )}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className={`p-3 border-t border-[var(--site-sidebar-border)] flex flex-col gap-2 ${isExpanded ? "" : "items-center"}`}>

                        {/* User Profile Row (only in expanded mode) */}
                        {isExpanded && user && (
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)]">
                                <div className="relative shrink-0">
                                    <AvatarWithEffect
                                        src={user.image}
                                        alt={user.name || "User"}
                                        size={32}
                                        effect={user.equippedEffect}
                                        frame={user.equippedFrame}
                                        background={user.equippedBackground}
                                        profileColor={user.profileColor}
                                        frameColor={user.frameColor}
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--site-sidebar-accent)] border-2 border-[var(--site-sidebar-bg)]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-[var(--site-sidebar-fg)] truncate leading-none">{user.name}</p>
                                    <p className="text-[10px] text-[var(--site-sidebar-fg)]/50 truncate mt-0.5">{user.email}</p>
                                </div>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[var(--site-secondary)]/10 border border-[var(--site-secondary)]/20">
                                    <Coins size={10} className="text-[var(--site-secondary)]" />
                                    <span className="text-[10px] font-black text-[var(--site-secondary)]">{user.points || 0}</span>
                                </div>
                            </div>
                        )}

                        {/* Admin/User Toggle */}
                        {isAuthorizedAdmin && (
                            <button
                                onClick={() => setIsAdminMode(!isAdminMode)}
                                title={!isExpanded ? (isAdminMode ? "Switch to User" : "Switch to Admin") : ""}
                                className={`group w-full flex items-center ${isExpanded ? "px-3" : "justify-center px-0"} gap-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden
                                    ${isAdminMode
                                        ? "bg-[var(--site-secondary)]/10 text-[var(--site-secondary)] hover:bg-[var(--site-secondary)]/15 border border-[var(--site-secondary)]/20"
                                        : "bg-[var(--site-sidebar-accent)]/10 text-[var(--site-sidebar-accent)] hover:bg-[var(--site-sidebar-accent)]/15 border border-[var(--site-sidebar-accent)]/20"
                                    }`}
                            >
                                {isAdminMode
                                    ? <User size={16} className="shrink-0 group-hover:scale-110 transition-transform" />
                                    : <ShieldCheck size={16} className="shrink-0 group-hover:scale-110 transition-transform" />
                                }
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="text-xs font-bold whitespace-nowrap overflow-hidden"
                                        >
                                            {isAdminMode ? (dict.nav?.switch_to_user || "Switch to User") : (dict.nav?.switch_to_admin || "Switch to Admin")}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        )}

                        {/* Logout Button */}
                        <button
                            onClick={() => { setIsOpen(false); signOut(); }}
                            title={!isExpanded ? (dict.nav?.log_out || "Log Out") : ""}
                            className={`group w-full flex items-center ${isExpanded ? "px-3" : "justify-center px-0"} gap-3 py-2.5 rounded-xl text-[var(--site-sidebar-fg)]/60 hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/20 transition-all duration-200`}
                        >
                            <LogOut size={16} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="text-xs font-bold whitespace-nowrap overflow-hidden"
                                    >
                                        {dict.nav?.log_out || "Log Out"}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </aside >
        </>
    );
}

// ─── Helper Components ─────────────────────────────────────────────────────────

function SidebarSection({ label, children, isExpanded, show }: { label: string, children: React.ReactNode, isExpanded: boolean, show: boolean }) {
    if (!show) return null;
    return (
        <div className="w-full">
            {isExpanded ? (
                <div className="flex items-center gap-2 mb-2 px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--site-sidebar-fg)]/40 whitespace-nowrap">
                        {label}
                    </p>
                    <div className="flex-1 h-px bg-[var(--site-sidebar-border)]" />
                </div>
            ) : (
                <div className="w-8 mx-auto h-px bg-[var(--site-sidebar-border)] my-1" />
            )}
            <div className="space-y-0.5 flex flex-col items-stretch">
                {children}
            </div>
        </div>
    );
}

function SidebarDropdown({
    item,
    isExpanded,
    normalizedPath,
    setIsOpen,
}: {
    item: { name: string; icon: any; dropdown: { name: string; href: string; icon: any }[] };
    isExpanded: boolean;
    normalizedPath: string;
    setIsOpen: (v: boolean) => void;
}) {
    const Icon = item.icon;
    const isAnySubActive = item.dropdown.some(
        sub => normalizedPath === sub.href || normalizedPath.startsWith(sub.href + "/") || normalizedPath.startsWith(sub.href)
    );
    const [open, setOpen] = useState(isAnySubActive);

    useEffect(() => {
        if (isAnySubActive) setOpen(true);
    }, [isAnySubActive]);

    return (
        <div>
            <button
                onClick={() => isExpanded && setOpen(o => !o)}
                title={!isExpanded ? item.name : ""}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative
                    ${isAnySubActive
                        ? "bg-[var(--site-sidebar-active)] text-[var(--site-sidebar-fg)] font-semibold"
                        : "text-[var(--site-sidebar-fg)]/60 hover:bg-[var(--site-sidebar-active)]/50 hover:text-[var(--site-sidebar-fg)]"
                    }
                    ${!isExpanded ? "justify-center" : ""}
                `}
            >
                {isAnySubActive && (
                    <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 inset-y-2 w-[3px] rounded-full bg-[var(--site-sidebar-accent)] shadow-[0_0_8px_var(--site-sidebar-accent)]"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                )}
                <div className={`shrink-0 transition-all duration-200 ${isAnySubActive ? "text-[var(--site-sidebar-accent)]" : "text-[var(--site-sidebar-fg)]/40 group-hover:text-[var(--site-sidebar-accent)]"}`}>
                    <Icon size={17} />
                </div>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="flex-1 text-sm whitespace-nowrap overflow-hidden text-left"
                        >
                            {item.name}
                        </motion.span>
                    )}
                </AnimatePresence>
                {isExpanded && (
                    <motion.div
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="shrink-0"
                    >
                        <ChevronDown size={13} className="text-[var(--site-sidebar-fg)]/40" />
                    </motion.div>
                )}
            </button>

            <AnimatePresence>
                {open && isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="ml-4 mt-1 mb-1 space-y-0.5 pl-4 border-l-2 border-[var(--site-sidebar-border)]">
                            {item.dropdown.map(sub => {
                                const SubIcon = sub.icon;
                                const isSubActive = normalizedPath === sub.href || normalizedPath.startsWith(sub.href + "/") || normalizedPath.startsWith(sub.href);
                                return (
                                    <Link
                                        key={sub.href}
                                        href={sub.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`group/sub flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all
                                            ${isSubActive
                                                ? "bg-[var(--site-sidebar-accent)]/10 text-[var(--site-sidebar-accent)] font-semibold border border-[var(--site-sidebar-accent)]/20"
                                                : "text-[var(--site-sidebar-fg)]/50 hover:text-[var(--site-sidebar-fg)] hover:bg-[var(--site-sidebar-active)]/50"
                                            }`}
                                    >
                                        <SubIcon size={13} className={`shrink-0 transition-transform group-hover/sub:scale-110 ${isSubActive ? "text-[var(--site-sidebar-accent)]" : "opacity-50"}`} />
                                        <span className="truncate">{sub.name}</span>
                                        {isSubActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--site-sidebar-accent)] animate-pulse" />}
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

function SidebarLink({
    item,
    active,
    isExpanded,
    setIsOpen,
    unreadCount,
    isSmall,
    onClick,
    setIsCollapsed
}: {
    item: any;
    active: boolean;
    isExpanded: boolean;
    setIsOpen: (v: boolean) => void;
    unreadCount?: number;
    isSmall?: boolean;
    onClick?: () => void;
    setIsCollapsed?: (v: boolean) => void;
}) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            title={!isExpanded ? item.name : ""}
            onClick={(e) => {
                if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                }
                setIsOpen(false);
                if (setIsCollapsed && !isExpanded) {
                    setIsCollapsed(false);
                }
            }}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${!isExpanded ? "justify-center" : ""}
                ${active
                    ? "bg-[var(--site-sidebar-active)] text-[var(--site-sidebar-fg)] font-semibold"
                    : "text-[var(--site-sidebar-fg)]/60 hover:bg-[var(--site-sidebar-active)]/50 hover:text-[var(--site-sidebar-fg)]"
                }`}
        >
            {active && (
                <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 inset-y-2 w-[3px] rounded-full bg-[var(--site-sidebar-accent)] shadow-[0_0_8px_var(--site-sidebar-accent)]"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
            )}

            <div className="relative shrink-0">
                <Icon
                    size={17}
                    className={`transition-all duration-200
                        ${active
                            ? "text-[var(--site-sidebar-accent)]"
                            : "text-[var(--site-sidebar-fg)]/40 group-hover:text-[var(--site-sidebar-accent)]"
                        }`}
                />
                {(unreadCount ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-black border border-white dark:border-[#111] shadow-md px-1">
                        {(unreadCount ?? 0) > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && !isSmall && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex-1 text-sm whitespace-nowrap overflow-hidden"
                    >
                        {item.name}
                    </motion.span>
                )}
            </AnimatePresence>

            {isExpanded && (unreadCount ?? 0) > 0 && (
                <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black px-1.5">
                    {(unreadCount ?? 0) > 9 ? "9+" : unreadCount}
                </span>
            )}
        </Link>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Global Navbar Component
// ──────────────────────────────────────────────────────────────────────────────

type UserLike = {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
    id?: string;
    username?: string;
    points?: number;
    equippedEffect?: string | null;
    equippedFrame?: string | null;
    equippedBackground?: string | null;
    profileColor?: string | null;
    frameColor?: string | null;
} | null;

type GlobalNavbarProps = {
    user: UserLike;
    dict: any;
    setIsMessageOpen: (v: boolean) => void;
    unreadMessages: number;
};

export function GlobalNavbar({ user, dict, setIsMessageOpen, unreadMessages }: GlobalNavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { theme, setTheme } = useTheme();

    const isFloatingNav = !user && (pathname === "/" || pathname === "/en" || pathname === "/id");

    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeSection, setActiveSection] = useState("hero");

    const searchInputRef = useRef<HTMLInputElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const query = searchParams.get("search");
        if (query !== null && pathname === "/projects") {
            setSearchQuery(query);
        } else if (pathname !== "/projects") {
            setSearchQuery("");
        }
    }, [searchParams, pathname]);

    const [isNavVisible, setIsNavVisible] = useState(true);
    const lastScrollY = useRef(0);
    const isProgrammaticScroll = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 20);
            if (isFloatingNav && currentScrollY > 100 && !isProgrammaticScroll.current) {
                setIsNavVisible(currentScrollY <= lastScrollY.current);
            } else if (!isFloatingNav || currentScrollY <= 100) {
                setIsNavVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isFloatingNav]);

    useEffect(() => {
        if (!isFloatingNav) return;
        const sections = ["hero", "portfolio", "services", "testimonials", "partners", "about", "contact"];
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
            { root: null, rootMargin: "-50% 0px -50% 0px", threshold: 0 }
        );
        sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, [isFloatingNav, pathname]);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        if (!isProfileOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isProfileOpen]);

    const getBreadcrumbs = () => {
        if (!pathname || pathname === "/") return [];
        const rawPaths = pathname.split("/").filter(Boolean);
        const breadcrumbs: { href: string; label: string }[] = [];
        let accumulateHref = "";
        rawPaths.forEach((path) => {
            accumulateHref += `/${path}`;
            if (path.toLowerCase() !== "en" && path.toLowerCase() !== "id") {
                let label = path.charAt(0).toUpperCase() + path.slice(1);
                label = label.replace(/-/g, " ");
                breadcrumbs.push({ href: accumulateHref, label });
            }
        });
        return breadcrumbs;
    };
    const breadcrumbs = getBreadcrumbs();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const pathParts = pathname.split('/').filter(Boolean);
            const lang = (pathParts[0] === 'en' || pathParts[0] === 'id') ? pathParts[0] : 'en';
            router.push(`/${lang}/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <motion.header
            initial={isFloatingNav ? { y: -100, opacity: 0 } : { opacity: 1 }}
            animate={{ y: isFloatingNav ? (isNavVisible ? 0 : -200) : 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            id="global-navbar"
            style={isFloatingNav ? {} : {
                left: "var(--navbar-left)",
                width: "calc(100% - var(--navbar-left))"
            }}
            className={`transition-all duration-500 ease-in-out flex items-center justify-between
                ${isFloatingNav
                    ? `fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 w-[96%] sm:w-[92%] max-w-6xl 
                       rounded-2xl bg-[var(--glass-bg)] backdrop-blur-2xl 
                       shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_48px_rgba(0,0,0,0.45)]
                       border border-[var(--glass-border)] z-50 px-4 sm:px-5 py-2.5`
                    : `fixed top-0 right-0 h-[70px] px-4 sm:px-6 md:px-8 z-40
                       ${scrolled
                        ? "bg-[var(--glass-bg)] backdrop-blur-2xl border-b border-[var(--glass-border)] shadow-sm"
                        : "bg-transparent border-b border-transparent"
                    }`
                }`}
        >
            {/* Left: Nav Links or Breadcrumb */}
            <nav aria-label="Main Navigation" className="flex items-center min-w-0">
                {isFloatingNav ? (
                    <div className="flex items-center gap-0.5">
                        {[
                            { label: dict.nav?.home || "Home", href: "#hero", id: "hero" },
                            { label: dict.nav?.works || "Portfolio", href: "#portfolio", id: "portfolio" },
                            { label: dict.nav?.services || "Services", href: "#services", id: "services" },
                            { label: dict.nav?.about || "About", href: "#about", id: "about" },
                            { label: dict.nav?.contact || "Contact", href: "#contact", id: "contact" },
                        ].map((item) => {
                            const isActive = activeSection === item.id;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        isProgrammaticScroll.current = true;
                                        const element = document.querySelector(item.href);
                                        if (element) {
                                            element.scrollIntoView({ behavior: "smooth" });
                                            setActiveSection(item.id);
                                            setTimeout(() => { isProgrammaticScroll.current = false; }, 1000);
                                        }
                                    }}
                                    className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all rounded-xl group
                                        ${isActive
                                            ? "text-[var(--site-secondary)]"
                                            : "text-[var(--glass-text)]/70 hover:text-[var(--site-secondary)]"
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="floating-nav-active"
                                            className="absolute inset-0 bg-[var(--site-secondary)]/10 border border-[var(--site-secondary)]/20 rounded-xl -z-10"
                                            transition={{ type: "spring", stiffness: 350, damping: 35 }}
                                        />
                                    )}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {breadcrumbs.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-1 ml-14 lg:ml-0"
                            >
                                <Link href="/" className="p-1.5 rounded-lg hover:bg-[var(--site-sidebar-active)] text-[var(--glass-text)]/40 hover:text-[var(--glass-text)] transition-all">
                                    <HomeIcon className="w-3.5 h-3.5" />
                                </Link>
                                {breadcrumbs.map((item, index) => (
                                    <div key={item.href} className="flex items-center">
                                        <ChevronRight className="w-3 h-3 text-[var(--glass-text)]/20 mx-0.5" />
                                        <Link
                                            href={item.href}
                                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-200
                                                ${index === breadcrumbs.length - 1
                                                    ? "bg-[var(--site-secondary)]/10 text-[var(--site-secondary)] border border-[var(--site-secondary)]/20"
                                                    : "text-[var(--glass-text)]/50 hover:text-[var(--glass-text)] hover:bg-[var(--site-sidebar-active)]"
                                                }`}
                                        >
                                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.08 }}>
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

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">

                {/* Search */}
                <form onSubmit={handleSearch} className="relative hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--glass-text-muted)] group-focus-within:text-[var(--site-secondary)] transition-colors pointer-events-none" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={dict.nav?.search_placeholder || "Search…"}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-52 pl-9 pr-10 py-2 rounded-xl bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)] focus:border-[var(--site-secondary)]/40 outline-none text-sm transition-all duration-300 placeholder:text-[var(--glass-text-muted)] text-[var(--glass-text)] focus:w-64 focus:bg-[var(--glass-bg)] focus:shadow-[0_0_0_3px] focus:shadow-[var(--site-secondary)]/10"
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex select-none items-center rounded border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)] px-1.5 font-mono text-[9px] font-bold text-[var(--glass-text-muted)] group-focus-within:opacity-0 transition-opacity">
                        ⌘K
                    </kbd>
                </form>

                {/* Divider */}
                <div className="h-5 w-px bg-[var(--site-sidebar-border)] hidden lg:block mx-1" />

                {/* Points Badge */}
                {user && (
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--site-secondary)]/10 text-[var(--site-secondary)] border border-[var(--site-secondary)]/20">
                        <Coins size={13} />
                        <span className="text-xs font-black font-mono tabular-nums">{user.points || 0}</span>
                    </div>
                )}

                {/* Messages */}
                {user && (
                    <button
                        onClick={() => setIsMessageOpen(true)}
                        className="relative p-2 rounded-xl text-[var(--glass-text-muted)] hover:text-[var(--site-secondary)] hover:bg-[var(--site-sidebar-active)] transition-all group"
                    >
                        <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
                        {unreadMessages > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex items-center justify-center">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                                <span className="relative flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white border border-white dark:border-[#111]">
                                    {unreadMessages > 9 ? "9+" : unreadMessages}
                                </span>
                            </span>
                        )}
                    </button>
                )}

                {/* Notifications */}
                {user && (
                    <NotificationDropdown
                        userId={user?.id || ""}
                        dict={dict}
                        isOpen={isNotifOpen}
                        onToggle={() => setIsNotifOpen(!isNotifOpen)}
                        onClose={() => setIsNotifOpen(false)}
                    />
                )}

                {/* Theme Toggle */}
                <ModeToggle />

                {/* Profile / Login */}
                {user ? (
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`flex items-center gap-2.5 pl-2 pr-1.5 py-1.5 rounded-2xl transition-all duration-200 group relative overflow-hidden
                                ${isProfileOpen
                                    ? "bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)]"
                                    : "bg-[var(--site-sidebar-active)]/60 border border-[var(--site-sidebar-border)] hover:bg-[var(--site-sidebar-active)] hover:border-[var(--site-secondary)]/30"
                                }`}
                        >
                            <span className="text-xs font-bold text-[var(--glass-text)] hidden sm:block tracking-tight">
                                {user.name?.split(" ")[0]}
                            </span>
                            <div className="relative">
                                <div className={`p-[1.5px] rounded-xl bg-gradient-to-tr transition-all duration-300 ${isProfileOpen ? "from-[var(--site-secondary)] to-[var(--site-secondary)]/40" : "from-[var(--site-sidebar-border)] to-transparent group-hover:from-[var(--site-secondary)]/60"}`}>
                                    <AvatarWithEffect
                                        src={user.image}
                                        alt={user.name || "User"}
                                        size={28}
                                        effect={user.equippedEffect}
                                        frame={user.equippedFrame}
                                        background={user.equippedBackground}
                                        profileColor={user.profileColor}
                                        frameColor={user.frameColor}
                                    />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--site-accent)] border-2 border-[var(--site-sidebar-bg)] shadow-sm" />
                            </div>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(8px)" }}
                                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(8px)" }}
                                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                                    className="absolute right-0 top-full mt-3 w-72 rounded-2xl overflow-hidden
                                        bg-[var(--glass-bg)] backdrop-blur-2xl
                                        border border-[var(--glass-border)]
                                        shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                                        z-50"
                                >
                                    {/* Profile Header */}
                                    <div className="p-4 border-b border-[var(--glass-border)]">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <AvatarWithEffect
                                                    src={user.image}
                                                    alt={user.name || "User"}
                                                    size={42}
                                                    effect={user.equippedEffect}
                                                    frame={user.equippedFrame}
                                                    background={user.equippedBackground}
                                                    profileColor={user.profileColor}
                                                    frameColor={user.frameColor}
                                                />
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--site-accent)] border-2 border-[var(--glass-bg)]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-[var(--glass-text)] truncate">{user.name}</p>
                                                <p className="text-[11px] text-[var(--glass-text-muted)] truncate">{user.email}</p>
                                            </div>
                                            <span className="shrink-0 px-2 py-0.5 rounded-lg bg-[var(--site-secondary)]/10 text-[var(--site-secondary)] text-[10px] font-black border border-[var(--site-secondary)]/20 uppercase tracking-tight">
                                                {user.role || "User"}
                                            </span>
                                        </div>

                                        {/* Balance */}
                                        <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-[var(--site-secondary)]/10 flex items-center justify-center">
                                                    <Coins size={14} className="text-[var(--site-secondary)]" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--glass-text-muted)] leading-none">Balance</p>
                                                    <p className="text-sm font-black text-[var(--glass-text)] leading-none mt-0.5">
                                                        {user.points || 0} <span className="text-[10px] text-[var(--site-secondary)] font-bold">PTS</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <Link href="/shop" onClick={() => setIsProfileOpen(false)} className="text-xs font-bold text-[var(--site-secondary)] hover:underline">
                                                Go to Shop →
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Menu Links */}
                                    <div className="p-2">
                                        {['admin', 'super_admin'].includes(user.role?.toLowerCase() || '') && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl
                                                    bg-gradient-to-r from-[var(--site-secondary)]/10 to-transparent 
                                                    text-[var(--site-secondary)] hover:from-[var(--site-secondary)]/20
                                                    border border-[var(--site-secondary)]/15 hover:border-[var(--site-secondary)]/30
                                                    transition-all group mb-1"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-[var(--site-secondary)]/10 flex items-center justify-center">
                                                    <ShieldCheck size={14} />
                                                </div>
                                                {dict.nav?.admin_panel || "Admin Panel"}
                                                <Zap size={12} className="ml-auto opacity-60 group-hover:opacity-100" />
                                            </Link>
                                        )}
                                        {[
                                            { label: dict.nav?.profile || "Profile", href: `/profile/${user.username || user.id}`, icon: User },
                                            { label: dict.nav?.settings || "Settings", href: "/settings", icon: Settings },
                                        ].map(ln => (
                                            <Link
                                                key={ln.href}
                                                href={ln.href}
                                                onClick={() => setIsProfileOpen(false)}
                                                className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl 
                                                    text-[var(--glass-text)]/70 hover:text-[var(--glass-text)]
                                                    hover:bg-[var(--site-sidebar-active)] transition-all"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-[var(--site-sidebar-active)] group-hover:bg-[var(--site-secondary)]/10 group-hover:text-[var(--site-secondary)] flex items-center justify-center transition-colors">
                                                    <ln.icon size={14} />
                                                </div>
                                                {ln.label}
                                            </Link>
                                        ))}

                                        <div className="h-px bg-[var(--glass-border)] my-1.5 mx-1" />

                                        <button
                                            onClick={() => signOut()}
                                            className="group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl
                                                text-[var(--glass-text-muted)] hover:text-red-500
                                                hover:bg-red-500/10 transition-all"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                                <LogOut size={14} />
                                            </div>
                                            {dict.nav?.log_out || "Sign Out"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="px-5 py-2 rounded-xl bg-[var(--site-secondary)] text-[var(--site-button-text,white)] text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg shadow-[var(--site-secondary)]/20"
                    >
                        {dict.nav?.login || "Sign In"}
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
