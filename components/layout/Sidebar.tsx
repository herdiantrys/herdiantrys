"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    LayoutDashboard, Users, FileText, Briefcase,
    Settings, LogOut, Menu, X, FolderOpen, Star, Handshake,
    Mail, Layout, ChevronLeft, ChevronRight, ChevronDown, Home, User, ShieldCheck,
    Layers, Bell, MessageSquare, Search, Palette, Trophy, Coins,
    FileSliders, Zap, Package
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import NotificationDropdown from "@/components/Notification/NotificationDropdown";
import { ModeToggle } from "@/components/mode-toggle";
import AvatarWithEffect from "../AvatarWithEffect";
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

    useEffect(() => {
        setIsOpen(false);
    }, [normalizedPath, setIsOpen]);

    useEffect(() => {
        if (!isOpen || typeof window === "undefined" || window.innerWidth >= 1024) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        const previousTouchAction = document.body.style.touchAction;
        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none";

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.touchAction = previousTouchAction;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, setIsOpen]);

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
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-[115] bg-[radial-gradient(circle_at_top,rgba(109,99,255,0.14),transparent_36%),rgba(8,12,24,0.54)] backdrop-blur-md"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                id="sidebar"
                className={`fixed top-0 left-0 z-[120] h-screen transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:z-40"}
                    ${isExpanded ? "w-[min(88vw,320px)] lg:w-64" : "w-[min(88vw,320px)] lg:w-[72px]"}
                `}
            >
                <div className="relative flex h-full flex-col border-r border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)] shadow-[4px_0_24px_rgba(0,0,0,0.04)] backdrop-blur-3xl dark:shadow-[4px_0_32px_rgba(0,0,0,0.3)]">

                    {/* Subtle gradient on the side */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-r-none">
                        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[var(--site-accent)]/10 to-transparent" />
                        <div className="absolute left-0 top-0 h-40 w-full bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.14),transparent_72%)] opacity-80 lg:hidden" />
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close sidebar"
                        className="lg:hidden absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)] z-[110] rounded-2xl border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)] p-2.5 text-[var(--site-sidebar-fg)] transition-all hover:opacity-80"
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
                    <div className="flex h-[84px] shrink-0 items-center border-b border-[var(--site-sidebar-border)] px-5 pt-[max(env(safe-area-inset-top),0px)] lg:h-[70px] lg:pt-0">
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

                    {user && (
                        <div className="border-b border-[var(--site-sidebar-border)] px-4 py-4 lg:hidden">
                            <div className="glass-liquid rounded-[1.75rem] p-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative shrink-0">
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
                                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--site-sidebar-bg)] bg-[var(--site-accent)]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-[var(--site-sidebar-fg)]">{user.name}</p>
                                        <p className="truncate text-[11px] text-[var(--site-sidebar-fg)]/55">{user.email}</p>
                                    </div>
                                    <div className="rounded-full border border-[var(--site-secondary)]/16 bg-[var(--site-secondary)]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--site-secondary)]">
                                        {user.points || 0} PTS
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            setIsMessageOpen(true);
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--ghost-border)] bg-[var(--glass-bg)] px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--glass-text)] transition-all hover:border-[var(--site-secondary)]/30 hover:text-[var(--site-secondary)]"
                                    >
                                        <MessageSquare size={14} />
                                        Inbox
                                        {unreadMessages > 0 && (
                                            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-black leading-none text-white">
                                                {unreadMessages > 9 ? "9+" : unreadMessages}
                                            </span>
                                        )}
                                    </button>

                                    <Link
                                        href={`/profile/${user.username || user.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--ghost-border)] bg-[var(--glass-bg)] px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--glass-text)] transition-all hover:border-[var(--site-secondary)]/30 hover:text-[var(--site-secondary)]"
                                    >
                                        <User size={14} />
                                        Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="custom-scrollbar flex flex-1 flex-col items-stretch overflow-x-hidden overflow-y-auto px-0 py-4 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-4">
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
                                        { name: "My Inventory", href: "/inventory", icon: Package },
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

// â”€â”€â”€ Helper Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Global Navbar Component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    isSidebarOpen?: boolean;
    onToggleSidebar?: () => void;
};

export function GlobalNavbar({ user, dict, setIsMessageOpen, unreadMessages, isSidebarOpen = false, onToggleSidebar }: GlobalNavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const isFloatingNav = !user && (pathname === "/" || pathname === "/en" || pathname === "/id");

    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("hero");
    const [isNavVisible, setIsNavVisible] = useState(true);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const mobileSearchInputRef = useRef<HTMLInputElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);
    const isProgrammaticScroll = useRef(false);

    useEffect(() => {
        const query = searchParams.get("search");
        if (query !== null && pathname === "/projects") {
            setSearchQuery(query);
        } else if (pathname !== "/projects") {
            setSearchQuery("");
        }
    }, [searchParams, pathname]);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            setIsProfileOpen(false);
            setIsMobileSearchOpen(false);
        });

        return () => window.cancelAnimationFrame(frame);
    }, [pathname]);

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
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { root: null, rootMargin: "-50% 0px -50% 0px", threshold: 0 },
        );

        sections.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [isFloatingNav, pathname]);

    useEffect(() => {
        if (!isProfileOpen) return;

        const handleClick = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isProfileOpen]);

    useEffect(() => {
        if (!isMobileSearchOpen) return;

        const timeout = window.setTimeout(() => mobileSearchInputRef.current?.focus(), 80);
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMobileSearchOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.clearTimeout(timeout);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isMobileSearchOpen]);

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
    const currentPageLabel = breadcrumbs[breadcrumbs.length - 1]?.label || dict?.nav?.dashboard || "Dashboard";

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        if (!searchQuery.trim()) return;

        const pathParts = pathname.split("/").filter(Boolean);
        const lang = pathParts[0] === "en" || pathParts[0] === "id" ? pathParts[0] : "en";
        setIsMobileSearchOpen(false);
        router.push(`/${lang}/search?q=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <motion.header
            initial={isFloatingNav ? { y: -100, opacity: 0 } : { opacity: 1 }}
            animate={{ y: isFloatingNav ? (isNavVisible ? 0 : -200) : 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            id="global-navbar"
            style={isFloatingNav ? {} : { left: "var(--navbar-left)", width: "calc(100% - var(--navbar-left))" }}
            className={`flex items-center justify-between transition-all duration-500 ease-in-out
                ${isFloatingNav
                    ? "floating-dock fixed left-1/2 top-[max(env(safe-area-inset-top),1rem)] z-50 w-[calc(100%-1rem)] max-w-6xl -translate-x-1/2 rounded-full px-3 py-2.5 sm:top-6 sm:w-[92%] sm:px-5"
                    : `fixed top-0 right-0 z-40 min-h-[76px] px-3 py-[max(env(safe-area-inset-top),0.75rem)] sm:px-6 md:px-8 md:py-0 ${scrolled
                        ? "border-b border-[var(--ghost-border)] bg-[var(--glass-bg)] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.24)]"
                        : "border-b border-transparent bg-transparent"
                    }`
                }`}
        >
            <nav aria-label="Main Navigation" className="flex min-w-0 items-center">
                {isFloatingNav ? (
                    <div className="scrollbar-hide flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-white/[0.02] p-1">
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
                                    onClick={(event) => {
                                        event.preventDefault();
                                        isProgrammaticScroll.current = true;
                                        const element = document.querySelector(item.href);

                                        if (element) {
                                            element.scrollIntoView({ behavior: "smooth" });
                                            setActiveSection(item.id);
                                            setTimeout(() => {
                                                isProgrammaticScroll.current = false;
                                            }, 1000);
                                        }
                                    }}
                                    className={`relative rounded-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all sm:px-5 sm:text-[11px]
                                        ${isActive ? "text-[var(--site-secondary)]" : "text-[var(--glass-text)]/70 hover:text-[var(--site-secondary)]"}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="floating-nav-active"
                                            className="absolute inset-0 -z-10 rounded-full bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_24px_rgba(0,229,255,0.12)]"
                                            transition={{ type: "spring", stiffness: 350, damping: 35 }}
                                        />
                                    )}
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <span className="absolute bottom-[5px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--site-secondary)] shadow-[0_0_16px_rgba(0,229,255,0.8)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <>
                        <div className="flex min-w-0 items-center gap-2 lg:hidden">
                            {onToggleSidebar ? (
                                <button
                                    type="button"
                                    aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
                                    aria-expanded={isSidebarOpen}
                                    onClick={onToggleSidebar}
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--ghost-border)] bg-[var(--glass-bg)] text-[var(--glass-text)] shadow-[var(--glass-shadow)] transition-all hover:border-[var(--site-secondary)]/30 hover:text-[var(--site-secondary)]"
                                >
                                    {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                                </button>
                            ) : (
                                <Link
                                    href="/"
                                    aria-label="Go home"
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--ghost-border)] bg-[var(--glass-bg)] text-[var(--glass-text)] shadow-[var(--glass-shadow)] transition-all hover:border-[var(--site-secondary)]/30 hover:text-[var(--site-secondary)]"
                                >
                                    <HomeIcon className="h-4 w-4" />
                                </Link>
                            )}

                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[var(--glass-text-muted)]">
                                    Navigation
                                </p>
                                <p className="truncate text-sm font-bold tracking-tight text-[var(--glass-text)]">
                                    {dict?.nav?.[currentPageLabel.toLowerCase().replace(/ /g, "-")] || currentPageLabel}
                                </p>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <AnimatePresence mode="popLayout">
                                {breadcrumbs.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex items-center gap-1"
                                    >
                                        <Link href="/" className="rounded-full p-2 text-[var(--glass-text)]/40 transition-all hover:bg-white/[0.04] hover:text-[var(--glass-text)]">
                                            <HomeIcon className="h-3.5 w-3.5" />
                                        </Link>
                                        {breadcrumbs.map((item, index) => (
                                            <div key={item.href} className="flex items-center">
                                                <ChevronRight className="mx-0.5 h-3 w-3 text-[var(--glass-text)]/20" />
                                                <Link
                                                    href={item.href}
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200
                                                        ${index === breadcrumbs.length - 1
                                                            ? "border border-[var(--ghost-border)] bg-white/[0.04] text-[var(--site-secondary)]"
                                                            : "text-[var(--glass-text)]/55 hover:bg-white/[0.04] hover:text-[var(--glass-text)]"
                                                        }`}
                                                >
                                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.08 }}>
                                                        {dict?.nav?.[item.label.toLowerCase().replace(/ /g, "-")] || item.label}
                                                    </motion.span>
                                                </Link>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
                {!isFloatingNav && (
                    <button
                        type="button"
                        onClick={() => setIsMobileSearchOpen((open) => !open)}
                        aria-expanded={isMobileSearchOpen}
                        aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
                        className={`group rounded-full border p-2.5 text-[var(--glass-text-muted)] transition-all md:hidden ${isMobileSearchOpen
                            ? "border-[var(--site-secondary)]/28 bg-[var(--glass-bg-strong)] text-[var(--site-secondary)]"
                            : "border-transparent hover:border-[var(--ghost-border)] hover:bg-white/[0.04] hover:text-[var(--site-secondary)]"
                            }`}
                    >
                        {isMobileSearchOpen ? <X size={18} /> : <Search size={18} className="transition-transform group-hover:scale-110" />}
                    </button>
                )}

                <form onSubmit={handleSearch} className="group relative hidden md:block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--glass-text-muted)] transition-colors group-focus-within:text-[var(--site-secondary)]" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={dict.nav?.search_placeholder || "Search..."}
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="w-56 rounded-full border border-[var(--ghost-border)] bg-white/[0.04] py-2.5 pl-9 pr-11 text-sm text-[var(--glass-text)] transition-all duration-300 placeholder:text-[var(--glass-text-muted)] focus:w-64 focus:border-[var(--site-accent)]/45 focus:bg-[var(--glass-bg-strong)]"
                    />
                    <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center rounded-full border border-[var(--ghost-border)] bg-black/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--glass-text-muted)] transition-opacity group-focus-within:opacity-0 sm:inline-flex">
                        Ctrl K
                    </kbd>
                </form>

                <div className="mx-1 hidden h-8 w-px bg-gradient-to-b from-transparent via-white/12 to-transparent lg:block" />

                {user && (
                    <div className="hidden items-center gap-1.5 rounded-full border border-[var(--ghost-border)] bg-white/[0.04] px-3 py-1.5 text-[var(--site-secondary)] sm:flex">
                        <Coins size={13} />
                        <span className="font-mono text-xs font-black tabular-nums">{user.points || 0}</span>
                    </div>
                )}

                {user && (
                    <button
                        onClick={() => setIsMessageOpen(true)}
                        className="group relative rounded-full border border-transparent p-2.5 text-[var(--glass-text-muted)] transition-all hover:border-[var(--ghost-border)] hover:bg-white/[0.04] hover:text-[var(--site-secondary)]"
                    >
                        <MessageSquare size={18} className="transition-transform group-hover:scale-110" />
                        {unreadMessages > 0 && (
                            <span className="absolute right-1.5 top-1.5 flex items-center justify-center">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                                <span className="relative flex h-3 w-3 items-center justify-center rounded-full border border-white bg-red-500 text-[8px] font-black text-white dark:border-[#111]">
                                    {unreadMessages > 9 ? "9+" : unreadMessages}
                                </span>
                            </span>
                        )}
                    </button>
                )}

                {user && (
                    <div className="hidden sm:block">
                        <NotificationDropdown
                            userId={user?.id || ""}
                            dict={dict}
                            isOpen={isNotifOpen}
                            onToggle={() => setIsNotifOpen(!isNotifOpen)}
                            onClose={() => setIsNotifOpen(false)}
                        />
                    </div>
                )}

                <div className="hidden sm:block">
                    <ModeToggle />
                </div>

                {user ? (
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            aria-expanded={isProfileOpen}
                            aria-haspopup="menu"
                            className={`group relative flex items-center gap-2.5 overflow-hidden rounded-full py-1.5 pl-2 pr-1.5 transition-all duration-200
                                ${isProfileOpen
                                    ? "border border-[var(--ghost-border)] bg-white/[0.06]"
                                    : "border border-[var(--ghost-border)] bg-white/[0.03] hover:border-[var(--site-secondary)]/30 hover:bg-white/[0.05]"
                                }`}
                        >
                            <span className="hidden text-xs font-bold tracking-tight text-[var(--glass-text)] sm:block">
                                {user.name?.split(" ")[0]}
                            </span>
                            <div className="relative">
                                <div className={`rounded-xl bg-gradient-to-tr p-[1.5px] transition-all duration-300 ${isProfileOpen ? "from-[var(--site-secondary)] to-[var(--site-accent)]/40" : "from-[var(--site-sidebar-border)] to-transparent group-hover:from-[var(--site-secondary)]/60"}`}>
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
                                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--site-sidebar-bg)] bg-[var(--site-accent)] shadow-sm" />
                            </div>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <>
                                    <motion.button
                                        type="button"
                                        aria-label="Close profile menu"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setIsProfileOpen(false)}
                                        className="fixed inset-0 z-40 bg-[rgba(8,12,24,0.32)] backdrop-blur-sm sm:hidden"
                                    />

                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(8px)" }}
                                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(8px)" }}
                                        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                                        className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.9rem)] z-50 overflow-hidden rounded-[2rem] border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:absolute sm:right-0 sm:top-full sm:inset-x-auto sm:mt-3 sm:w-72"
                                    >
                                    <div className="border-b border-[var(--ghost-border)] p-4">
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
                                                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--glass-bg)] bg-[var(--site-accent)]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold text-[var(--glass-text)]">{user.name}</p>
                                                <p className="truncate text-[11px] text-[var(--glass-text-muted)]">{user.email}</p>
                                            </div>
                                            <span className="shrink-0 rounded-full border border-[var(--ghost-border)] bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--site-secondary)]">
                                                {user.role || "User"}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between rounded-[1.4rem] border border-[var(--ghost-border)] bg-white/[0.03] p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--site-secondary)]/10">
                                                    <Coins size={14} className="text-[var(--site-secondary)]" />
                                                </div>
                                                <div>
                                                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--glass-text-muted)]">Balance</p>
                                                    <p className="mt-0.5 text-sm font-black leading-none text-[var(--glass-text)]">
                                                        {user.points || 0} <span className="text-[10px] font-bold text-[var(--site-secondary)]">PTS</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <Link href="/digitalproducts" onClick={() => setIsProfileOpen(false)} className="text-xs font-bold text-[var(--site-secondary)] transition-opacity hover:opacity-80">
                                                Digital Products
                                            </Link>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--glass-text-muted)]">
                                                    Quick preferences
                                                </p>
                                                <p className="mt-1 text-xs text-[var(--glass-text-muted)]">
                                                    Theme toggle and account actions stay one tap away.
                                                </p>
                                            </div>
                                            <ModeToggle />
                                        </div>
                                    </div>

                                    <div className="p-2">
                                        {["admin", "super_admin"].includes(user.role?.toLowerCase() || "") && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="group mb-1 flex items-center gap-3 rounded-[1.35rem] border border-[var(--ghost-border)] bg-gradient-to-r from-[var(--site-secondary)]/10 to-transparent px-3 py-2.5 text-sm font-bold text-[var(--site-secondary)] transition-all hover:from-[var(--site-secondary)]/18"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--site-secondary)]/10">
                                                    <ShieldCheck size={14} />
                                                </div>
                                                {dict.nav?.admin_panel || "Admin Panel"}
                                                <Zap size={12} className="ml-auto opacity-60 transition-opacity group-hover:opacity-100" />
                                            </Link>
                                        )}

                                        {[
                                            { label: dict.nav?.profile || "Profile", href: `/profile/${user.username || user.id}`, icon: User },
                                            { label: dict.nav?.settings || "Settings", href: "/settings", icon: Settings },
                                        ].map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsProfileOpen(false)}
                                                className="group flex items-center gap-3 rounded-[1.35rem] px-3 py-2.5 text-sm font-medium text-[var(--glass-text)]/72 transition-all hover:bg-white/[0.04] hover:text-[var(--glass-text)]"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.03] transition-colors group-hover:bg-[var(--site-secondary)]/10 group-hover:text-[var(--site-secondary)]">
                                                    <item.icon size={14} />
                                                </div>
                                                {item.label}
                                            </Link>
                                        ))}

                                        <Link
                                            href="/notifications"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="group flex items-center gap-3 rounded-[1.35rem] px-3 py-2.5 text-sm font-medium text-[var(--glass-text)]/72 transition-all hover:bg-white/[0.04] hover:text-[var(--glass-text)] sm:hidden"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.03] transition-colors group-hover:bg-[var(--site-secondary)]/10 group-hover:text-[var(--site-secondary)]">
                                                <Bell size={14} />
                                            </div>
                                            {dict.nav?.notifications || "Notifications"}
                                        </Link>

                                        <div className="mx-1 my-1.5 h-px bg-[var(--ghost-border)]" />

                                        <button
                                            onClick={() => signOut()}
                                            className="group flex w-full items-center gap-3 rounded-[1.35rem] px-3 py-2.5 text-sm font-medium text-[var(--glass-text-muted)] transition-all hover:bg-red-500/10 hover:text-red-400"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition-colors group-hover:bg-red-500/20">
                                                <LogOut size={14} />
                                            </div>
                                            {dict.nav?.log_out || "Sign Out"}
                                        </button>
                                    </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="whitespace-nowrap rounded-full bg-[var(--site-button)] px-5 py-2.5 text-sm font-bold uppercase tracking-[0.16em] text-[var(--site-button-text)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_18px_40px_rgba(0,229,255,0.2)]"
                    >
                        {dict.nav?.login || "Sign In"}
                    </Link>
                )}
            </div>

            <AnimatePresence>
                {!isFloatingNav && isMobileSearchOpen && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close search panel"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileSearchOpen(false)}
                            className="fixed inset-0 z-[39] bg-[rgba(8,12,24,0.2)] backdrop-blur-sm md:hidden"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: -14, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                            className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.8rem)] z-[41] rounded-[1.8rem] border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] p-3 shadow-[var(--glass-shadow)] backdrop-blur-2xl md:hidden"
                        >
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--glass-text-muted)]" />
                                    <input
                                        ref={mobileSearchInputRef}
                                        type="text"
                                        placeholder={dict.nav?.search_placeholder || "Search..."}
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        className="h-12 w-full rounded-2xl border border-[var(--ghost-border)] bg-[var(--glass-bg)] py-3 pl-10 pr-4 text-sm font-medium text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)] focus:border-[var(--site-accent)]/45 focus:bg-[var(--glass-bg-strong)]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--site-button)] px-4 text-xs font-black uppercase tracking-[0.18em] text-[var(--site-button-text)] shadow-[0_16px_34px_rgba(0,229,255,0.16)]"
                                >
                                    Go
                                </button>
                            </form>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {[
                                    { label: dict.nav?.works || "Works", href: "/projects" },
                                    { label: "Digital Products", href: "/digitalproducts" },
                                    { label: user ? (dict.nav?.settings || "Settings") : (dict.nav?.contact || "Contact"), href: user ? "/settings" : "/contact" },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileSearchOpen(false)}
                                        className="rounded-full border border-[var(--ghost-border)] bg-[var(--glass-bg)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--glass-text)] transition-all hover:border-[var(--site-secondary)]/28 hover:text-[var(--site-secondary)]"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
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

