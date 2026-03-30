"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

const getSectionColor = (sectionId: string, theme: string | undefined) => {
    const isLight = theme === "light";

    switch (sectionId) {
        case "hero":
            return "rgba(2, 6, 23, 0)";
        case "portfolio":
            return isLight ? "#edf3fb" : "#0d1527";
        case "services":
            return isLight ? "#eef7ff" : "#0e182d";
        case "testimonials":
            return isLight ? "#f3efff" : "#0c1426";
        case "partners":
            return isLight ? "#eaf2fb" : "#0f172b";
        case "about":
            return isLight ? "#edf1f9" : "#0c1426";
        case "contact":
            return isLight ? "#e5edf8" : "#070d1b";
        default:
            return "rgba(2, 6, 23, 0)";
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
    const pathname = usePathname();
    const isHomePage = ["/", "/en", "/id"].includes(pathname);

    const { scrollYProgress } = useScroll();
    const { resolvedTheme } = useTheme();
    const isMounted = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false,
    );
    const [activeSection, setActiveSection] = useState("hero");

    useEffect(() => {
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

    if (!isMounted || !isHomePage || !resolvedTheme) return null;

    return (
        <>
            <div className="fixed inset-0 z-[0] pointer-events-none overflow-hidden">
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
                    className="absolute -top-[28%] -right-[8%] z-10 h-[70vw] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.18)_0%,rgba(0,229,255,0.06)_30%,transparent_68%)] blur-[140px]"
                />

                {/* Bottom Left Orb */}
                <motion.div
                    style={{ y: y2, rotate: rotate2, opacity }}
                    className="absolute top-[36%] -left-[22%] z-10 h-[82vw] w-[82vw] rounded-full bg-[radial-gradient(circle,rgba(143,125,255,0.18)_0%,rgba(143,125,255,0.06)_32%,transparent_72%)] blur-[160px]"
                />

                {/* Floating Circle (Bottom Right) - NEW */}
                <motion.div
                    style={{ y: y4 }}
                    className="absolute bottom-[8%] right-[6%] z-10 h-[180px] w-[180px] rounded-full bg-[radial-gradient(circle,rgba(195,245,255,0.12)_0%,transparent_70%)] blur-[70px]"
                />
            </div>

            {/* 3. Particle Wave / Noise Layer - Z-INDEX 50 (Strictly Top) */}
            <div className="fixed inset-0 z-[50] pointer-events-none bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay"></div>
        </>
    );
}
