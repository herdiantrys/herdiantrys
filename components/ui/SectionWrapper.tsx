"use client";

import { motion, useScroll, useTransform, Variants, useSpring } from "framer-motion";
import { useRef } from "react";

interface SectionWrapperProps {
    children: React.ReactNode;
    id?: string;
    className?: string;
    parallaxSpeed?: number;
    parallax?: boolean;
    stagger?: boolean;
    delay?: number;
}

const sectionVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.98,
        y: 40,
        filter: "blur(10px)",
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1], // Expo-out for premium feel
        }
    }
};

export default function SectionWrapper({
    children,
    id,
    className = "",
    parallaxSpeed = 0.15, // Slightly subtler default
    parallax = true,
    stagger = true,
    delay = 0,
}: SectionWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    // Weighted spring parallax for a 'professional' feel
    const rawY = useTransform(scrollYProgress, [0, 1], [0, -120 * parallaxSpeed]);
    const springY = useSpring(rawY, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section
            ref={containerRef}
            id={id}
            className={`relative py-16 sm:py-24 flex flex-col items-center overflow-visible ${className}`}
        >
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-5%" }}
                variants={sectionVariants}
                style={parallax ? { y: springY } : {}}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </section>
    );
}
