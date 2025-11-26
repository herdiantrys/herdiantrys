"use client";

import { motion } from "framer-motion";

const GlassHero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        rotate: [0, 10, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                        rotate: [0, -10, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
                />
            </div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
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
                        Crafting visual experiences that blend modern aesthetics with functional design.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="glass glass-hover px-8 py-4 rounded-full text-[var(--glass-text)] font-medium tracking-wide"
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

                {/* Visual Element - Floating Glass Cards */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex-1 relative h-[400px] w-full max-w-[500px]"
                >
                    {/* Main Card */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 z-20"
                    >
                        <div className="glass w-full h-full rounded-2xl p-6 flex flex-col justify-between border-[var(--glass-border)]">
                            <div className="w-12 h-12 rounded-full bg-[var(--glass-border)]" />
                            <div className="space-y-3">
                                <div className="h-4 bg-[var(--glass-border)] rounded w-3/4" />
                                <div className="h-4 bg-[var(--glass-border)] rounded w-1/2" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Background Card 1 */}
                    <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-4 -right-4 w-full h-full z-10"
                    >
                        <div className="glass w-full h-full rounded-2xl bg-[var(--glass-bg)] border-[var(--glass-border)]" />
                    </motion.div>

                    {/* Background Card 2 */}
                    <motion.div
                        animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute -bottom-4 -left-4 w-full h-full z-10"
                    >
                        <div className="glass w-full h-full rounded-2xl bg-[var(--glass-bg)] border-[var(--glass-border)]" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default GlassHero;
