"use client";

import { ThemeConfig } from "@/lib/types/theme";
import { useState, useEffect, useRef } from "react";
import { Smartphone, Monitor } from "lucide-react";

export default function FrontPagePreview({ theme }: { theme: ThemeConfig }) {
    const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Send theme updates to iframe
    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                { type: "THEME_PREVIEW_UPDATE", theme },
                "*" // In production, restrictive origin is better, but "*" is fine for same-origin or preview
            );
        }
    }, [theme]);

    return (
        <div className="w-full h-full flex flex-col bg-black/5 dark:bg-white/5 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl backdrop-blur-sm">
            {/* Browser Header / Device Frame */}
            <div className="bg-white/10 p-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400/60 shadow-lg shadow-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-amber-400/60 shadow-lg shadow-amber-500/20" />
                        <div className="w-3 h-3 rounded-full bg-green-400/60 shadow-lg shadow-green-500/20" />
                    </div>
                </div>

                {/* Device Toggle */}
                <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setViewMode("desktop")}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === "desktop" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
                        title="Desktop View"
                    >
                        <Monitor size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode("mobile")}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === "mobile" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
                        title="Mobile View"
                    >
                        <Smartphone size={16} />
                    </button>
                </div>

                <div className="px-3 py-1 bg-black/20 rounded-lg border border-white/5">
                    <span className="text-[10px] text-[var(--glass-text-muted)] font-mono uppercase tracking-widest">
                        Live Preview
                    </span>
                </div>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 relative bg-white/5 flex items-center justify-center p-4 overflow-hidden">
                <div
                    className={`transition-all duration-500 ease-in-out h-full relative ${viewMode === "mobile"
                        ? "w-[375px] max-w-full rounded-[3rem] border-8 border-black shadow-2xl overflow-hidden scale-[0.85]"
                        : "w-full rounded-2xl border border-white/10"
                        }`}
                >
                    <iframe
                        ref={iframeRef}
                        src="/"
                        className="w-full h-full border-none bg-white dark:bg-black"
                        title="Theme Preview"
                        sandbox="allow-same-origin allow-scripts allow-forms"
                        onLoad={() => {
                            // Send initial theme once loaded to ensure sync
                            if (iframeRef.current?.contentWindow) {
                                iframeRef.current.contentWindow.postMessage(
                                    { type: "THEME_PREVIEW_UPDATE", theme },
                                    "*"
                                );
                            }
                        }}
                    />
                </div>
            </div>

            <div className="px-4 py-2 bg-black/20 text-[10px] text-center text-[var(--glass-text-muted)] border-t border-white/5 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Theme Engine Synchronized
            </div>
        </div>
    );
}
