"use client";

import { useRef, useState, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    maxTilt?: number; // Maximum tilt angle in degrees, default 15
    perspective?: number; // CSS perspective, default 1000
    scaleOnHover?: number; // Scale factor on hover, default 1.05
}

export default function TiltCard({
    children,
    className = "",
    maxTilt = 15,
    perspective = 1000,
    scaleOnHover = 1.02
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Motion values for x and y tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth physics-based springs
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    // Transform mouse position to rotation values
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]);

    // Dynamic sheen/glare effect position
    const sheenX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    const sheenY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);
    const sheenOpacity = useTransform(mouseY, [-0.5, 0.5], [0, 0.2]); // Visible only when tilted

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        // Calculate mouse position relative to card center (normalized from -0.5 to 0.5)
        const width = rect.width;
        const height = rect.height;

        const mouseXRel = e.clientX - rect.left;
        const mouseYRel = e.clientY - rect.top;

        const xPct = (mouseXRel / width) - 0.5;
        const yPct = (mouseYRel / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            whileHover={{ scale: scaleOnHover }}
            className={`relative transition-all duration-200 ease-out ${className}`}
        >
            <div
                style={{
                    transformStyle: "preserve-3d",
                }}
                className="w-full h-full relative"
            >
                {/* Content Container - Preserves interaction */}
                <div style={{ transform: "translateZ(0)" }} className="w-full h-full">
                    {children}
                </div>

                {/* Glosssy Sheen Overlay */}
                <motion.div
                    style={{
                        background: `radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.4), transparent 50%)`,
                        opacity: sheenOpacity,
                        pointerEvents: "none"
                    }}
                    className="absolute inset-0 z-50 rounded-[inherit] mix-blend-overlay"
                />
            </div>
        </motion.div>
    );
}
