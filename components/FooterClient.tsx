"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Clock, MapPin, Send, Sparkles } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { getSocialLinkHref, getSocialLinkLabel, normalizeSocialLinks } from "@/lib/social-links";

interface FooterClientProps {
    dict: any;
    profile: any;
}

// --- Staggered Link Item ---
const NavLinkItem = ({ href, children, delay = 0 }: { href: string; children: React.ReactNode; delay?: number }) => (
    <motion.li
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.4, ease: "easeOut" }}
        viewport={{ once: true }}
    >
        <Link
            href={href}
            className="group flex items-center gap-2 text-sm font-semibold text-foreground/50 hover:text-foreground transition-all duration-300"
        >
            <span className="block w-0 group-hover:w-4 h-px bg-foreground transition-all duration-300" />
            {children}
        </Link>
    </motion.li>
);

const FooterClient = ({ dict, profile }: FooterClientProps) => {
    const [time, setTime] = useState("");
    const [mounted, setMounted] = useState(false);
    const footerRef = useRef<HTMLElement>(null);
    const socialLinks = normalizeSocialLinks(profile?.socialMedia);

    // Mouse Parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothX = useSpring(mouseX, { damping: 60, stiffness: 300 });
    const smoothY = useSpring(mouseY, { damping: 60, stiffness: 300 });
    const orbAX = useTransform(smoothX, [0, 1920], [-30, 30]);
    const orbAY = useTransform(smoothY, [0, 1080], [-20, 20]);
    const orbBX = useTransform(smoothX, [0, 1920], [30, -30]);
    const orbBY = useTransform(smoothY, [0, 1080], [20, -20]);

    useEffect(() => {
        setMounted(true);

        const updateTime = () => {
            setTime(new Date().toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
            }));
        };

        updateTime();

        const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        const onMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        if (supportsFinePointer) {
            window.addEventListener("mousemove", onMouseMove, { passive: true });
        }

        const timer = setInterval(updateTime, 1000);

        return () => {
            if (supportsFinePointer) {
                window.removeEventListener("mousemove", onMouseMove);
            }
            clearInterval(timer);
        };
    }, [mouseX, mouseY]);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    if (!mounted) return null;

    return (
        <footer
            ref={footerRef}
            id="footer"
            className="relative z-10 overflow-hidden font-sans text-foreground"
        >
            {/* ── Liquid Glass Surface ── */}
            <div
                className="absolute inset-0"
                style={{
                    background: "var(--glass-bg)",
                    backdropFilter: "blur(60px) saturate(180%)",
                    WebkitBackdropFilter: "blur(60px) saturate(180%)",
                    borderTop: "1px solid var(--glass-border)",
                }}
            />

            {/* ── Animated Background Orbs ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Soft page fade-in at top */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-background to-transparent z-10" />

                {/* Orb A — top left, mouse parallax */}
                <motion.div
                    style={{ x: orbAX, y: orbAY, background: "radial-gradient(circle, var(--glass-border) 0%, transparent 70%)", filter: "blur(80px)" } as any}
                    animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full"
                />
                {/* Orb B — bottom right, counter parallax */}
                <motion.div
                    style={{ x: orbBX, y: orbBY, background: "radial-gradient(circle, var(--glass-border) 0%, transparent 70%)", filter: "blur(100px)" } as any}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full"
                />
                {/* Orb C — center float */}
                <motion.div
                    animate={{ y: [0, -40, 0], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 rounded-full"
                    style={{
                        background: "radial-gradient(circle, var(--glass-border) 0%, transparent 70%)",
                        filter: "blur(70px)",
                    } as any}
                />
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 container mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-28">

                {/* === HERO ROW === */}
                <div className="mb-16 flex flex-col items-start gap-10 border-b border-foreground/5 pb-16 sm:mb-20 sm:gap-12 sm:pb-20 lg:flex-row lg:gap-16">

                    {/* Brand Block */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex-1 min-w-0"
                    >
                        {/* Name */}
                        <div className="flex items-center gap-3 mb-5">
                            <motion.div
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <Sparkles size={20} className="text-foreground/40" />
                            </motion.div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">
                                {dict.footer.available || "Open to work"}
                            </span>
                        </div>

                        <h2 className="mb-6 text-[clamp(2.8rem,12vw,4.5rem)] font-black leading-none tracking-tighter text-foreground lg:text-7xl">
                            {profile?.fullName || "Herdian"}
                        </h2>

                        <p className="mb-8 max-w-xl text-base font-medium leading-relaxed text-foreground/50 sm:mb-10">
                            {profile?.bio || dict.footer.headline_fallback}
                        </p>

                        {/* Meta Pills */}
                        <div className="flex flex-wrap gap-3">
                            <div
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-bold text-foreground/60"
                                style={{
                                    background: "var(--glass-bg)",
                                    border: "1px solid var(--glass-border)",
                                    backdropFilter: "blur(20px)",
                                }}
                            >
                                <MapPin size={14} className="text-foreground/30 shrink-0" />
                                {dict.footer.based_in} {profile?.location || "Indonesia"}
                            </div>
                            <div
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-black text-foreground/60 font-mono tabular-nums"
                                style={{
                                    background: "var(--glass-bg)",
                                    border: "1px solid var(--glass-border)",
                                    backdropFilter: "blur(20px)",
                                }}
                            >
                                <Clock size={14} className="text-foreground/30 shrink-0" />
                                {time || "00:00:00 AM"}
                            </div>
                        </div>
                    </motion.div>

                    {/* Newsletter Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                        className="w-full shrink-0 lg:w-[420px] xl:w-[440px]"
                    >
                        <div
                            className="group relative overflow-hidden rounded-[32px] p-6 sm:p-8"
                            style={{
                                background: "var(--glass-bg)",
                                border: "1px solid var(--glass-border)",
                                boxShadow: "var(--glass-shadow)",
                                backdropFilter: "blur(40px)",
                            }}
                        >
                            {/* Hover shine */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)" }} />

                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
                                    {dict.footer.newsletter_label || "Newsletter"}
                                </span>
                            </div>

                            <h3 className="text-2xl font-black tracking-tight text-foreground mb-2">
                                {dict.footer.newsletter_title}
                            </h3>
                            <p className="text-sm text-foreground/50 font-medium mb-7 leading-relaxed">
                                {dict.footer.newsletter_desc}
                            </p>

                            <form className="flex flex-col gap-2.5 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder={dict.footer.newsletter_placeholder}
                                    className="flex-1 min-w-0 px-5 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none transition-all text-foreground placeholder:text-foreground/30"
                                    style={{
                                        background: "rgba(0,0,0,0.05)",
                                        border: "1px solid var(--glass-border)",
                                    }}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className="flex shrink-0 items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black text-foreground transition-all"
                                    style={{
                                        background: "var(--glass-border)",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                    }}
                                >
                                    <Send size={15} />
                                    {dict.footer.subscribe || "Join"}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>

                {/* === LINKS GRID === */}
                <div className="mb-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 sm:gap-y-12 xl:mb-20 xl:grid-cols-4">
                    {/* Quick Links */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-foreground/25 mb-7">
                            {dict.footer.quick_links}
                        </p>
                        <ul className="space-y-4">
                            <NavLinkItem href="/" delay={0.05}>{dict.nav.home}</NavLinkItem>
                            <NavLinkItem href="/works" delay={0.1}>{dict.nav.works}</NavLinkItem>
                            <NavLinkItem href="/about" delay={0.15}>{dict.nav.about}</NavLinkItem>
                            <NavLinkItem href="/contact" delay={0.2}>{dict.nav.contact}</NavLinkItem>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-foreground/25 mb-7">
                            {dict.footer.services}
                        </p>
                        <ul className="space-y-4">
                            {Object.values(dict.footer.service_list || {}).map((service: any, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06, duration: 0.4 }}
                                    className="text-sm font-semibold text-foreground/50"
                                >
                                    {service}
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* Explore */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-foreground/25 mb-7">
                            {dict.footer.exploration}
                        </p>
                        <ul className="space-y-4">
                            <NavLinkItem href="/works" delay={0.05}>{dict.footer.recent_works}</NavLinkItem>
                            <NavLinkItem href="/dashboard" delay={0.1}>{dict.footer.top_creators}</NavLinkItem>
                        </ul>
                    </div>

                    {/* Back to Top */}
                    <div className="flex items-start justify-start sm:items-end sm:justify-end">
                        <motion.button
                            onClick={scrollToTop}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -4, scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="group relative overflow-hidden flex flex-col items-center gap-3 p-7 rounded-[28px] transition-all duration-500"
                            style={{
                                background: "var(--glass-bg)",
                                border: "1px solid var(--glass-border)",
                                boxShadow: "var(--glass-shadow)",
                                backdropFilter: "blur(30px)",
                            }}
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.05), transparent)" }} />

                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:-translate-y-1"
                                style={{
                                    background: "var(--glass-border)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                }}
                            >
                                <ArrowUpRight size={22} className="text-foreground/70" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-foreground/30 relative z-10">
                                {dict.footer.back_to_top}
                            </span>
                        </motion.button>
                    </div>
                </div>

                {/* === BOTTOM BAR === */}
                <div className="relative border-t border-foreground/5 pt-8">
                    {/* Hairline highlight */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, var(--glass-border), transparent)" }} />

                    <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:flex-wrap sm:text-left">
                        {/* Copyright */}
                        <p className="text-[11px] font-bold tracking-widest uppercase text-foreground/25">
                            &copy; {new Date().getFullYear()} <span className="text-foreground/60">{profile?.fullName || "Herdian"}</span>. {dict.footer.rights}
                        </p>

                        {/* Social Icons */}
                        <div className="flex flex-wrap items-center justify-center gap-2.5">
                            {socialLinks.map((social: any, i: number) => (
                                <motion.a
                                    key={`${social.platform}-${social.url}-${i}`}
                                    href={getSocialLinkHref(social)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 8 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.07 }}
                                    whileHover={{ y: -5, scale: 1.15 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label={getSocialLinkLabel(social)}
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-foreground/40 hover:text-foreground transition-all duration-300"
                                    style={{
                                        background: "var(--glass-bg)",
                                        border: "1px solid var(--glass-border)",
                                        backdropFilter: "blur(20px)",
                                    }}
                                >
                                    <SocialIcon iconKey={social.icon} platform={social.platform} size={18} />
                                </motion.a>
                            ))}
                        </div>

                        {/* Legal */}
                        <div className="flex flex-wrap justify-center gap-5 text-[11px] font-bold tracking-widest uppercase text-foreground/25 sm:justify-end sm:gap-8">
                            <Link href="/privacy" className="hover:text-foreground/70 transition-colors">{dict.footer.privacy}</Link>
                            <Link href="/terms" className="hover:text-foreground/70 transition-colors">{dict.footer.terms}</Link>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default FooterClient;
