"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Mail, FileText, ExternalLink, Github, Quote } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PortfolioLandingPageProps {
    user: any;
    config: any;
    projects: any[];
    isPreview?: boolean;
}

export default function PortfolioLandingPage({ user, config, projects, isPreview = false }: PortfolioLandingPageProps) {
    // Default values if config is missing some fields
    const {
        primaryColor = "#0ea5e9",
        fontFamily = "inter",
        heroTitle = `Hi, I'm ${user.name || user.username}`,
        heroDescription = user.bio || "Welcome to my portfolio.",
        showResume = true,
        showContact = true,
        layoutType = "minimal"
    } = config || {};

    const fontClass = fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';

    return (
        <div className={`min-h-screen bg-slate-900 text-white ${fontClass} ${isPreview ? 'overflow-hidden rounded-xl border border-white/10' : ''}`}>

            {/* Custom Navbar */}
            <nav className={`${isPreview ? 'absolute' : 'fixed'} top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-slate-900/80 backdrop-blur-md`}>
                <div className="text-xl font-bold" style={{ color: primaryColor }}>
                    {user.username}
                </div>
                <div className="flex gap-6">
                    <Link href="#work" className="hover:text-white/80 transition-colors">Work</Link>
                    {showContact && <Link href="#contact" className="hover:text-white/80 transition-colors">Contact</Link>}
                    {/* Back to main site link just in case */}
                    <Link href={`/profile/${user.username}`} className="text-xs opacity-50 hover:opacity-100 flex items-center gap-1">
                        <ArrowLeft size={12} /> Profile
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
                {/* Background Image or Blobs */}
                {config?.heroImage ? (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={config.heroImage}
                            alt="Hero Background"
                            className="w-full h-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    </div>
                ) : (
                    <>
                        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[128px] opacity-20" style={{ backgroundColor: primaryColor }} />
                        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-[128px] opacity-20" style={{ backgroundColor: primaryColor }} />
                    </>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-3xl space-y-8"
                >
                    {user.imageURL && (
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl mb-8">
                            <img src={user.imageURL} alt={user.username} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                        {heroTitle}
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
                        {heroDescription}
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center pt-8">
                        {showContact && (
                            <Link
                                href="#contact"
                                className="px-8 py-4 rounded-full font-bold text-slate-900 transition-transform hover:scale-105"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Let's Talk
                            </Link>
                        )}
                        {showResume && user.resumeURL && (
                            <a
                                href={user.resumeURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 rounded-full font-bold bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
                            >
                                <FileText size={20} />
                                Resume
                            </a>
                        )}
                    </div>
                </motion.div>
            </section>




            {/* Featured Projects */}
            <section id="work" className="py-24 px-4 bg-black/20">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold mb-16 flex items-center gap-4">
                        <span className="w-12 h-1 rounded-full" style={{ backgroundColor: primaryColor }} />
                        Selected Work
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {projects.map((project: any, index: number) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group"
                            >
                                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-800 relative mb-6">
                                    {project.image ? (
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                                            No Preview
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <Link href={`/project/${project.slug}`} className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform">
                                            <ExternalLink size={24} />
                                        </Link>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-2 group-hover:text-teal-400 transition-colors">{project.title}</h3>
                                <p className="text-slate-400 line-clamp-2">{project.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Contact Section */}
            {showContact && (
                <section id="contact" className="py-24 px-4 text-center">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl font-bold">Get in Touch</h2>
                        <p className="text-slate-400">
                            Interested in working together? I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                        </p>
                        <a
                            href={`mailto:${user.email}`}
                            className="inline-flex items-center gap-3 text-2xl font-bold hover:underline underline-offset-8 decoration-2"
                            style={{ textDecorationColor: primaryColor }}
                        >
                            <Mail size={24} style={{ color: primaryColor }} />
                            {user.email}
                        </a>

                        <div className="flex justify-center gap-6 pt-8">
                            {user.socialLinks?.map((link: any, idx: number) => (
                                <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    {/* Ideally render icon based on platform */}
                                    <ExternalLink size={20} />
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <footer className="py-12 text-center text-slate-600 text-sm border-t border-white/5">
                <p>© {new Date().getFullYear()} {user.name || user.username}. All rights reserved.</p>
                <p className="mt-2">Powered by Akun Portfolio</p>
            </footer>
        </div>
    );
}
