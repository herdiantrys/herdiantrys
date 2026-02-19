"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    LayoutDashboard, Users, FileText, Briefcase, ShoppingBag,
    Settings, LogOut, Menu, X, FolderOpen, Star, Handshake,
    Mail, Layout, ChevronLeft, ChevronRight, Home, User, ShieldCheck,
    Layers, Bell, MessageSquare, Search, Palette, Trophy, Moon, Sun, Coins
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import NotificationDropdown from "@/components/Notification/NotificationDropdown";
import AvatarWithEffect from "../AvatarWithEffect";
import { getUnreadMessageCount as getDirectUnreadCount } from "@/lib/actions/message.actions";
import { getUnreadMessageCount } from "@/lib/actions/contact.actions";


type SidebarProps = {
    dict: any;
    isOpen: boolean; // Mobile toggle
    setIsOpen: (value: boolean) => void;
    user: any;
    isCollapsed: boolean; // Desktop collapse state
    setIsCollapsed: (value: boolean) => void;
    setIsMessageOpen: (value: boolean) => void;
    unreadMessages: number;
};

export default function Sidebar({ dict, isOpen, setIsOpen, user, isCollapsed, setIsCollapsed, setIsMessageOpen, unreadMessages }: SidebarProps) {
    const pathname = usePathname() || "";
    // Normalize path to ignore locale prefix (e.g. /en/dashboard -> /dashboard)
    const normalizedPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";

    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const isAdminSection = normalizedPath.startsWith("/admin");

    // Mode State: Defaults to Admin if in admin section, otherwise User. 
    // Can be toggled by admins.
    const [isAdminMode, setIsAdminMode] = useState(isAdminSection);

    // Sync mode with path on navigation, but allow manual override if staying on same page? 
    // Actually, usually you want to see the menu for the section you are in.
    useEffect(() => {
        setIsAdminMode(isAdminSection);
    }, [isAdminSection]);

    // Invert isCollapsed for AdminSidebar style logic (where "isOpen" usually meant expanded)
    // AdminSidebar: isOpen=true (expanded), isOpen=false (collapsed)
    const isExpanded = !isCollapsed;

    // Role Check
    const userRole = user?.role?.toLowerCase() || "";
    const isAuthorizedAdmin = ["admin", "super_admin"].includes(userRole);

    useEffect(() => {
        if (!user) return;
        const fetchAllUnread = async () => {
            // Admin Contact Messages
            if (isAuthorizedAdmin) {
                const res = await getUnreadMessageCount();
                if (res.success) setUnreadCount(res.count);
            }
            // Direct Messages - This is now handled by the parent component and passed as a prop
            // const dRes = await getDirectUnreadCount();
            // if (dRes.success) setUnreadMessages(dRes.count);
        };
        fetchAllUnread();
        const interval = setInterval(fetchAllUnread, 15000); // 15s polling for badges
        return () => clearInterval(interval);
    }, [user, isAuthorizedAdmin]);

    // Define Links
    const publicLinks = [
        { name: dict.nav.home || "Home", href: "/dashboard", icon: Home },
        { name: dict.nav.works || "Works", href: "/projects", icon: Briefcase },
        { name: "Search", href: "/search", icon: Search },
    ];

    if (user) {
        // Only show "Admin Panel" link in User Mode if authorized
        if (isAuthorizedAdmin && !isAdminMode) {
            // We can keep this as a quick link or rely on the toggle
            // publicLinks.push({ name: "Admin Panel", href: "/admin", icon: ShieldCheck });
        }
        publicLinks.push({ name: "Shop", href: "/shop", icon: ShoppingBag });
        publicLinks.push({ name: "Notifications", href: "/notifications", icon: Bell });
        publicLinks.push({ name: "Settings", href: "/settings", icon: Settings });
    }

    publicLinks.push(
        { name: dict.nav.about || "About", href: "/about", icon: User },
        { name: dict.nav.contact || "Contact", href: "/contact", icon: Mail }
    );

    const adminSections = [
        {
            title: "Overview",
            items: [
                { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
                { name: "Users", href: "/admin/users", icon: Users },
            ]
        },
        {
            title: "Content",
            items: [
                { name: "Projects", href: "/admin/projects", icon: FolderOpen },
                { name: "Posts", href: "/admin/posts", icon: FileText },
                { name: "Portfolio", href: "/admin/content", icon: Layout },
                { name: "Services", href: "/admin/services", icon: Briefcase },
                { name: "Categories", href: "/admin/categories", icon: Layers },
            ]
        },
        {
            title: "Engagement",
            items: [
                { name: "Comments", href: "/admin/comments", icon: MessageSquare },
                { name: "Notifications", href: "/admin/notifications", icon: Bell },
                { name: "Testimonials", href: "/admin/testimonials", icon: Star },
                { name: "Partners", href: "/admin/partners", icon: Handshake },
                { name: "Contacts", href: "/admin/contacts", icon: Mail },
            ]
        },
        {
            title: "System",
            items: [
                { name: "Shop", href: "/admin/shop", icon: ShoppingBag },
                { name: "Ranks", href: "/admin/ranks", icon: Trophy },
                { name: "Theme", href: "/admin/theme", icon: Palette },
            ]
        }
    ];

    const isActive = (href: string) => {
        // Strict match for Dashboard/Home
        if (href === "/dashboard" || href === "/") {
            return normalizedPath === "/dashboard" || normalizedPath === "/";
        }
        // Strict match for Admin Root to differentiate from sub-pages
        if (href === "/admin") {
            return normalizedPath === "/admin";
        }
        // Default startWith for other sub-routes
        return normalizedPath?.startsWith(href);
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                id="sidebar-mobile-toggle"
                onClick={() => setIsOpen(!isOpen)}
                className={`lg:hidden fixed top-[14px] left-4 z-[101] p-3 bg-[var(--site-sidebar-bg)]/80 backdrop-blur-xl rounded-full text-[var(--site-sidebar-fg)] hover:bg-[var(--site-sidebar-fg)]/10 shadow-xl transition-all border border-[var(--site-sidebar-border)] ${isOpen ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"}`}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <aside
                id="sidebar"
                className={`
                    fixed top-0 left-0 z-[120] h-screen transition-all duration-500 ease-in-out
                    ${isOpen ? "translate-x-0 w-full" : "-translate-x-full lg:translate-x-0 lg:z-40"}
                    ${isExpanded ? "lg:w-64" : "lg:w-20"}
                `}
            >
                <div className="flex flex-col h-full bg-white/10 dark:bg-black/20 backdrop-blur-3xl border-r border-white/20 dark:border-white/5 relative">

                    {/* Liquid Shine Overlay */}
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />


                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden absolute top-4 right-6 p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all z-[110]"
                    >
                        <X size={24} />
                    </button>

                    {/* Desktop Toggle Handle */}
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
                            transition-all duration-500 ease-out z-[150] group
                        `}
                    >
                        <div className="absolute inset-x-0 inset-y-2 bg-[var(--site-secondary)]/0 group-hover:bg-[var(--site-secondary)]/10 rounded-lg transition-colors" />
                        <div className={`
                            transform transition-all duration-500 group-hover:scale-110
                            ${isExpanded ? "rotate-0" : "rotate-180"}
                        `}>
                            <ChevronLeft
                                size={14}
                                className="text-white/40 group-hover:text-[var(--site-secondary)] drop-shadow-[0_0_8px_var(--site-secondary)]"
                            />
                        </div>

                        {/* Interactive Shine Edge */}
                        <div className="absolute inset-y-2 left-0 w-[1.5px] bg-gradient-to-b from-transparent via-[var(--site-secondary)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <div className="h-[74px] flex items-center px-6 border-b border-white/5 transition-all duration-500 overflow-hidden shrink-0 relative group/header">
                        <Link href={isAdminMode ? "/admin" : "/"} onClick={() => setIsOpen(false)} className="block relative z-10 flex items-center justify-center w-full">
                            {/* Expanded State */}
                            <div className={`flex items-center gap-3 transition-all duration-500 ${!isExpanded ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}>
                                <Image
                                    src="/logo.svg"
                                    alt="Logo"
                                    width={120}
                                    height={40}
                                    className="h-8 w-auto object-contain"
                                    priority
                                />
                                {isAdminMode && (
                                    <span className={`text-lg font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[var(--site-secondary)] to-[var(--site-secondary)] whitespace-nowrap`}>
                                        Admin<span className="text-foreground/80 font-medium">Panel</span>
                                    </span>
                                )}
                            </div>

                            {/* Collapsed State */}
                            {!isExpanded && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full flex justify-center">
                                    <Image
                                        src="/logo.svg"
                                        alt="Logo"
                                        width={32}
                                        height={32}
                                        className="h-8 w-8 object-contain"
                                        priority
                                    />
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 overflow-y-auto py-8 sm:py-4 space-y-6 sm:space-y-4 overflow-x-hidden custom-scrollbar flex flex-col items-stretch">

                        {isAdminMode ? (
                            <div className="space-y-1 w-full flex flex-col items-stretch">
                                {/* Admin Mode Menu */}
                                {adminSections.map((section, idx) => (
                                    <SidebarSection key={section.title} label={section.title} isExpanded={isExpanded} show={true}>
                                        {section.items.map((item) => (
                                            <SidebarLink
                                                key={item.href}
                                                item={item}
                                                active={isActive(item.href)}
                                                isExpanded={isExpanded}
                                                setIsOpen={setIsOpen}
                                                setIsCollapsed={setIsCollapsed}
                                                unreadCount={item.name === "Contacts" ? unreadCount : 0}
                                            />
                                        ))}
                                    </SidebarSection>
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* User Mode Menu */}
                                <SidebarSection label="Main Menu" isExpanded={isExpanded} show={true}>
                                    {[
                                        { name: dict.nav.home || "Home", href: "/dashboard", icon: Home },
                                        { name: dict.nav.works || "Works", href: "/projects", icon: Briefcase },
                                        { name: dict.nav.about || "About", href: "/about", icon: User },
                                        { name: dict.nav.contact || "Contact", href: "/contact", icon: Mail },
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

                                <SidebarSection label="Tools" isExpanded={isExpanded} show={true}>
                                    {[
                                        { name: "Shop", href: "/shop", icon: ShoppingBag },
                                        { name: "App Store", href: "/apps", icon: Layout },
                                        { name: "Search", href: "/search", icon: Search },
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

                                <SidebarSection label="User" isExpanded={isExpanded} show={!!user}>
                                    {[
                                        { name: "Profile", href: `/profile/${user?.username || user?.id || 'me'}`, icon: User },
                                        { name: "Messages", href: "#", icon: MessageSquare, onClick: () => setIsMessageOpen(true), unread: unreadMessages },
                                        { name: "Notifications", href: "/notifications", icon: Bell },
                                        { name: "Settings", href: "/settings", icon: Settings },
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
                            </>
                        )}

                        {/* Voice Channels Section Removed */}
                    </nav>

                    {/* Voice Controls Removed */}

                    {/* Footer */}
                    <div className="p-4 border-t border-white/5 flex flex-col items-stretch overflow-hidden gap-2">

                        {/* Admin/User Toggle Switcher */}
                        {isAuthorizedAdmin && (
                            <button
                                onClick={() => setIsAdminMode(!isAdminMode)}
                                className={`
                                    w-full flex items-center px-4 py-3 rounded-xl transition-all group relative overflow-hidden
                                    ${isAdminMode
                                        ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                        : "bg-teal-500/10 text-teal-400 hover:bg-teal-500/20"
                                    }
                                `}
                            >
                                <div className="relative z-10 flex items-center w-full justify-start">
                                    {isAdminMode ? <User size={20} className="min-w-[20px]" /> : <ShieldCheck size={20} className="min-w-[20px]" />}
                                    <span className={`ml-3 font-bold text-sm whitespace-nowrap transition-all duration-500 ${!isExpanded ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
                                        {isAdminMode ? "Switch to User" : "Switch to Admin"}
                                    </span>
                                    {unreadMessages > 0 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-white leading-none">{unreadMessages}</span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        )}

                        {/* Logout / Exit Button */}
                        <button
                            onClick={() => { setIsOpen(false); signOut(); }}
                            className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-white/5 text-[var(--glass-text-muted)] hover:text-red-400 border border-transparent transition-all group whitespace-nowrap"
                        >
                            <LogOut size={20} className="min-w-[20px] transition-transform group-hover:-translate-x-1" />
                            <span className={`ml-3 font-medium text-sm transition-all duration-500 ${!isExpanded ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
                                Log Out
                            </span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

// Helper Components
function SidebarSection({ label, children, isExpanded, show }: { label: string, children: React.ReactNode, isExpanded: boolean, show: boolean }) {
    if (!show) return null;
    return (
        <div className="w-full">
            <div className={`px-6 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400/60 transition-all duration-500 ${!isExpanded ? "opacity-0 h-0 overflow-hidden mb-0" : "opacity-100"}`}>
                {label}
            </div>
            {/* Added spacing div when collapsed to separate icons visually if needed */}
            {!isExpanded && <div className="w-8 mx-auto h-[1px] bg-white/10 my-2" />}

            <div className="space-y-1 w-full flex flex-col items-stretch">
                {children}
            </div>
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
                    setIsCollapsed(true); // Collapse sidebar if it was expanded for mobile/tablet
                }
            }}
            className={`
                flex items-center px-4 py-3 mx-2 rounded-xl transition-all group relative duration-300 w-auto
                ${active
                    ? "text-[var(--site-secondary)] font-bold"
                    : "text-[var(--glass-text-muted)] hover:text-white hover:bg-white/5"
                }
            `}
        >
            {active && (
                <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_var(--site-secondary)]/15 backdrop-blur-md -z-10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                />
            )}

            <div className="relative flex items-center">
                {(!isExpanded || isSmall) ? (
                    <Icon size={20} className={`transition-all duration-300 group-hover:scale-110 ${active ? "text-[var(--site-secondary)] drop-shadow-[0_0_8px_var(--site-secondary)]" : "opacity-70 group-hover:opacity-100"}`} />
                ) : (
                    <Icon size={18} className={`mr-3 transition-colors duration-300 ${active ? "text-[var(--site-secondary)]" : ""}`} />
                )}

                {(unreadCount ?? 0) > 0 && (
                    <div className={`
                        absolute top-1 right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-[rgba(var(--site-primary-rgb),0.5)] shadow-lg
                        ${!isExpanded ? "scale-75 -top-1 -right-1" : ""}
                    `}>
                        {unreadCount}
                    </div>
                )}
            </div>

            {isExpanded && !isSmall && (
                <span className={`ml-3 text-sm tracking-tight whitespace-nowrap transition-all duration-500 ${!isExpanded ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
                    {item.name}
                </span>
            )}
        </Link >
    );
}

// --- Global Navbar Component ---

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

    // Logic: Floating Navbar for Guest on Home (supports /en, /id)
    const isFloatingNav = !user && (pathname === "/" || pathname === "/en" || pathname === "/id");

    // State
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeSection, setActiveSection] = useState("hero");

    // refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Track client-side mounting to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync search input with URL
    useEffect(() => {
        const query = searchParams.get("search");
        if (query !== null && pathname === "/projects") {
            setSearchQuery(query);
        } else if (pathname !== "/projects") {
            setSearchQuery("");
        }
    }, [searchParams, pathname]);

    // Scroll Effect & Hide/Show Logic
    const [isNavVisible, setIsNavVisible] = useState(true);
    const lastScrollY = useRef(0);
    const isProgrammaticScroll = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 20);

            if (isFloatingNav && currentScrollY > 100 && !isProgrammaticScroll.current) {
                if (currentScrollY > lastScrollY.current) {
                    setIsNavVisible(false); // Scrolling down
                } else {
                    setIsNavVisible(true);  // Scrolling up
                }
            } else if (!isFloatingNav || currentScrollY <= 100) {
                setIsNavVisible(true); // Always visible at top or if not floating
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isFloatingNav]);

    // Active section tracking logic for floating nav
    useEffect(() => {
        if (!isFloatingNav) return;

        const sections = ["hero", "portfolio", "services", "testimonials", "partners", "about", "contact"];

        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [isFloatingNav, pathname]);

    // Helper: Generate Breadcrumbs
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
                breadcrumbs.push({
                    href: accumulateHref,
                    label
                });
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
            const url = `/${lang}/search?q=${encodeURIComponent(searchQuery)}`;
            router.push(url);
        }
    };

    return (
        <motion.header
            initial={isFloatingNav ? { y: -100, opacity: 0 } : { opacity: 1 }}
            animate={{
                y: isFloatingNav ? (isNavVisible ? 0 : -200) : 0,
                opacity: 1
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            id="global-navbar"
            style={isFloatingNav ? {} : {
                left: "var(--navbar-left)",
                width: "calc(100% - var(--navbar-left))"
            }}
            className={`transition-all duration-500 ease-in-out flex items-center justify-between ${isFloatingNav ? "fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[95%] max-w-7xl rounded-2xl sm:rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-3xl shadow-2xl border border-white/20 z-50 px-4 sm:px-6 py-3.5 sm:py-3" : `fixed top-0 right-0 h-[74px] px-4 sm:px-6 md:px-8 z-40 ${scrolled ? "bg-white/10 dark:bg-black/20 backdrop-blur-2xl border-b border-white/5 shadow-sm" : "bg-transparent border-b border-transparent"}`}`}
        >
            <nav aria-label="Main Navigation" className="hidden md:flex items-center">
                {isFloatingNav ? (
                    <div className="flex items-center gap-1">
                        {[
                            { label: dict.nav.home || "Home", href: "#hero", id: "hero" },
                            { label: dict.nav.works || "Portfolio", href: "#portfolio", id: "portfolio" },
                            { label: dict.nav.services || "Services", href: "#services", id: "services" },
                            { label: "About", href: "#about", id: "about" },
                            { label: dict.nav.contact || "Contact", href: "#contact", id: "contact" },
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
                                            setTimeout(() => {
                                                isProgrammaticScroll.current = false;
                                            }, 1000);
                                        }
                                    }}
                                    className={`
                                        px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all rounded-full relative group
                                        ${isActive
                                            ? "text-[var(--site-secondary)]"
                                            : "text-[var(--site-link)]/80 hover:text-[var(--site-secondary)]"
                                        }
                                    `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active-bg"
                                            className="absolute inset-0 bg-[var(--site-secondary)]/10 dark:bg-[var(--site-secondary)]/10 border border-[var(--site-secondary)]/20 dark:border-[var(--site-secondary)]/20 rounded-full -z-10"
                                            initial={false}
                                            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full -z-20" />
                                    <span className="relative z-10">{item.label}</span>
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
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm ml-14 lg:ml-0"
                            >
                                <Link href="/" className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all group">
                                    <HomeIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                </Link>

                                {breadcrumbs.map((item, index) => (
                                    <div key={item.href} className="flex items-center">
                                        <ChevronRight className="w-3 h-3 text-muted-foreground/30 mx-1" />
                                        <Link
                                            href={item.href}
                                            className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-300 ${index === breadcrumbs.length - 1
                                                ? "bg-[var(--site-secondary)]/10 text-[var(--site-secondary)] dark:text-[var(--site-secondary)] border border-[var(--site-secondary)]/20 shadow-[0_0_10px] shadow-[var(--site-secondary)]/10"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                                }`}
                                        >
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
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

            <div className="flex items-center justify-end flex-1 gap-2 sm:gap-3 md:gap-4">
                <form onSubmit={handleSearch} className="relative hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[var(--site-accent)] transition-colors" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 pl-10 pr-12 py-2 rounded-full bg-zinc-100 dark:bg-white/5 border border-transparent focus:border-[var(--site-accent)]/50 outline-none text-sm transition-all placeholder:text-muted-foreground/70 focus:w-80 focus:bg-white dark:focus:bg-black focus:shadow-[0_0_20px] focus:shadow-[var(--site-accent)]/10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </form>

                <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 hidden lg:block" />

                {user && (
                    <div className="flex items-center gap-1 sm:gap-2">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--site-accent)]/10 text-[var(--site-accent)] border border-[var(--site-accent)]/20 shadow-[0_0_15px_rgba(var(--site-accent-rgb),0.1)] transition-all">
                            <Coins size={14} className="fill-[var(--site-accent)]/20" />
                            <span className="text-xs font-bold font-mono">{user.points || 0}</span>
                        </div>

                        <button
                            onClick={() => setIsMessageOpen(true)}
                            className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all group"
                        >
                            <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                            {unreadMessages > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#111]">
                                    {unreadMessages > 9 ? '9+' : unreadMessages}
                                </span>
                            )}
                        </button>
                    </div>
                )}

                {user && (
                    <NotificationDropdown
                        userId={user?.id || ""}
                        dict={dict}
                        isOpen={isNotifOpen}
                        onToggle={() => setIsNotifOpen(!isNotifOpen)}
                        onClose={() => setIsNotifOpen(false)}
                    />
                )}

                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors relative overflow-hidden"
                    aria-label="Toggle theme"
                >
                    <div className="relative z-10">
                        {mounted ? (
                            theme === "dark" ? <Sun size={20} /> : <Moon size={20} />
                        ) : (
                            <div className="w-5 h-5" />
                        )}
                    </div>
                </button>

                {user ? (
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 p-1 pl-2 pr-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all"
                        >
                            <span className="text-sm font-medium hidden sm:block">
                                {user.name?.split(" ")[0]}
                            </span>
                            <div className="relative">
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
                            </div>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-64 p-2 rounded-2xl glass-panel shadow-2xl border border-white/20 dark:border-white/10 z-50 bg-white/80 dark:bg-[#111]/90 backdrop-blur-xl"
                                >
                                    <div className="px-4 py-3 border-b border-zinc-200 dark:border-white/5 mb-1">
                                        <p className="text-sm font-bold text-foreground">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>

                                    <div className="space-y-0.5">
                                        {['admin', 'superadmin'].includes(user.role?.toLowerCase() || '') && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-[var(--site-accent)]/10 hover:text-[var(--site-accent)] transition-colors"
                                            >
                                                Admin Panel
                                            </Link>
                                        )}
                                        <Link
                                            href={`/profile/${user.username || user.id}`}
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <User size={16} /> Profile
                                        </Link>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                                            <Settings size={16} /> Settings
                                        </button>
                                        <div className="h-px bg-zinc-200 dark:bg-white/5 my-1" />
                                        <button
                                            onClick={() => signOut()}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="px-6 py-2 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                        Sign In
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
