"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X, Image as ImageIcon, File as FileIcon } from "lucide-react";
import { uploadMessageAttachment } from "@/lib/actions/message.actions";
import { toast } from "sonner";
import EmojiPicker from "./EmojiPicker";
import { AnimatePresence, motion } from "framer-motion";

interface ChatInputProps {
    onSend: (content: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder = "Write a message..." }: ChatInputProps) {
    const [content, setContent] = useState("");
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [attachment, setAttachment] = useState<{ url: string; type: string; name: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
                setIsEmojiOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSend = () => {
        if ((!content.trim() && !attachment) || disabled || isUploading) return;
        (onSend as any)(content.trim(), attachment?.url, attachment?.type);
        setContent("");
        setAttachment(null);
        setIsEmojiOpen(false);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("File size exceeds 5MB"); return; }
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await uploadMessageAttachment(formData);
            if (res.success) {
                setAttachment({ url: res.url!, type: res.type!, name: file.name });
                toast.success("File uploaded");
            } else {
                toast.error(res.error || "Failed to upload");
            }
        } catch { toast.error("Upload error"); }
        finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [content]);

    const canSend = (content.trim() || attachment) && !disabled && !isUploading;

    return (
        <div className="px-4 py-3 border-t border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/95 backdrop-blur-md shrink-0 relative">

            {/* Uploading overlay */}
            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-[var(--site-sidebar-bg)]/80 backdrop-blur-sm flex items-center justify-center gap-2.5 rounded-b-2xl"
                    >
                        <div className="w-4 h-4 border-2 border-[var(--site-secondary)] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-[var(--site-secondary)] tracking-wider uppercase">Uploading...</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Attachment preview */}
            <AnimatePresence>
                {attachment && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute bottom-full left-4 mb-2 p-3 bg-[var(--site-sidebar-bg)] border border-[var(--site-sidebar-border)] rounded-2xl flex items-center gap-3 shadow-xl shadow-black/15 min-w-[200px]"
                    >
                        {attachment.type === "image" ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--site-sidebar-border)]">
                                <img src={attachment.url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-[var(--site-secondary)]/10 border border-[var(--site-secondary)]/20 flex items-center justify-center text-[var(--site-secondary)]">
                                <FileIcon size={20} />
                            </div>
                        )}
                        <div className="flex-1 min-w-0 pr-6">
                            <p className="text-xs font-bold text-[var(--glass-text)] truncate">{attachment.name}</p>
                            <p className="text-[10px] text-[var(--site-secondary)] font-semibold uppercase tracking-wider">{attachment.type}</p>
                        </div>
                        <button
                            onClick={() => setAttachment(null)}
                            className="absolute top-2 right-2 p-1 bg-[var(--site-sidebar-active)] hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all text-[var(--glass-text-muted)]"
                        >
                            <X size={12} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Emoji Picker */}
            <AnimatePresence>
                {isEmojiOpen && (
                    <motion.div
                        ref={emojiRef}
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 8 }}
                        className="absolute bottom-full right-4 mb-2 z-50 origin-bottom-right"
                    >
                        <EmojiPicker onSelect={(emoji: string) => {
                            setContent(prev => prev + emoji);
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input row */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={async (e) => {
                    e.preventDefault(); setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileChange({ target: { files: [file] } } as any);
                }}
                className={`relative flex items-end gap-2 rounded-2xl border transition-all duration-200 p-2
                    ${isDragging
                        ? "border-[var(--site-secondary)]/50 bg-[var(--site-secondary)]/5 scale-[1.01]"
                        : "border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)] focus-within:border-[var(--site-secondary)]/35 focus-within:ring-2 focus-within:ring-[var(--site-secondary)]/10"
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                />

                {/* Tools */}
                <div className="flex gap-0.5 pl-1 pb-0.5 shrink-0 text-[var(--glass-text-muted)]/40">
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || disabled}
                        className="p-1.5 hover:text-[var(--glass-text)] hover:bg-[var(--site-sidebar-border)]/40 rounded-lg transition-all"
                        title="Attach file"
                    >
                        <Paperclip size={17} />
                    </motion.button>
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isDragging ? "Drop your file here..." : placeholder}
                    rows={1}
                    className="flex-1 min-h-[40px] max-h-[120px] bg-transparent border-none outline-none resize-none py-2.5 px-1 text-[14px] text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/35 font-normal leading-relaxed scrollbar-thin scrollbar-thumb-[var(--site-sidebar-border)]"
                    disabled={disabled || isUploading}
                />

                {/* Right actions */}
                <div className="flex items-center gap-1 pb-0.5 pr-0.5 shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                        className={`p-1.5 rounded-lg transition-all ${isEmojiOpen
                            ? "text-[var(--site-secondary)] bg-[var(--site-secondary)]/10"
                            : "text-[var(--glass-text-muted)]/40 hover:text-[var(--glass-text)] hover:bg-[var(--site-sidebar-border)]/40"
                            }`}
                    >
                        <Smile size={17} />
                    </motion.button>

                    <AnimatePresence mode="wait">
                        <motion.button
                            key={canSend ? "send-active" : "send-idle"}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            whileHover={canSend ? { scale: 1.08 } : {}}
                            whileTap={canSend ? { scale: 0.92 } : {}}
                            onClick={handleSend}
                            disabled={!canSend}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                                ${canSend
                                    ? "bg-[var(--site-accent)] text-white shadow-lg shadow-[var(--site-accent)]/30 hover:opacity-90"
                                    : "bg-[var(--site-sidebar-border)]/40 text-[var(--glass-text-muted)]/30 cursor-not-allowed"
                                }`}
                        >
                            <Send size={16} className={canSend ? "translate-x-0.5" : ""} />
                        </motion.button>
                    </AnimatePresence>
                </div>
            </div>

            {/* Hint */}
            <p className="text-[10px] text-[var(--glass-text-muted)]/25 text-center mt-1.5 font-medium">
                Enter to send · Shift+Enter for new line
            </p>
        </div>
    );
}
