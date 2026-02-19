"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Github, Twitter, Linkedin, Instagram, Mail, Globe,
    Facebook, Youtube, ArrowUp, Send, MapPin, Clock
} from "lucide-react";

interface SocialMedia {
    platform: string;
    url: string;
}

interface FooterClientProps {
    dict: any;
    profile: any;
}

const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
        case "github": return <Github size={20} />;
        case "twitter": return <Twitter size={20} />;
        case "linkedin": return <Linkedin size={20} />;
        case "instagram": return <Instagram size={20} />;
        case "facebook": return <Facebook size={20} />;
        case "youtube": return <Youtube size={20} />;
        case "email": return <Mail size={20} />;
        default: return <Globe size={20} />;
    }
};

const FooterClient = ({ dict, profile }: FooterClientProps) => {
    const [time, setTime] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setTime(now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!mounted) return null;

    return (
        <footer
            id="footer"
            className="relative z-10 bg-black/50 backdrop-blur-2xl text-white pt-24 pb-12 overflow-hidden border-t border-white/10 font-sans"
            style={{ WebkitBackdropFilter: "blur(24px)", backdropFilter: "blur(24px)" }}
        >
            {/* --- PROFESSIONAL AMBIENT BACKGROUND --- */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--site-primary)]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--site-secondary)]/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* --- TOP SECTION: BRANDING & NEWSLETTER --- */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-20 pb-20 border-b border-white/5">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="max-w-xl"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                            <span className="text-white">
                                {profile?.fullName || "Herdian"}
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-8 font-light max-w-lg">
                            {profile?.bio || dict.footer.headline_fallback}
                        </p>

                        <div className="flex flex-wrap gap-8 text-sm">
                            <div className="flex items-center gap-2.5 text-gray-400 group">
                                <MapPin size={16} className="text-[var(--site-primary)] transition-transform group-hover:scale-110" />
                                <span>{dict.footer.based_in} {profile?.location || "Indonesia"}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-gray-400 font-mono">
                                <Clock size={16} className="text-[var(--site-secondary)]" />
                                <span>{time || "00:00:00 AM"}</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full lg:max-w-md"
                    >
                        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                            <h3 className="text-xl font-bold mb-2">{dict.footer.newsletter_title}</h3>
                            <p className="text-gray-400 text-sm mb-6 font-light">{dict.footer.newsletter_desc}</p>
                            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder={dict.footer.newsletter_placeholder}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--site-primary)]/50 transition-all"
                                />
                                <button className="px-6 py-3 bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-secondary)] text-[var(--site-button-text)] rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--site-primary)]/20">
                                    {dict.footer.subscribe || "Join"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>

                {/* --- MIDDLE SECTION: STRUCTURED LINKS --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--site-primary)] mb-8">{dict.footer.quick_links}</h4>
                        <ul className="space-y-4">
                            <li><Link href="/" className="text-gray-400 hover:text-white transition-colors block text-sm">{dict.nav.home}</Link></li>
                            <li><Link href="/works" className="text-gray-400 hover:text-white transition-colors block text-sm">{dict.nav.works}</Link></li>
                            <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors block text-sm">{dict.nav.about}</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors block text-sm">{dict.nav.contact}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--site-secondary)] mb-8">{dict.footer.services}</h4>
                        <ul className="space-y-4">
                            {Object.values(dict.footer.service_list).map((service: any, idx) => (
                                <li key={idx} className="text-gray-400 text-sm hover:text-white transition-colors cursor-default">{service}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--site-primary)] mb-8">{dict.footer.exploration}</h4>
                        <ul className="space-y-4">
                            <li><Link href="/works" className="text-gray-400 hover:text-white transition-colors block text-sm">{dict.footer.recent_works}</Link></li>
                            <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors block text-sm">{dict.footer.top_creators}</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col items-start md:items-end">
                        <button
                            onClick={scrollToTop}
                            className="group flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all active:scale-95"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[var(--site-primary)] group-hover:text-black transition-all">
                                <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                                {dict.footer.back_to_top}
                            </span>
                        </button>
                    </div>
                </div>

                {/* --- BOTTOM SECTION: LEGAL & SOCIALS --- */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/5">
                    <p className="text-gray-500 text-xs tracking-wide">
                        &copy; {new Date().getFullYear()} <span className="text-white font-medium">{profile?.fullName || "Herdian"}</span>. {dict.footer.rights}
                    </p>

                    <div className="flex gap-4">
                        {profile?.socialMedia?.map((social: any) => (
                            <motion.a
                                key={social.platform}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.1, y: -2 }}
                                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[var(--site-primary)] hover:border-[var(--site-primary)]/50 transition-all backdrop-blur-sm"
                                aria-label={social.platform}
                            >
                                {getIcon(social.platform)}
                            </motion.a>
                        ))}
                    </div>

                    <div className="flex gap-8 text-[11px] font-medium text-gray-500">
                        <Link href="/privacy" className="hover:text-white transition-colors">{dict.footer.privacy}</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">{dict.footer.terms}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterClient;
