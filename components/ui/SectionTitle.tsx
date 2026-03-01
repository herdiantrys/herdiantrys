"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { ReactNode } from "react";

interface SectionTitleProps {
    title: ReactNode;
    subtitle?: ReactNode;
    className?: string;
    alignment?: "left" | "center" | "right";
    theme?: "dark" | "light"; // For future extensibility if needed
}

export const SectionTitle = ({
    title,
    subtitle,
    className = "",
    alignment = "center",
}: SectionTitleProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    // Parallax effects
    const yTitle = useTransform(scrollYProgress, [0, 1], [50, -50]); // Title moves up slightly
    const ySubtitle = useTransform(scrollYProgress, [0, 1], [20, -20]); // Subtitle moves slower
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    // Alignment classes
    const alignClass = {
        left: "text-left items-start",
        center: "text-center items-center",
        right: "text-right items-end",
    }[alignment];

    return (
        <div
            ref={containerRef}
            className={`flex flex-col mb-16 relative z-10 ${alignClass} ${className}`}
        >
            {/* Decorative Line */}
            <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "circOut" }}
                className="w-24 h-1 bg-[var(--site-secondary)] mb-6 rounded-full"
            />

            {/* Main Title with Coordinated Reveal */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-10%" }}
                variants={{
                    hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }
                }}
            >
                <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-gray-200 dark:to-gray-400 drop-shadow-sm">
                        {title}
                    </span>
                </h2>
            </motion.div>

            {/* Subtitle with Coordinated Reveal */}
            {subtitle && (
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-10%" }}
                    variants={{
                        hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
                        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] } }
                    }}
                >
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl font-light tracking-wide">
                        {subtitle}
                    </p>
                </motion.div>
            )}
        </div>
    );
};
