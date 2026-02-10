"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Link as LinkIcon, Facebook, Twitter, Linkedin, Instagram, Phone } from "lucide-react";
import { useState } from "react";
import { Portal } from "@/components/ui/Portal";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title?: string;
    description?: string;
}

export const ShareModal = ({ isOpen, onClose, url, title = "Check this out!", description = "" }: ShareModalProps) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const fullUrl = typeof window !== 'undefined' ? (url.startsWith('http') ? url : `${window.location.origin}${url}`) : url;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = [
        {
            name: "WhatsApp",
            icon: Phone, // WhatsApp doesn't have a default Lucide icon, checking if `Phone` is okay or if I should specific SVG. 
            // Lucide usually has `MessageCircle` or custom. Let's use MessageCircle for now if Phone is too generic, 
            // but actually let's just use generic icons or simple SVGs if strictly needed. 
            // Lucide DOES NOT have brand icons by default in all versions. 
            // I will use generic ones or common substitutes:
            // Facebook -> Facebook
            // Twitter -> Twitter
            // Linkedin -> Linkedin
            // Instagram -> Instagram
            // WhatsApp -> MessageCircle (Green)
            // Discord -> MessageSquare (Purple)
            iconColor: "text-green-500",
            bg: "bg-green-500/10",
            href: `https://wa.me/?text=${encodeURIComponent(`${title} ${fullUrl}`)}`
        },
        {
            name: "Facebook",
            icon: Facebook,
            iconColor: "text-blue-500",
            bg: "bg-blue-500/10",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`
        },
        {
            name: "Twitter",
            icon: Twitter,
            iconColor: "text-sky-500",
            bg: "bg-sky-500/10",
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`
        },
        {
            name: "LinkedIn",
            icon: Linkedin,
            iconColor: "text-blue-700",
            bg: "bg-blue-700/10",
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`
        },
        // Instagram and Discord don't have direct web share URLs reliably.
        // We will just show them and maybe copy link or open generic app URL if possible.
        // For now, let's stick to the ones that work well on web.
    ];

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Share</h3>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Social Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {shareLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${link.bg}`}>
                                    <link.icon size={24} className={link.iconColor} />
                                </div>
                                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{link.name}</span>
                            </a>
                        ))}
                    </div>

                    {/* Copy Link Section */}
                    <div className="relative">
                        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 pr-2 border border-white/10">
                            <div className="flex-1 px-3 py-2 text-sm text-gray-400 truncate font-mono">
                                {fullUrl}
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${copied
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-white/10 text-white hover:bg-white/20"
                                    }`}
                            >
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Portal>
    );
};
