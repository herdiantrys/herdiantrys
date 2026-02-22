"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";
import { useRef } from "react";

export default function WorksHero({ dict, projectCount, bgImage }: { dict: any, projectCount: number, bgImage?: string }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    // Parallax effect: moves image down slower than scroll speed
    // The output range determines how far it moves down.
    // Making it smaller (e.g., "0%", "20%") prevents it from moving too far and exposing empty space.
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    return (
        <section ref={ref} className="relative w-full h-[45vh] min-h-[350px] flex items-center justify-center overflow-hidden mt-[-110px]">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {bgImage ? (
                    <motion.div
                        className="absolute bg-cover bg-center bg-no-repeat transition-opacity duration-1000 opacity-30"
                        style={{
                            // Start further up with -30% and make the height greater than 100% to accommodate the scroll
                            top: "-30%",
                            bottom: "-30%",
                            left: "-10%",
                            right: "-10%",
                            backgroundImage: `url(${bgImage})`,
                            y: backgroundY
                        }}
                    />
                ) : (
                    <>
                        <div className="absolute top-[-20%] left-0 w-[500px] h-[500px] bg-[var(--site-secondary)]/20 rounded-full blur-[100px] animate-pulse"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--site-secondary)]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                    </>
                )}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 brightness-100 contrast-150"></div>
                {/* Smooth fade to bottom content */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--glass-bg)] to-transparent"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass bg-white/5 border border-[var(--site-secondary)]/30 text-[var(--site-secondary)] mb-6"
                >
                    <Sparkles size={16} />
                    <span className="text-sm font-medium tracking-wide uppercase">
                        {projectCount} Featured Projects
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-5xl md:text-7xl font-bold mb-6 text-white text-transparent bg-clip-text bg-gradient-to-r from-[var(--site-secondary)] via-white to-[var(--site-secondary)]"
                >
                    {dict.portfolio.title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-xl md:text-2xl text-[var(--glass-text-muted)] max-w-2xl mx-auto leading-relaxed mb-12"
                >
                    {dict.portfolio.description}
                </motion.p>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-400"
            >
                <ArrowDown size={24} />
            </motion.div>
        </section>
    );
}
