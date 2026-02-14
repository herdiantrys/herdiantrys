"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const getSectionColor = (sectionId: string, theme: string | undefined) => {
    const isLight = theme === "light";

    switch (sectionId) {
        case "hero": return "rgba(2, 6, 23, 0)"; // Transparent (shows body gradient)
        case "portfolio": return isLight ? "#f8fafc" : "#0f172a"; // Slate 50 : Slate 900
        case "services": return isLight ? "#f0f9ff" : "#083344"; // Sky 50 : Cyan 950
        case "testimonials": return isLight ? "#f0fdf4" : "#022c22"; // Green 50 : Emerald 950
        case "partners": return isLight ? "#ffffff" : "#000000"; // White : Black
        case "about": return isLight ? "#f9fafb" : "#111827"; // Gray 50 : Gray 900
        case "contact": return isLight ? "#f1f5f9" : "#020617"; // Slate 100 : Slate 950
        default: return "rgba(2, 6, 23, 0)";
    }
};

const getTransitionVariants = (sectionId: string) => {
    switch (sectionId) {
        case "portfolio":
            // Expanding Circle from Bottom (Sunrise style)
            return {
                initial: { clipPath: "circle(0% at 50% 100%)", zIndex: 1 },
                animate: { clipPath: "circle(150% at 50% 100%)", zIndex: 1 },
                exit: { opacity: 0, zIndex: 0, transition: { duration: 1 } }
            };
        case "services":
            // Angled Wipe from Top-Right (Tech style)
            return {
                initial: { clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)", zIndex: 1 },
                animate: { clipPath: "polygon(100% 0, 0 0, 0 100%, 100% 100%)", zIndex: 1 },
                exit: { opacity: 0, zIndex: 0 }
            };
        case "testimonials":
            // Diamond Expand from Center (Organic bloom)
            return {
                initial: { clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)", zIndex: 1 },
                animate: { clipPath: "polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)", zIndex: 1 },
                exit: { opacity: 0, zIndex: 0 }
            };
        case "partners":
            // Horizontal Shutters / Inset (Cinematic)
            return {
                initial: { clipPath: "inset(100% 0 0 0)", zIndex: 1 },
                animate: { clipPath: "inset(0 0 0 0)", zIndex: 1 },
                exit: { opacity: 0, zIndex: 0 }
            };
        case "about":
            // Spiral-ish / Corner Circle (Personal)
            return {
                initial: { clipPath: "circle(0% at 0% 0%)", zIndex: 1 },
                animate: { clipPath: "circle(150% at 0% 0%)", zIndex: 1 },
                exit: { opacity: 0, zIndex: 0 }
            };
        case "contact":
            // Reverse Circle center
            return {
                initial: { clipPath: "circle(0% at 50% 50%)", zIndex: 1 },
                animate: { clipPath: "circle(150% at 50% 50%)", zIndex: 1 },
                exit: { opacity: 0, zIndex: 0 }
            };
        default:
            // Default Fade
            return {
                initial: { opacity: 0, zIndex: 1 },
                animate: { opacity: 1, zIndex: 1 },
                exit: { opacity: 0, zIndex: 0 }
            };
    }
};

export default function ScrollBackground() {
    const { scrollYProgress } = useScroll();
    const { resolvedTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);
    const [activeSection, setActiveSection] = useState("hero");

    useEffect(() => {
        setIsMounted(true);

        const sections = ["hero", "portfolio", "services", "testimonials", "partners", "about", "contact"];

        const observerCallback: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            // This creates a narrow detection line in the center of the viewport
            // effectively asking "what section is crossing the middle of the screen?"
            rootMargin: "-50% 0px -50% 0px",
            threshold: 0
        });

        sections.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    // Enhanced Parallax transforms
    const y1 = useTransform(scrollYProgress, [0, 1], [0, 600]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -600]);
    // const y3 = useTransform(scrollYProgress, [0, 1], [0, 400]); // Removed Diamond
    const y4 = useTransform(scrollYProgress, [0, 1], [0, -300]);

    const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 180]);
    const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -90]);

    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.4, 0.6, 0.6, 0]);

    if (!isMounted) return null;

    return (
        <>
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* 1. Dynamic Background Color Layer (Base) - Z-INDEX 1 */}
                <div className="absolute inset-0 z-[1]">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {activeSection !== "hero" && (
                            <motion.div
                                key={activeSection}
                                {...getTransitionVariants(activeSection)}
                                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} // Cubic Bezier for smooth "out of box" feel
                                style={{ backgroundColor: getSectionColor(activeSection, resolvedTheme) }}
                                className="absolute inset-0"
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Parallax Elements - Z-INDEX 10 (Above colors) */}

                <motion.div
                    style={{ y: y1, rotate: rotate1, opacity }}
                    className="absolute -top-[30%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-[color-mix(in_srgb,var(--site-secondary),transparent_90%)] to-[color-mix(in_srgb,var(--site-secondary),transparent_95%)] blur-[120px] z-10"
                />

                {/* Bottom Left Orb */}
                <motion.div
                    style={{ y: y2, rotate: rotate2, opacity }}
                    className="absolute top-[40%] -left-[20%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-tr from-[color-mix(in_srgb,var(--site-secondary),transparent_95%)] to-[color-mix(in_srgb,var(--site-secondary),transparent_90%)] blur-[150px] z-10"
                />

                {/* Floating Circle (Bottom Right) - NEW */}
                <motion.div
                    style={{ y: y4 }}
                    className="absolute bottom-[10%] right-[5%] w-[150px] h-[150px] rounded-full bg-gradient-to-t from-[color-mix(in_srgb,var(--site-secondary),transparent_90%)] to-transparent blur-[60px] z-10"
                />
            </div>

            {/* 3. Particle Wave / Noise Layer - Z-INDEX 50 (Strictly Top) */}
            <div className="fixed inset-0 z-[50] pointer-events-none bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay"></div>
        </>
    );
}
