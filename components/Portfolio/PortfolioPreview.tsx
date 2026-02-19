"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, ExternalLink, Globe, MapPin, Quote, LayoutTemplate, User, Briefcase, MessageSquare, Star, Github, Twitter, Linkedin, Instagram, Youtube, Facebook } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const scaleIn = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5, ease: "backOut" }
};

interface PortfolioPreviewProps {
    config: any;
    user: any;
    projects: any[];
}

export default function PortfolioPreview({ config, user, projects }: PortfolioPreviewProps) {
    const [activeSection, setActiveSection] = useState("hero");

    const customStyle = {
        "--portfolio-primary": config.primaryColor || "#0f172a", // Slate-900
        "--portfolio-secondary": config.secondaryColor || "#1e293b", // Slate-800
        "--portfolio-accent": config.accentColor || "#14b8a6", // Teal-500
        "--portfolio-text": config.textColor || "#ffffff",
    } as React.CSSProperties;

    // Style Mappings
    const fontMap: Record<string, string> = {
        sans: "font-sans",
        serif: "font-serif",
        mono: "font-mono",
        display: "font-sans" // Fallback or custom class if added
    };

    const alignMap: Record<string, string> = {
        left: "text-left items-start",
        center: "text-center items-center mx-auto",
        right: "text-right items-end ml-auto"
    };

    const gridMap: Record<number, string> = {
        2: "md:grid-cols-2",
        3: "md:grid-cols-2 lg:grid-cols-3",
        4: "md:grid-cols-2 lg:grid-cols-4"
    };

    const radiusMap: Record<string, string> = {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-3xl"
    };

    const blurMap: Record<string, string> = {
        none: "backdrop-blur-none bg-[var(--portfolio-secondary)]",
        low: "backdrop-blur-sm bg-[var(--portfolio-secondary)]/80",
        medium: "backdrop-blur-md bg-[var(--portfolio-secondary)]/50",
        high: "backdrop-blur-xl bg-[var(--portfolio-secondary)]/30"
    };

    const currentFont = fontMap[config.fontFamily] || "font-sans";
    const currentAlign = alignMap[config.heroAlign] || alignMap.center;
    const currentGrid = gridMap[config.gridCols] || gridMap[3];
    const currentRadius = radiusMap[config.borderRadius] || radiusMap.xl;
    const currentBlur = blurMap[config.glassIntensity] || blurMap.medium;

    // Scroll Spy Logic
    useEffect(() => {
        const handleScroll = () => {
            const sections = ["hero", "about", "works", "testimony", "contact"];
            const scrollPosition = window.scrollY + 100; // Offset

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (
                        scrollPosition >= offsetTop &&
                        scrollPosition < offsetTop + offsetHeight
                    ) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop,
                behavior: "smooth",
            });
            setActiveSection(id);
        }
    };

    const navItems = [
        { id: "hero", label: "Home", icon: LayoutTemplate, show: config.showHero },
        { id: "about", label: "About", icon: User, show: config.showAbout },
        { id: "works", label: "Works", icon: Briefcase, show: config.showWorks },
        { id: "testimony", label: "Testimonials", icon: Quote, show: config.showTestimony },
        { id: "contact", label: "Contact", icon: MessageSquare, show: config.showContact },
    ].filter(item => item.show);

    return (
        <div style={customStyle} className={`min-h-screen bg-[var(--portfolio-primary)] text-[var(--portfolio-text)] selection:bg-[var(--portfolio-accent)]/30 ${currentFont}`}>

            {/* Dynamic Background Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {config.bgPattern === "dots" && (
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, var(--portfolio-text) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                )}
                {config.bgPattern === "grid" && (
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(var(--portfolio-text) 1px, transparent 1px), linear-gradient(90deg, var(--portfolio-text) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                )}
                {config.bgPattern === "noise" && (
                    <div className="absolute inset-0 opacity-5 bg-[url('/noise.png')] mix-blend-overlay" />
                )}
                {config.bgPattern === "mesh" && (
                    <>
                        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[var(--portfolio-accent)]/20 rounded-full blur-[100px] animate-pulse" />
                        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--portfolio-secondary)]/40 rounded-full blur-[100px]" />
                    </>
                )}
            </div>
            {/* Sticky Navigation */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
                <nav className="flex items-center gap-1 p-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${activeSection === item.id
                                ? "bg-[var(--portfolio-accent)] text-white shadow-lg"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            <span className="hidden md:inline">{item.label}</span>
                            <span className="md:hidden"><item.icon size={16} /></span>
                        </button>
                    ))}

                    {/* External Link back to profile */}
                    <Link
                        href={`/profile/${user.username}`}
                        className="ml-2 flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                        title="Back to Main Profile"
                    >
                        <ExternalLink size={14} />
                    </Link>
                </nav>
            </div>

            {/* HERO SECTION */}
            {config.showHero && (
                <section id="hero" className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        {config.heroImage ? (
                            <Image
                                src={config.heroImage}
                                alt="Hero Background"
                                fill
                                className="object-cover opacity-40"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    </div>
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={stagger}
                        className={`relative z-10 max-w-5xl space-y-8 flex flex-col ${currentAlign}`}
                    >
                        <motion.div variants={scaleIn} className="relative inline-block">
                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/10 overflow-hidden mx-auto shadow-2xl shadow-[var(--portfolio-accent)]/20 bg-white/5 flex items-center justify-center relative z-10">
                                <Image
                                    src={config.logo || (user.imageURL || user.image) as string || "/images/profile-picture-1.png"}
                                    alt={config.displayName || user.name || "Profile"}
                                    fill
                                    className={`${config.logo ? "object-contain p-4" : "object-cover"}`}
                                />
                            </div>
                            {/* Decorative ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-4 border border-white/5 rounded-full z-0 border-dashed"
                            />
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="text-6xl md:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-[var(--portfolio-text)] to-[var(--portfolio-text)]/40 leading-tight"
                        >
                            {config.heroTitle || `Hi, I'm ${config.displayName || user.name}`}
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="text-xl md:text-2xl text-[var(--portfolio-text)]/70 max-w-3xl leading-relaxed font-light"
                        >
                            {config.heroDescription || user.headline || "Creative Developer & Designer"}
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-wrap gap-6 pt-8">
                            {config.showContact && (
                                <button
                                    onClick={() => scrollToSection("contact")}
                                    className="px-10 py-4 rounded-full bg-[var(--portfolio-text)] text-[var(--portfolio-primary)] font-bold text-lg hover:scale-105 hover:shadow-xl hover:shadow-[var(--portfolio-accent)]/20 transition-all duration-300"
                                >
                                    Get in Touch
                                </button>
                            )}
                            {config.showWorks && (
                                <button
                                    onClick={() => scrollToSection("works")}
                                    className="px-10 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[var(--portfolio-text)] hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                                >
                                    View Work
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                </section>
            )
            }

            {/* ABOUT SECTION */}
            {
                config.showAbout && (
                    <section id="about" className="py-32 px-4 container mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="order-2 md:order-1 space-y-8"
                            >
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-bold">{config.aboutTitle || "About Me"}</h2>
                                    <div className="h-1.5 w-24 bg-[var(--portfolio-accent)] rounded-full" />
                                </div>
                                <p className="text-xl opacity-80 leading-relaxed whitespace-pre-wrap font-light">
                                    {config.aboutDescription || user.bio || "No bio available."}
                                </p>

                                {/* Social Links from User Profile */}
                                <div className="flex gap-4 pt-4">
                                    {/* Use optional chaining safely */}
                                    {(user as any).socialLinks?.map((link: any, idx: number) => (
                                        <motion.a
                                            key={idx}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            whileTap={{ scale: 0.95 }}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-4 rounded-full bg-white/5 border border-white/5 hover:bg-[var(--portfolio-accent)] hover:text-white transition-colors text-[var(--portfolio-text)]/70 shadow-lg"
                                        >
                                            <Globe size={24} />
                                        </motion.a>
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex flex-wrap gap-2 text-sm text-[var(--portfolio-text)]/50 pt-4"
                                >
                                    {user.location && (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                                            <MapPin size={16} className="text-[var(--portfolio-accent)]" />
                                            <span>{user.location}</span>
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>

                            {/* Optional About Image - or use user banner/profile mix */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`order-1 md:order-2 relative h-[500px] w-full overflow-hidden bg-white/5 border border-white/10 shadow-2xl group ${currentRadius}`}
                            >
                                {config.aboutImage ? (
                                    <Image
                                        src={config.aboutImage}
                                        alt="About"
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    // Fallback to banner or abstract pattern
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--portfolio-accent)]/20 to-[var(--portfolio-secondary)]/40" />
                                )}
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--portfolio-primary)]/80 via-transparent to-transparent opacity-60" />
                            </motion.div>
                        </div>
                    </section>
                )
            }

            {/* WORKS SECTION */}
            {
                config.showWorks && (
                    <section id="works" className="py-32 px-4 bg-[var(--portfolio-secondary)]">
                        <div className="container mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-center max-w-3xl mx-auto mb-20 space-y-6"
                            >
                                <h2 className="text-4xl md:text-5xl font-bold">{config.worksTitle || "Selected Works"}</h2>
                                <p className="text-xl text-[var(--portfolio-text)]/60 font-light">{config.worksDescription || "Check out some of my recent projects."}</p>
                            </motion.div>

                            <motion.div
                                variants={stagger}
                                initial="initial"
                                whileInView="animate"
                                viewport={{ once: true }}
                                className={`grid grid-cols-1 gap-10 ${currentGrid}`}
                            >
                                {projects.length > 0 ? (
                                    projects.map((project: any) => (
                                        <motion.div
                                            key={project.id}
                                            variants={fadeInUp}
                                            whileHover={{ y: -10 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <Link
                                                href={`/project/${project.slug}`}
                                                className={`group relative block aspect-[16/10] overflow-hidden bg-black/50 border border-white/5 hover:border-[var(--portfolio-accent)]/50 transition-all shadow-xl hover:shadow-[var(--portfolio-accent)]/10 ${currentRadius}`}
                                            >
                                                {project.image ? (
                                                    <Image
                                                        src={project.image}
                                                        alt={project.title}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full bg-white/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent">
                                                        <span className="text-white/20 font-bold text-2xl tracking-widest">NO IMAGE</span>
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                                <div className="absolute inset-0 flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                    <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                                                    <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                        {project.description}
                                                    </p>
                                                    <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                                                        <span className="text-[var(--portfolio-accent)] text-sm font-medium flex items-center gap-1">
                                                            View Project <ArrowLeft className="rotate-180" size={14} />
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-20 text-[var(--portfolio-text)]/50">
                                        <p className="text-xl">No projects to display yet.</p>
                                    </div>
                                )}
                            </motion.div>

                            {/* View All Button */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-20 text-center"
                            >
                                <Link
                                    href={`/profile/${user.username}`}
                                    className="inline-flex items-center gap-3 px-8 py-3 rounded-full border border-[var(--portfolio-accent)]/30 hover:bg-[var(--portfolio-accent)]/10 text-[var(--portfolio-accent)] transition-all uppercase tracking-wider text-sm font-medium"
                                >
                                    <span>View all works</span>
                                    <ExternalLink size={16} />
                                </Link>
                            </motion.div>
                        </div>
                    </section>
                )
            }

            {/* TESTIMONY SECTION */}
            {
                config.showTestimony && (
                    <section id="testimony" className="py-32 px-4 container mx-auto">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-bold text-center mb-16"
                        >
                            {config.testimonyTitle || "Testimonials"}
                        </motion.h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className={`p-10 border border-white/5 relative hover:border-[var(--portfolio-accent)]/30 transition-colors ${currentRadius} ${currentBlur}`}
                            >
                                <Quote className="text-[var(--portfolio-accent)] mb-6 opacity-80" size={40} />
                                <p className="text-[var(--portfolio-text)]/80 mb-8 italic text-lg leading-relaxed">"Simply an amazing person to work with. Highly skilled, professional, and delivered exactly what we needed."</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden relative">
                                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold opacity-50">IMG</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">John Smith</div>
                                        <div className="text-sm text-[var(--portfolio-text)]/50">CEO, Company Inc</div>
                                    </div>
                                </div>
                            </motion.div>
                            {/* Further implementation for dynamic testimonials would go here */}
                        </div>
                    </section>
                )
            }

            {/* CONTACT SECTION */}
            {
                config.showContact && (
                    <section id="contact" className="py-32 px-4 bg-gradient-to-t from-[var(--portfolio-accent)]/10 to-transparent">
                        <div className="max-w-5xl mx-auto text-center space-y-12">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl md:text-6xl font-bold mb-6">{config.contactTitle || "Let's work together"}</h2>
                                <p className="text-[var(--portfolio-text)]/60 max-w-2xl mx-auto text-xl font-light">
                                    Interested in collaborating or have a project in mind? Reach out to me via email or connect with me on social media.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start text-left pt-8">
                                {/* Contact Info & Socials */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="space-y-10 order-2 md:order-1"
                                >
                                    <div className="space-y-8">
                                        <h3 className="text-3xl font-bold mb-4">Contact Info</h3>

                                        <div className="flex items-center gap-5 text-[var(--portfolio-text)]/80 group">
                                            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[var(--portfolio-accent)] group-hover:text-white transition-colors duration-300">
                                                <Mail size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-[var(--portfolio-text)]/40 uppercase tracking-widest font-semibold mb-1">Email</p>
                                                <a href={`mailto:${config.contactEmail || user.email}`} className="text-xl md:text-2xl font-light hover:text-[var(--portfolio-accent)] transition-colors break-all">
                                                    {config.contactEmail || user.email}
                                                </a>
                                            </div>
                                        </div>

                                        {config.location && (
                                            <div className="flex items-center gap-5 text-[var(--portfolio-text)]/80 group">
                                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[var(--portfolio-accent)] group-hover:text-white transition-colors duration-300">
                                                    <MapPin size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-[var(--portfolio-text)]/40 uppercase tracking-widest font-semibold mb-1">Location</p>
                                                    <p className="text-xl md:text-2xl font-light">{config.location}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Socials */}
                                    {(config.socials && config.socials.length > 0) && (
                                        <div className="space-y-6">
                                            <h3 className="text-2xl font-bold">Follow Me</h3>
                                            <div className="flex flex-wrap gap-4">
                                                {config.socials.map((social: any, idx: number) => {
                                                    let Icon = Globe;
                                                    const platform = social.platform.toLowerCase();
                                                    if (platform.includes("github")) Icon = Github;
                                                    else if (platform.includes("twitter") || platform.includes("x.com")) Icon = Twitter;
                                                    else if (platform.includes("linkedin")) Icon = Linkedin;
                                                    else if (platform.includes("instagram")) Icon = Instagram;
                                                    else if (platform.includes("youtube")) Icon = Youtube;
                                                    else if (platform.includes("facebook")) Icon = Facebook;

                                                    return (
                                                        <motion.a
                                                            key={idx}
                                                            whileHover={{ scale: 1.15, rotate: 10 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            href={social.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-4 rounded-full bg-white/5 border border-white/5 hover:bg-[var(--portfolio-accent)] hover:text-white transition-colors text-[var(--portfolio-text)]/60 shadow-lg"
                                                            title={social.platform}
                                                        >
                                                            <Icon size={24} />
                                                        </motion.a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {config.showResume && user.resumeURL && (
                                        <div className="pt-6">
                                            <a
                                                href={user.resumeURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-3 text-[var(--portfolio-text)]/60 hover:text-[var(--portfolio-accent)] transition-colors text-lg"
                                            >
                                                <ExternalLink size={20} />
                                                <span className="underline underline-offset-8">Download Resume</span>
                                            </a>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Map Embed */}
                                {config.googleMapsUrl && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6 }}
                                        className="order-1 md:order-2 w-full h-[450px] rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
                                    >
                                        <iframe
                                            src={config.googleMapsUrl}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </section>
                )
            }

            <footer className="py-8 text-center text-sm opacity-60">
                <p>&copy; {new Date().getFullYear()} {config.displayName || user.name}. All rights reserved.</p>
                <Link href="/" className="hover:text-gray-400 transition-colors mt-2 inline-block">
                    Powered by YourPlatform
                </Link>
            </footer>
        </div >
    );
}
