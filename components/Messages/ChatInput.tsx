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

export default function ChatInput({ onSend, disabled, placeholder = "Type a message..." }: ChatInputProps) {
    const [content, setContent] = useState("");
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [attachment, setAttachment] = useState<{ url: string; type: string; name: string } | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiRef = useRef<HTMLDivElement>(null);

    // Close emoji picker when clicking outside
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

        // Pass attachment info if present
        (onSend as any)(content.trim(), attachment?.url, attachment?.type);

        setContent("");
        setAttachment(null);
        setIsEmojiOpen(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size exceeds 5MB limit");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await uploadMessageAttachment(formData);
            if (res.success) {
                setAttachment({
                    url: res.url!,
                    type: res.type!,
                    name: file.name
                });
                toast.success("File uploaded successfully");
            } else {
                toast.error(res.error || "Failed to upload file");
            }
        } catch (error) {
            toast.error("An error occurred during upload");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [content]);

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const mockEvent = { target: { files: [file] } } as any;
            handleFileChange(mockEvent);
        }
    };

    return (
        <div className="p-4 border-t border-white/5 bg-white/10 backdrop-blur-2xl relative">
            {/* Uploading State Overlay */}
            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3"
                    >
                        <div className="w-5 h-5 border-2 border-[var(--site-secondary)] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-white tracking-wider uppercase">Uploading File...</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Attachment Preview */}
            <AnimatePresence>
                {attachment && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-4 mb-3 p-3 bg-white/10 backdrop-blur-[32px] border border-white/20 rounded-2xl flex items-center gap-4 shadow-2xl min-w-[200px]"
                    >
                        {attachment.type === "image" ? (
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/20 bg-white/5">
                                <img src={attachment.url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-[var(--site-secondary)]">
                                <FileIcon size={24} />
                            </div>
                        )}
                        <div className="flex-1 min-w-0 pr-6">
                            <p className="text-xs font-bold text-white truncate">{attachment.name}</p>
                            <p className="text-[10px] text-[var(--site-secondary)] font-bold uppercase tracking-widest">{attachment.type}</p>
                        </div>
                        <button
                            onClick={() => setAttachment(null)}
                            className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-all"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Emoji Picker */}
            <AnimatePresence>
                {isEmojiOpen && (
                    <motion.div
                        ref={emojiRef}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-full right-4 mb-2 z-50 origin-bottom-right"
                    >
                        <EmojiPicker onSelect={(emoji: string) => {
                            setContent(prev => prev + emoji);
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex items-end gap-2 max-w-4xl mx-auto bg-white/5 rounded-2xl border transition-all duration-300 p-2
                    ${isDragging ? "border-[var(--site-secondary)] bg-[var(--site-secondary)]/10 scale-[1.02]" : "border-white/10 focus-within:border-[var(--site-secondary)]/50"}
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || disabled}
                    className={`p-2.5 rounded-xl transition-all ${isUploading ? "animate-pulse text-[var(--site-secondary)]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    title="Attach File"
                >
                    <Paperclip size={20} />
                </button>

                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isDragging ? "Drop your file here..." : placeholder}
                    rows={1}
                    className="flex-1 bg-transparent border-none outline-none resize-none py-2.5 px-1 text-sm text-white placeholder:text-gray-500 max-h-[120px] scrollbar-hide"
                    disabled={disabled || isUploading}
                />

                <div className="flex items-center gap-1.5 p-0.5">
                    <button
                        onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                        className={`p-2 rounded-xl transition-all ${isEmojiOpen ? "text-[var(--site-secondary)] bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                        <Smile size={20} />
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={(!content.trim() && !attachment) || disabled || isUploading}
                        className={`p-2.5 rounded-xl transition-all shadow-lg ${((content.trim() || attachment) && !disabled && !isUploading)
                            ? "bg-[var(--site-secondary)] text-black scale-100 shadow-[0_4px_12px_rgba(var(--site-secondary-rgb),0.3)] active:scale-95"
                            : "bg-white/5 text-gray-500 scale-100"
                            }`}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
