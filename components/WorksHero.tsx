"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";

export default function WorksHero({ dict, projectCount }: { dict: any, projectCount: number }) {
    return (
        <section className="relative w-full h-[45vh] min-h-[350px] flex items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 brightness-100 contrast-150"></div>
                {/* Smooth fade to bottom content */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--glass-bg)] to-transparent"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass bg-white/5 border border-teal-500/30 text-teal-400 mb-6"
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
                    className="text-5xl md:text-7xl font-bold mb-6 text-white text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-white to-cyan-200"
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
