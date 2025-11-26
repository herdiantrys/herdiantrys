"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Phone, Send, Twitter, Instagram, Linkedin, Dribbble, Link as LinkIcon, CheckCircle } from "lucide-react";
import { sendContactMessage } from "@/lib/actions/contact.actions";


const GlassContact = ({ profile }: { profile: any }) => {
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
            default: return "hover:text-teal-400";
        }
    };

    const socialLinks = profile?.socialMedia || [];
    const email = profile?.email || "herdiantry@gmail.com";
    const phone = profile?.phoneNumber || "+62 859-5658-7435";
    const location = profile?.location || "Bandung, Indonesia";

    return (
        <section id="contact" className="py-20 relative z-10">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[var(--glass-text)]">Let's Work Together</h2>
                    <p className="text-[var(--glass-text-muted)] max-w-2xl mx-auto">
                        Have a project in mind? I'd love to hear about it.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="glass p-8 rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xs">
                            <h3 className="text-2xl font-bold text-[var(--glass-text)] mb-6">Contact Info</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-[var(--glass-text-muted)]">
                                    <div className="w-10 h-10 rounded-full bg-[var(--glass-bg)] flex items-center justify-center">
                                        <Mail size={20} />
                                    </div>
                                    <span>{email}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[var(--glass-text-muted)]">
                                    <div className="w-10 h-10 rounded-full bg-[var(--glass-bg)] flex items-center justify-center">
                                        <Phone size={20} />
                                    </div>
                                    <span>{phone}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[var(--glass-text-muted)]">
                                    <div className="w-10 h-10 rounded-full bg-[var(--glass-bg)] flex items-center justify-center">
                                        <MapPin size={20} />
                                    </div>
                                    <span>{location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass bg-[var(--glass-bg)] p-8 rounded-2xl border-[var(--glass-border)] backdrop-blur-xs">
                            <h3 className="text-2xl font-bold text-[var(--glass-text)] mb-6">Follow Me</h3>
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
                                    <p className="text-[var(--glass-text-muted)]">No social links added.</p>
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
                            className="glass p-8 rounded-2xl border-[var(--glass-border)] space-y-6 backdrop-blur-xs relative overflow-hidden"
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
                                        <h3 className="text-2xl font-bold text-[var(--glass-text)] mb-2">Message Sent!</h3>
                                        <p className="text-[var(--glass-text-muted)] text-center px-6">
                                            Thank you for reaching out. I'll get back to you shortly.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="space-y-2">
                                <label className="text-[var(--glass-text-muted)] text-sm ml-1">Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/50 focus:outline-none focus:border-teal-500 focus:bg-[var(--glass-border)] transition-all"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[var(--glass-text-muted)] text-sm ml-1">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/50 focus:outline-none focus:border-teal-500 focus:bg-[var(--glass-border)] transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[var(--glass-text-muted)] text-sm ml-1">Message</label>
                                <textarea
                                    name="message"
                                    rows={4}
                                    required
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/50 focus:outline-none focus:border-teal-500 focus:bg-[var(--glass-border)] transition-all resize-none"
                                    placeholder="Tell me about your project..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg hover:shadow-teal-500/25 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span>Sending...</span>
                                ) : success ? (
                                    <span>Message Sent!</span>
                                ) : (
                                    <>
                                        <span>Send Message</span>
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
