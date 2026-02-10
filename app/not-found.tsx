"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import ParticleWave from "@/components/ParticleWave";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function NotFound() {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-teal-500/30`}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background text-foreground">

                        {/* Consistent Particle Background */}
                        <ParticleWave />

                        {/* Background Noise & Gradient Overlays - Matching Main Layout */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
                            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center px-4">
                            {/* Elegant Glass Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="glass p-12 md:p-20 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden max-w-3xl w-full ring-1 ring-white/10"
                            >
                                {/* Refined Decorative Glow */}
                                <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

                                {/* Top Line Accent */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    className="mb-8"
                                >
                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-teal-400 text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-md shadow-lg shadow-black/10">
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                                        Page Not Found
                                    </span>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                                    className="text-9xl md:text-[12rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/10 mb-6 select-none drop-shadow-2xl font-mono"
                                >
                                    404
                                </motion.h1>

                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    className="text-2xl md:text-4xl font-light mb-6 text-white tracking-tight"
                                >
                                    Lost in the <span className="font-medium text-teal-300">Digital Void</span>
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                    className="text-base md:text-lg text-white/60 mb-12 max-w-lg mx-auto leading-relaxed font-light"
                                >
                                    The coordinates you are looking for seem to have drifted away. <br className="hidden md:block" /> Let's re-align your trajectory.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7, duration: 0.8 }}
                                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                                >
                                    <Link
                                        href="/"
                                        className="group relative px-8 py-4 rounded-full bg-white text-black font-medium shadow-xl hover:shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300 w-full sm:w-auto overflow-hidden"
                                    >
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                                        <div className="flex items-center justify-center gap-2">
                                            <Home size={18} />
                                            <span>Return Home</span>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={() => window.history.back()}
                                        className="group px-8 py-4 rounded-full glass bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                            <span>Go Back</span>
                                        </div>
                                    </button>
                                </motion.div>

                            </motion.div>

                            {/* Minimal Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2, duration: 1.0 }}
                                className="mt-12"
                            >
                                <Link href="/contact" className="text-xs text-white/30 hover:text-teal-400 transition-colors duration-300 uppercase tracking-widest">
                                    Report a Broken Link
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
