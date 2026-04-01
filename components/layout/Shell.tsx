"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import ParticleWaveWrapper from "../ParticleWaveWrapper";
import HomeFloatingNavbar from "./HomeFloatingNavbar";

import { getUnreadMessageCount as getDirectUnreadCount } from "@/lib/actions/message.actions";
import { updateUserPresence } from "@/lib/actions/user.actions";

const Sidebar = dynamic(() => import("./Sidebar"));
const GlobalNavbar = dynamic(() => import("./Sidebar").then((mod) => mod.GlobalNavbar));
const MobileBottomNav = dynamic(() => import("./MobileBottomNav"));
const MessageCenter = dynamic(() => import("../Messages/MessageCenter"), { ssr: false });
const ScrollBackground = dynamic(() => import("../ScrollBackground"), { ssr: false });

type ShellProps = {
    children: React.ReactNode;
    dict: Record<string, unknown>;
    user: { id?: string } | null;
    variant?: "default" | "guest";
};

export default function Shell({ children, dict, user, variant = "default" }: ShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        if (!user?.id) return;
        const userId = user.id;
        const fetchUnread = async () => {
            const res = await getDirectUnreadCount();
            if (res.success) setUnreadMessages(res.count);
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 15000);

        const updatePresence = () => updateUserPresence(userId);
        updatePresence();
        const presenceInterval = setInterval(updatePresence, 60000);

        return () => {
            clearInterval(interval);
            clearInterval(presenceInterval);
        };
    }, [user]);

    const pathname = usePathname();
    const normalizedPath = pathname?.replace(/^\/[a-z]{2}/, "") || "/";
    const isHomeGuestPage = variant === "guest" && ["/", "/en", "/id"].includes(pathname || "/");

    const isPortfolio = /^\/profile\/[^/]+\/portfolio/.test(normalizedPath);
    const bgClass = "bg-transparent";

    if (variant === "guest") {
        return (
            <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-300 ${bgClass}`}>
                <ParticleWaveWrapper />
                {!isPortfolio && (
                    isHomeGuestPage
                        ? <HomeFloatingNavbar dict={dict} />
                        : <GlobalNavbar user={user} dict={dict} setIsMessageOpen={setIsMessageOpen} unreadMessages={unreadMessages} />
                )}
                <main className="relative flex-1">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className={`flex min-h-screen overflow-x-clip transition-colors duration-300 ${bgClass}`}>
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --shell-topbar-height: 76px;
                    --shell-sidebar-collapsed-width: 72px;
                    --shell-sidebar-expanded-width: 16rem;
                    --navbar-left: ${isCollapsed ? "var(--shell-sidebar-collapsed-width)" : "var(--shell-sidebar-expanded-width)"};
                }
                @media (max-width: 768px) {
                    :root {
                        --navbar-left: 0px;
                    }
                }
            `}} />
            <ScrollBackground />
            <ParticleWaveWrapper />
            {!isPortfolio && (
                <Sidebar
                    dict={dict}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    user={user}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    setIsMessageOpen={setIsMessageOpen}
                    unreadMessages={unreadMessages}
                />
            )}

            {!isPortfolio && (
                <GlobalNavbar
                    user={user}
                    dict={dict}
                    setIsMessageOpen={setIsMessageOpen}
                    unreadMessages={unreadMessages}
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
                />
            )}

            <div className={`flex min-w-0 flex-1 flex-col transition-all duration-500 ease-in-out ${isPortfolio ? "" : isCollapsed ? "md:ml-[var(--shell-sidebar-collapsed-width)]" : "md:ml-[var(--shell-sidebar-expanded-width)]"}`}>
                <main className="relative z-10 flex-1 px-0 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-0 md:pb-24 lg:pb-0">
                    {children}
                </main>
            </div>

            {!isPortfolio && <MobileBottomNav user={user} dict={dict} />}

            {user?.id && !isPortfolio && (
                <MessageCenter
                    currentUserId={user.id}
                    isOpen={isMessageOpen}
                    onClose={() => setIsMessageOpen(false)}
                    onOpen={() => setIsMessageOpen(true)}
                />
            )}
        </div>
    );
}
