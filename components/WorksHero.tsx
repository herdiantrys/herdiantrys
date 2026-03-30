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
        <section ref={ref} className="relative mt-[-96px] flex h-[40vh] min-h-[300px] w-full items-center justify-center overflow-hidden sm:mt-[-110px] sm:h-[45vh] sm:min-h-[350px]">
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
                        <div className="absolute left-0 top-[-20%] h-[320px] w-[320px] animate-pulse rounded-full bg-[var(--site-secondary)]/10 blur-[100px] dark:bg-[var(--site-secondary)]/20 sm:h-[500px] sm:w-[500px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] h-[320px] w-[320px] animate-pulse rounded-full bg-[var(--site-secondary)]/10 blur-[100px] dark:bg-[var(--site-secondary)]/20 sm:h-[500px] sm:w-[500px]" style={{ animationDelay: '2s' }}></div>
                    </>
                )}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 brightness-100 contrast-150"></div>
                {/* Smooth fade to bottom content */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--glass-bg)] to-transparent"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--site-secondary)]/20 bg-[var(--site-secondary)]/10 px-3.5 py-2 text-[var(--site-secondary)] shadow-sm sm:mb-6 sm:px-4"
                >
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-wide sm:text-sm">
                        {projectCount} Featured Projects
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mb-4 bg-gradient-to-r from-[var(--site-secondary)] via-[var(--glass-text)] to-[var(--site-secondary)] bg-clip-text text-[clamp(2.75rem,11vw,4.5rem)] font-bold text-transparent md:text-7xl sm:mb-6"
                >
                    {dict.portfolio.title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-[var(--glass-text-muted)] sm:mb-12 sm:text-lg md:text-2xl"
                >
                    {dict.portfolio.description}
                </motion.p>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-gray-400 sm:bottom-10"
            >
                <ArrowDown size={24} />
            </motion.div>
        </section>
    );
}
