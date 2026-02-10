"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import AdminSidebar from "../Admin/AdminSidebar";
import { usePathname } from "next/navigation";
import ParticleWaveWrapper from "../ParticleWaveWrapper";
import GlobalNavbarClient from "../GlobalNavbarClient";

type ShellProps = {
    children: React.ReactNode;
    dict: any;
    user: any;
    variant?: 'default' | 'guest';
};

export default function Shell({ children, dict, user, variant = 'default' }: ShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const isHome = ["/", "/en", "/id"].includes(pathname);

    const normalizedPath = pathname?.replace(/^\/[a-z]{2}/, "") || "/";
    const isAdmin = normalizedPath.startsWith("/admin") || normalizedPath === "/admin";

    // Common background logic
    const bgClass = "bg-transparent";

    if (variant === 'guest') {
        return (
            <div className={`flex flex-col min-h-screen transition-colors duration-300 ${bgClass}`}>
                <ParticleWaveWrapper />
                <GlobalNavbarClient user={user} dict={dict} />
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
            <ParticleWaveWrapper />
            {isAdmin ? (
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />
            ) : (
                <Sidebar
                    dict={dict}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    user={user}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />
            )}

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                <GlobalNavbarClient user={user} dict={dict} />
                <main className="flex-1 relative pt-0 px-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
