"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, CheckCircle, Mail, MapPin, Phone, Send } from "lucide-react";
import { sendContactMessage } from "@/lib/actions/contact.actions";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { getSocialLinkDisplayValue, getSocialLinkHref, getSocialLinkLabel, normalizeSocialLinks } from "@/lib/social-links";


const GlassContact = ({ profile, dict }: { profile: any, dict: any }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const socialLinks = normalizeSocialLinks(profile?.socialMedia);
    const email = profile?.email || "herdiantry@gmail.com";
    const phone = profile?.phoneNumber || "+62 859-5658-7435";
    const location = profile?.location || "Bandung, Indonesia";

    return (
        <section id="contact" className="relative z-10 py-16 sm:py-20">
            <div className="container mx-auto px-4">
                <SectionTitle
                    title={dict.contact.title}
                    subtitle={dict.contact.description}
                    alignment="center"
                    className="mb-12 sm:mb-16"
                />

                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6 sm:space-y-8"
                    >
                        <div className="glass rounded-3xl border-white/60 bg-[var(--glass-bg)] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md dark:border-[var(--glass-border)] dark:shadow-none sm:p-8">
                            <h3 className="mb-6 text-xl font-bold text-[var(--glass-text)] sm:text-2xl">{dict.contact.contact_info}</h3>
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

                        <div className="glass rounded-3xl border-white/60 bg-[var(--glass-bg)] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md dark:border-[var(--glass-border)] dark:shadow-none sm:p-8">
                            <h3 className="mb-6 text-xl font-bold text-[var(--glass-text)] sm:text-2xl">{dict.contact.follow_me}</h3>
                            <div className="space-y-3">
                                {socialLinks.map((social: any, index: number) => (
                                    <motion.a
                                        key={`${social.platform}-${social.url}-${index}`}
                                        href={getSocialLinkHref(social)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ y: -4, scale: 1.01 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="group flex items-center gap-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]/70 px-4 py-3.5 transition-all duration-300 hover:border-[var(--site-secondary)]/30 hover:bg-[var(--glass-bg-strong)]"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--site-secondary)]/10 text-[var(--site-secondary)] transition-colors duration-300 group-hover:bg-[var(--site-secondary)] group-hover:text-[var(--site-button-text)]">
                                            <SocialIcon iconKey={social.icon} platform={social.platform} size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold text-[var(--glass-text)]">
                                                {getSocialLinkLabel(social)}
                                            </p>
                                            <p className="truncate text-xs text-[var(--glass-text-muted)]">
                                                {getSocialLinkDisplayValue(social.url, social.icon || social.platform)}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--glass-text-muted)] transition-colors group-hover:text-[var(--site-secondary)]">
                                            Open
                                            <ArrowUpRight size={14} />
                                        </div>
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
                            className="glass relative space-y-5 overflow-hidden rounded-3xl border-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md dark:border-[var(--glass-border)] dark:shadow-none sm:space-y-6 sm:p-8"
                        >
                            <AnimatePresence>
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-[1.5rem] bg-[var(--glass-bg)] backdrop-blur-md sm:rounded-2xl"
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
                                    className="w-full rounded-xl border border-white/40 bg-[var(--glass-bg)]/50 px-4 py-3.5 text-[var(--glass-text)] shadow-sm transition-all placeholder:text-[var(--glass-text-muted)]/50 focus:border-[var(--site-secondary)] focus:bg-white/80 focus:outline-none dark:border-[var(--glass-border)] dark:focus:bg-[var(--glass-border)] sm:py-4"
                                    placeholder={dict.contact.form.name_placeholder}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[var(--glass-text-muted)] text-sm ml-1">{dict.contact.form.email}</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full rounded-xl border border-white/40 bg-[var(--glass-bg)]/50 px-4 py-3.5 text-[var(--glass-text)] shadow-sm transition-all placeholder:text-[var(--glass-text-muted)]/50 focus:border-[var(--site-secondary)] focus:bg-white/80 focus:outline-none dark:border-[var(--glass-border)] dark:focus:bg-[var(--glass-border)] sm:py-4"
                                    placeholder={dict.contact.form.email_placeholder}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[var(--glass-text-muted)] text-sm ml-1">{dict.contact.form.message}</label>
                                <textarea
                                    name="message"
                                    rows={4}
                                    required
                                    className="w-full resize-none rounded-xl border border-white/40 bg-[var(--glass-bg)]/50 px-4 py-3.5 text-[var(--glass-text)] shadow-sm transition-all placeholder:text-[var(--glass-text-muted)]/50 focus:border-[var(--site-secondary)] focus:bg-white/80 focus:outline-none dark:border-[var(--glass-border)] dark:focus:bg-[var(--glass-border)] sm:py-4"
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
