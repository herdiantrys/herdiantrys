"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Compass } from "lucide-react";
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
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-background text-foreground">

                        {/* Particle Background */}
                        <ParticleWave />

                        {/* Light Mode Gradient Blobs */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-400/15 dark:bg-teal-600/10 rounded-full blur-[120px] animate-pulse" />
                            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-400/15 dark:bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-300/8 dark:opacity-0 rounded-full blur-[100px]" />
                            {/* Light mode subtle grid */}
                            <div className="absolute inset-0 dark:hidden" style={{
                                backgroundImage: 'radial-gradient(circle, #94a3b820 1px, transparent 1px)',
                                backgroundSize: '32px 32px'
                            }} />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-3xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="
                                    w-full p-10 md:p-16 rounded-[2.5rem] relative overflow-hidden
                                    bg-white/80 dark:bg-white/5
                                    backdrop-blur-2xl
                                    border border-gray-200/80 dark:border-white/10
                                    shadow-[0_24px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.4)]
                                    ring-1 ring-black/5 dark:ring-white/10
                                "
                            >
                                {/* Decorative glow — different colors per mode */}
                                <div className="absolute -top-20 -left-20 w-48 h-48 bg-teal-400/20 dark:bg-teal-500/20 rounded-full blur-3xl" />
                                <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-violet-400/20 dark:bg-purple-500/20 rounded-full blur-3xl" />

                                {/* Top shimmer */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-teal-400/40 dark:via-white/20 to-transparent" />

                                {/* Badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    className="mb-8"
                                >
                                    <span className="
                                        inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase
                                        border border-teal-300/60 dark:border-teal-500/30
                                        bg-teal-50 dark:bg-teal-500/10
                                        text-teal-600 dark:text-teal-400
                                        shadow-sm
                                    ">
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
                                        Page Not Found
                                    </span>
                                </motion.div>

                                {/* 404 Number */}
                                <motion.h1
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                                    className="
                                        text-9xl md:text-[11rem] font-bold leading-none tracking-tighter mb-4 select-none font-mono
                                        text-transparent bg-clip-text
                                        bg-gradient-to-b
                                        from-gray-900 via-gray-700 to-gray-400
                                        dark:from-white dark:via-white/90 dark:to-white/10
                                        drop-shadow-sm dark:drop-shadow-2xl
                                    "
                                >
                                    404
                                </motion.h1>

                                {/* Title */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    className="text-2xl md:text-3xl font-light mb-5 tracking-tight text-gray-800 dark:text-white"
                                >
                                    Lost in the{" "}
                                    <span className="font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
                                        Digital Void
                                    </span>
                                </motion.h2>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                    className="text-base md:text-lg text-gray-500 dark:text-white/60 mb-10 max-w-md mx-auto leading-relaxed font-light"
                                >
                                    The page you're looking for doesn't exist or has been moved.{" "}
                                    <br className="hidden md:block" />
                                    Let's re-align your trajectory.
                                </motion.p>

                                {/* Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7, duration: 0.8 }}
                                    className="flex flex-col sm:flex-row gap-3 justify-center items-center"
                                >
                                    <Link
                                        href="/"
                                        className="
                                            group relative px-8 py-3.5 rounded-full font-medium
                                            text-white bg-gradient-to-r from-teal-500 to-cyan-500
                                            hover:from-teal-400 hover:to-cyan-400
                                            shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30
                                            hover:scale-105 transition-all duration-300
                                            w-full sm:w-auto overflow-hidden
                                        "
                                    >
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                                        <div className="flex items-center justify-center gap-2 relative z-10">
                                            <Home size={17} />
                                            <span>Return Home</span>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={() => window.history.back()}
                                        className="
                                            group px-8 py-3.5 rounded-full font-medium
                                            border border-gray-300 dark:border-white/10
                                            bg-gray-100/80 dark:bg-white/5
                                            text-gray-700 dark:text-white
                                            hover:bg-gray-200/80 dark:hover:bg-white/10
                                            hover:border-gray-400 dark:hover:border-white/30
                                            hover:scale-105 transition-all duration-300
                                            w-full sm:w-auto backdrop-blur-sm
                                        "
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <ArrowLeft size={17} className="group-hover:-translate-x-1 transition-transform" />
                                            <span>Go Back</span>
                                        </div>
                                    </button>
                                </motion.div>

                                {/* Compass decorative icon */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1, duration: 1 }}
                                    className="mt-10 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-white/25 font-medium tracking-widest uppercase select-none"
                                >
                                    <Compass size={12} className="opacity-60" />
                                    <span>Error 404</span>
                                    <Compass size={12} className="opacity-60 scale-x-[-1]" />
                                </motion.div>
                            </motion.div>

                            {/* Footer link */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2, duration: 1.0 }}
                                className="mt-8"
                            >
                                <Link
                                    href="/contact"
                                    className="text-xs text-gray-400 dark:text-white/30 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-300 uppercase tracking-widest"
                                >
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
