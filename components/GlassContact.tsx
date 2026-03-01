"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Phone, Send, Twitter, Instagram, Linkedin, Dribbble, Link as LinkIcon, CheckCircle } from "lucide-react";
import { sendContactMessage } from "@/lib/actions/contact.actions";
import { SectionTitle } from "@/components/ui/SectionTitle";


const GlassContact = ({ profile, dict }: { profile: any, dict: any }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const getIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case "twitter": return <Twitter size={20} />;
            case "instagram": return <Instagram size={20} />;
            case "linkedin": return <Linkedin size={20} />;
            case "dribbble": return <Dribbble size={20} />;
            default: return <LinkIcon size={20} />;
        }
    };

    const getColor = (platform: string) => {
        switch (platform.toLowerCase()) {
            case "twitter": return "hover:text-blue-400";
            case "instagram": return "hover:text-pink-500";
            case "linkedin": return "hover:text-blue-600";
            case "dribbble": return "hover:text-pink-400";
            default: return "hover:text-[var(--site-secondary)]";
        }
    };

    const socialLinks = Array.isArray(profile?.socialMedia) ? profile.socialMedia : [];
    const email = profile?.email || "herdiantry@gmail.com";
    const phone = profile?.phoneNumber || "+62 859-5658-7435";
    const location = profile?.location || "Bandung, Indonesia";

    return (
        <section id="contact" className="py-20 relative z-10">
            <div className="container mx-auto px-4">
                <SectionTitle
                    title={dict.contact.title}
                    subtitle={dict.contact.description}
                    alignment="center"
                    className="mb-16"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="glass p-8 rounded-3xl border-white/60 dark:border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
                            <h3 className="text-2xl font-bold text-[var(--glass-text)] mb-6">{dict.contact.contact_info}</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--site-secondary)]/10 flex items-center justify-center text-[var(--site-secondary)] group-hover:bg-[var(--site-secondary)] group-hover:text-[var(--site-button-text)] transition-all duration-300">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--glass-text-muted)]">{dict.contact.email_label || "Email"}</p>
                                        <p className="text-[var(--glass-text)] font-semibold">{email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--site-secondary)]/10 flex items-center justify-center text-[var(--site-secondary)] group-hover:bg-[var(--site-secondary)] group-hover:text-[var(--site-button-text)] transition-all duration-300">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--glass-text-muted)]">{dict.contact.phone_label || "Phone"}</p>
                                        <p className="text-[var(--glass-text)] font-semibold">{phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--site-secondary)]/10 flex items-center justify-center text-[var(--site-secondary)] group-hover:bg-[var(--site-secondary)] group-hover:text-[var(--site-button-text)] transition-all duration-300">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--glass-text-muted)]">{dict.contact.location_label || "Location"}</p>
                                        <p className="text-[var(--glass-text)] font-semibold">{location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass bg-[var(--glass-bg)] p-8 rounded-3xl border-white/60 dark:border-[var(--glass-border)] backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
                            <h3 className="text-2xl font-bold text-[var(--glass-text)] mb-6">{dict.contact.follow_me}</h3>
                            <div className="flex gap-4 flex-wrap">
                                {socialLinks.map((social: any, index: number) => (
                                    <motion.a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.1, y: -5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`w-12 h-12 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--glass-text-muted)] transition-colors ${getColor(social.platform)}`}
                                    >
                                        {getIcon(social.platform)}
                                    </motion.a>
                                ))}
                                {socialLinks.length === 0 && (
                                    <p className="text-[var(--glass-text-muted)]">{dict.contact.no_socials}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <form
                            action={async (formData) => {
                                setIsLoading(true);
                                const result = await sendContactMessage(formData);
                                setIsLoading(false);
                                if (result.success) {
                                    setSuccess(true);
                                    (document.getElementById("contact-form") as HTMLFormElement).reset();
                                    setTimeout(() => setSuccess(false), 5000);
                                } else {
                                    alert(result.error);
                                }
                            }}
                            id="contact-form"
                            className="glass p-8 rounded-3xl border-white/60 dark:border-[var(--glass-border)] space-y-6 backdrop-blur-md relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none"
                        >
                            <AnimatePresence>
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--glass-bg)] backdrop-blur-md rounded-2xl"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                            className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4"
                                        >
                                            <CheckCircle size={32} />
                                        </motion.div>
                                        <h3 className="text-2xl font-bold text-[var(--glass-text)] mb-2">{dict.contact.form.success_title}</h3>
                                        <p className="text-[var(--glass-text-muted)] text-center px-6">
                                            {dict.contact.form.success_desc}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="space-y-2">
                                <label className="text-[var(--glass-text-muted)] text-sm ml-1">{dict.contact.form.name}</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full bg-[var(--glass-bg)]/50 border border-white/40 dark:border-[var(--glass-border)] rounded-xl px-4 py-4 text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/50 focus:outline-none focus:border-[var(--site-secondary)] focus:bg-white/80 dark:focus:bg-[var(--glass-border)] transition-all shadow-sm"
                                    placeholder={dict.contact.form.name_placeholder}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[var(--glass-text-muted)] text-sm ml-1">{dict.contact.form.email}</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-[var(--glass-bg)]/50 border border-white/40 dark:border-[var(--glass-border)] rounded-xl px-4 py-4 text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/50 focus:outline-none focus:border-[var(--site-secondary)] focus:bg-white/80 dark:focus:bg-[var(--glass-border)] transition-all shadow-sm"
                                    placeholder={dict.contact.form.email_placeholder}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[var(--glass-text-muted)] text-sm ml-1">{dict.contact.form.message}</label>
                                <textarea
                                    name="message"
                                    rows={4}
                                    required
                                    className="w-full bg-[var(--glass-bg)]/50 border border-white/40 dark:border-[var(--glass-border)] rounded-xl px-4 py-4 text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/50 focus:outline-none focus:border-[var(--site-secondary)] focus:bg-white/80 dark:focus:bg-[var(--glass-border)] transition-all resize-none shadow-sm"
                                    placeholder={dict.contact.form.message_placeholder}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-[var(--site-secondary)] to-[var(--site-secondary)] text-[var(--site-button-text)] font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[var(--site-secondary)]/25 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span>{dict.contact.form.sending}</span>
                                ) : success ? (
                                    <span>{dict.contact.form.sent}</span>
                                ) : (
                                    <>
                                        <span>{dict.contact.form.send}</span>
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default GlassContact;
