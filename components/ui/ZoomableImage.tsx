"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export const ZoomableImage = ({ src, alt }: { src: string; alt: string }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [constraints, setConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // If no source is provided, do not render
    if (!src) return null;

    const updateConstraints = (newScale: number) => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            const x = (width * newScale - width) / 2;
            const y = (height * newScale - height) / 2;
            setConstraints({ left: -x, right: x, top: -y, bottom: y });
        }
    };

    const clampPosition = (x: number, y: number, newScale: number) => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            const maxX = (width * newScale - width) / 2;
            const maxY = (height * newScale - height) / 2;
            return {
                x: Math.min(Math.max(x, -maxX), maxX),
                y: Math.min(Math.max(y, -maxY), maxY)
            };
        }
        return { x, y };
    };

    const handleZoomIn = () => {
        setScale((s) => {
            const newScale = Math.min(s + 0.5, 4);
            updateConstraints(newScale);
            return newScale;
        });
    };

    const handleZoomOut = () => {
        setScale((s) => {
            const newScale = Math.max(s - 0.5, 1);
            updateConstraints(newScale);
            if (newScale === 1) setPosition({ x: 0, y: 0 });
            return newScale;
        });
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setConstraints({ left: 0, right: 0, top: 0, bottom: 0 });
    };

    // Update constraints on mount and resize
    useEffect(() => {
        updateConstraints(scale);
        window.addEventListener('resize', () => updateConstraints(scale));
        return () => window.removeEventListener('resize', () => updateConstraints(scale));
    }, [scale]);

    // Handle scroll to zoom
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY * -0.01;
            const newScale = Math.min(Math.max(scale + delta, 1), 4);

            if (newScale === 1) {
                setPosition({ x: 0, y: 0 });
            } else {
                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left - rect.width / 2;
                const mouseY = e.clientY - rect.top - rect.height / 2;

                // Calculate new position to keep mouse over same point
                const scaleRatio = newScale / scale;
                const newX = mouseX - (mouseX - position.x) * scaleRatio;
                const newY = mouseY - (mouseY - position.y) * scaleRatio;

                const clamped = clampPosition(newX, newY, newScale);
                setPosition(clamped);
            }

            setScale(newScale);
            updateConstraints(newScale);
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        // @ts-ignore - Passive event listener
        return () => container.removeEventListener('wheel', handleWheel);
    }, [scale, position]);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center group">
            <motion.div
                drag={scale > 1}
                dragConstraints={constraints}
                dragElastic={0.2}
                animate={{ scale: scale, x: position.x, y: position.y }}
                onDragEnd={(e, { offset }) => {
                    setPosition((prev) => {
                        const newX = prev.x + offset.x;
                        const newY = prev.y + offset.y;
                        return clampPosition(newX, newY, scale);
                    });
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                style={{ cursor: scale > 1 ? "grab" : "default" }}
            >
                <div className="relative w-full h-full">
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-contain pointer-events-none"
                    />
                </div>
            </motion.div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full glass bg-black/50 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button
                    onClick={handleZoomOut}
                    className="p-2 rounded-full hover:bg-white/20 text-white transition-colors disabled:opacity-50"
                    disabled={scale <= 1}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                </button>
                <span className="text-xs font-medium text-white min-w-[3ch] text-center">
                    {Math.round(scale * 100)}%
                </span>
                <button
                    onClick={handleZoomIn}
                    className="p-2 rounded-full hover:bg-white/20 text-white transition-colors disabled:opacity-50"
                    disabled={scale >= 4}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                </button>
                <div className="w-px h-4 bg-white/20 mx-1" />
                <button
                    onClick={handleReset}
                    className="p-2 rounded-full hover:bg-white/20 text-white transition-colors text-xs font-medium"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};
