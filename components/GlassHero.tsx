"use client";

import { motion } from "framer-motion";
import NextImage from "next/image";

const GlassHero = () => {
    return (
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        rotate: [0, 10, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--site-accent)]/30 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                        rotate: [0, -10, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--site-accent-next)]/20 rounded-full blur-3xl"
                />
            </div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-12">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 text-center md:text-left"
                >
                    <h2 className="text-xl md:text-2xl font-light tracking-wide mb-4 text-[var(--glass-text-muted)]">
                        Hello, I'm a
                    </h2>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="text-gradient">Graphic</span> <br />
                        <span className="text-[var(--glass-text)]">Designer</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--glass-text-muted)] mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                        Currently, I'm focused on building accessible, human-centered products at Upstatement.ics with functional design.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-[var(--site-accent-prev)] to-[var(--site-accent-next)] px-8 py-4 rounded-full text-[var(--site-button-text)] font-medium tracking-wide shadow-lg shadow-[var(--site-accent)]/30 transition-all duration-300"
                        >
                            View Portfolio
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 rounded-full text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] font-medium tracking-wide border border-transparent hover:border-[var(--glass-border)] transition-all"
                        >
                            Contact Me
                        </motion.button>
                    </div>
                </motion.div>

                {/* Visual Element - Profile Image */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full max-w-[320px] md:max-w-[500px] aspect-square flex items-center justify-center md:flex-1"
                >
                    {/* Decorative Circle Background */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--site-accent-prev)]/20 to-[var(--site-accent-next)]/20 rounded-full blur-3xl animate-pulse" />

                    {/* Glass Container for Image */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative w-[260px] h-[260px] md:w-[400px] md:h-[400px] rounded-full md:rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl glass group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 z-10" />

                        <NextImage
                            src="/profile.png"
                            alt="Profile"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            priority
                        />

                        {/* Floating Badge (Mobile Optimized) */}
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20 glass px-4 py-2 rounded-full border border-white/20 shadow-lg flex items-center gap-2"
                        >
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[var(--site-accent)] animate-pulse" />
                            <span className="text-xs md:text-sm font-medium text-white">Open to Work</span>
                        </motion.div>
                    </motion.div>

                    {/* Orbiting Elements */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full border border-white/5 border-dashed pointer-events-none"
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default GlassHero;
