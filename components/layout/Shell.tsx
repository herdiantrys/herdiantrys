"use client";

import { useState, useEffect } from "react";
import Sidebar, { GlobalNavbar } from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import MessageCenter from "../Messages/MessageCenter";
import { usePathname } from "next/navigation";
import ParticleWaveWrapper from "../ParticleWaveWrapper";
import ScrollBackground from "../ScrollBackground";
import { AnimatePresence, motion } from "framer-motion";

import { getUnreadMessageCount as getDirectUnreadCount } from "@/lib/actions/message.actions";
import { updateUserPresence } from "@/lib/actions/user.actions";

type ShellProps = {
    children: React.ReactNode;
    dict: any;
    user: any;
    variant?: 'default' | 'guest';
};

export default function Shell({ children, dict, user, variant = 'default' }: ShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        if (!user) return;
        const fetchUnread = async () => {
            const res = await getDirectUnreadCount();
            if (res.success) setUnreadMessages(res.count);
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 15000);

        // Presence Heartbeat: Update current user's presence every 1 minute
        const updatePresence = () => updateUserPresence(user.id);
        updatePresence(); // Initial call
        const presenceInterval = setInterval(updatePresence, 60000);

        return () => {
            clearInterval(interval);
            clearInterval(presenceInterval);
        };
    }, [user]);
    const pathname = usePathname();
    const isHome = ["/", "/en", "/id"].includes(pathname);

    const normalizedPath = pathname?.replace(/^\/[a-z]{2}/, "") || "/";
    const isAdmin = normalizedPath.startsWith("/admin") || normalizedPath === "/admin";

    // Detect Portfolio Route: /profile/[username]/portfolio
    const isPortfolio = /^\/profile\/[^/]+\/portfolio/.test(normalizedPath);

    // Common background logic
    const bgClass = "bg-transparent";

    if (variant === 'guest') {
        return (
            <div className={`flex flex-col min-h-screen transition-colors duration-300 ${bgClass}`}>
                <ParticleWaveWrapper />
                {!isPortfolio && <GlobalNavbar user={user} dict={dict} setIsMessageOpen={setIsMessageOpen} unreadMessages={unreadMessages} />}
                <main className="flex-1 relative">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className={`flex min-h-screen transition-colors duration-300 ${bgClass}`}>
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --navbar-left: ${isCollapsed ? "5rem" : "16rem"};
                }
                @media (max-width: 768px) {
                    :root {
                        --navbar-left: 0px;
                    }
                }
            `}} />
            <ScrollBackground />
            <ParticleWaveWrapper />
            {/* Unified Sidebar handles both User and Admin modes */}
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

            {!isPortfolio && <GlobalNavbar user={user} dict={dict} setIsMessageOpen={setIsMessageOpen} unreadMessages={unreadMessages} />}

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isPortfolio ? '' : isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                <main className="flex-1 relative z-10 pt-0 px-0 pb-20 lg:pb-0">
                    {children}
                </main>
            </div>

            {/* Premium Mobile Bottom Navigation */}
            {!isPortfolio && <MobileBottomNav user={user} dict={dict} />}

            {/* Live Messaging Hub */}
            {user && !isPortfolio && (
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
