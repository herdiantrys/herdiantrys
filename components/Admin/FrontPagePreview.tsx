"use client";

import { ThemeConfig } from "@/lib/types/theme";
import { useEffect, useRef } from "react";
import { Smartphone, Monitor } from "lucide-react";

export default function FrontPagePreview({ theme }: { theme: ThemeConfig }) {
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
        <div className="w-full h-full flex flex-col bg-black/5 dark:bg-white/5 rounded-3xl overflow-hidden border border-white/10">
            {/* Browser Header / Device Frame */}
            <div className="bg-white/10 p-3 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                    </div>
                    <span className="text-xs text-[var(--glass-text-muted)] ml-2 font-mono">
                        Front Page Preview
                    </span>
                </div>
                <div className="flex items-center gap-2 text-[var(--glass-text-muted)]">
                    <Monitor size={14} className="opacity-50" />
                </div>
            </div>

            {/* Iframe */}
            <div className="flex-1 relative bg-white dark:bg-black">
                <iframe
                    ref={iframeRef}
                    src="/"
                    className="w-full h-full border-none"
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
                {/* Overlay to prevent interaction while dragging/editing if needed, 
                     but we likely want interaction to test hover states. 
                     So we keep it interactive. */}
            </div>
            <div className="p-2 bg-white/5 text-[10px] text-center text-[var(--glass-text-muted)] border-t border-white/5">
                Real-time Preview
            </div>
        </div>
    );
}
