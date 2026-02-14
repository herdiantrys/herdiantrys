"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminClientLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div id="admin-layout-container" className="min-h-screen flex">
            <style jsx global>{`
                :root {
                    --navbar-left: ${isSidebarOpen ? (isCollapsed ? "80px" : "256px") : "0px"};
                }
                @media (max-width: 1024px) {
                    :root {
                        --navbar-left: 0px;
                    }
                }
            `}</style>

            <AdminSidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <main
                id="admin-main-content"
                className={`
                    flex-1 p-4 md:p-8 overflow-y-auto h-screen transition-all duration-300 pt-28 md:pt-32
                    ${isSidebarOpen ? "lg:ml-64" : "ml-0 lg:ml-20"}
                `}
            >
                <div className="max-w-7xl mx-auto md:mt-0 mt-4">
                    {children}
                </div>
            </main>
        </div>
    );
}
