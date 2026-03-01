"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FileDown, File as FileIcon, Check, CheckCheck } from "lucide-react";

interface ChatWindowProps {
    messages: any[];
    currentUserId: string;
    loading?: boolean;
    otherParticipant: any;
}

export default function ChatWindow({
    messages,
    currentUserId,
    loading,
    otherParticipant
}: ChatWindowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const prevMsgLength = useRef(messages.length);

    useEffect(() => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const hasNewMessages = messages.length > prevMsgLength.current;
            const lastMessage = messages[messages.length - 1];
            const isMe = lastMessage?.senderId === currentUserId;
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

            if (hasNewMessages) {
                if (isNearBottom || isMe || prevMsgLength.current === 0) {
                    container.scrollTo({
                        top: container.scrollHeight,
                        behavior: isMe ? "smooth" : "auto"
                    });
                }
            }
            prevMsgLength.current = messages.length;
        }
    }, [messages, currentUserId]);

    const isOnline = otherParticipant?.lastActiveAt &&
        (new Date().getTime() - new Date(otherParticipant.lastActiveAt).getTime()) < 5 * 60 * 1000;

    if (loading && messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-[var(--site-secondary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--site-sidebar-bg)] relative overflow-hidden">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 z-0 opacity-[0.025] pointer-events-none dark:opacity-[0.04]"
                style={{
                    backgroundImage: "url('/images/chat-bg.png')",
                    backgroundRepeat: "repeat",
                    backgroundSize: "400px",
                }}
            />

            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/95 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-active)] shadow-sm">
                        <Image
                            src={otherParticipant?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant?.name || "U")}&background=random`}
                            alt={otherParticipant?.name || "User"}
                            fill
                            className="object-cover"
                        />
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--site-sidebar-bg)] ${isOnline ? 'bg-[var(--site-sidebar-accent)]' : 'bg-[var(--glass-text-muted)]/30'}`} />
                    </div>
                    <div>
                        <h4 className="text-[13px] font-bold text-[var(--glass-text)] leading-tight">
                            {otherParticipant?.name || "User"}
                        </h4>
                        <p className={`text-[10px] font-semibold uppercase tracking-wider ${isOnline ? 'text-[var(--site-sidebar-accent)]' : 'text-[var(--glass-text-muted)]/50'}`}>
                            {isOnline ? "Active now" : otherParticipant?.lastActiveAt
                                ? `Last seen ${new Date(otherParticipant.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : "Offline"
                            }
                        </p>
                    </div>
                </div>


            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-[var(--site-sidebar-border)] scrollbar-track-transparent relative z-10"
            >
                <div className="space-y-1">
                    <AnimatePresence initial={false}>
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)] mb-4 flex items-center justify-center">
                                    <motion.span
                                        animate={{ scale: [1, 1.15, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-2xl"
                                    >
                                        💬
                                    </motion.span>
                                </div>
                                <h5 className="text-sm font-bold mb-1 text-[var(--glass-text)]">No messages yet</h5>
                                <p className="text-xs text-[var(--glass-text-muted)]/60 max-w-[200px]">
                                    Send a message to start chatting with {otherParticipant?.name}.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUserId;
                                const prevSender = messages[idx - 1]?.senderId;
                                const showAvatar = !isMe && (idx === 0 || prevSender !== msg.senderId);
                                const isGrouped = idx > 0 && prevSender === msg.senderId;

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 ${isGrouped ? 'mt-0.5' : 'mt-3'}`}
                                    >
                                        {/* Other user avatar */}
                                        {!isMe && (
                                            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 relative bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)]">
                                                {showAvatar && (
                                                    <Image
                                                        src={msg.sender?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name || "U")}&background=random`}
                                                        alt={msg.sender?.name || "U"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                        )}

                                        <div className={`max-w-[72%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                            {/* Attachment */}
                                            {msg.attachment && (
                                                <div className="mb-1.5">
                                                    {msg.attachmentType === "image" ? (
                                                        <a href={msg.attachment} target="_blank" rel="noopener noreferrer"
                                                            className="block relative max-w-[320px] rounded-xl overflow-hidden border border-[var(--site-sidebar-border)] hover:opacity-90 transition-opacity bg-[var(--site-sidebar-active)] shadow-sm">
                                                            <img src={msg.attachment} alt="Attachment"
                                                                className="w-full h-auto max-h-[300px] object-contain block" loading="lazy" />
                                                        </a>
                                                    ) : (
                                                        <a href={msg.attachment} target="_blank" rel="noopener noreferrer"
                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all shadow-sm
                                                                ${isMe
                                                                    ? "bg-[var(--site-secondary)]/15 border-[var(--site-secondary)]/20 hover:bg-[var(--site-secondary)]/20 text-[var(--glass-text)]"
                                                                    : "bg-[var(--site-sidebar-active)] border-[var(--site-sidebar-border)] hover:bg-[var(--site-sidebar-active)]/80 text-[var(--glass-text)]"
                                                                }`}>
                                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--site-secondary)]/10 text-[var(--site-secondary)]">
                                                                <FileIcon size={18} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold truncate">File Attachment</p>
                                                                <p className="text-[10px] opacity-60">Click to view</p>
                                                            </div>
                                                            <FileDown size={14} className="opacity-40" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            {/* Message bubble */}
                                            {(() => {
                                                if (!msg.content || !msg.content.trim()) return null;
                                                const isSingleEmoji = /^\p{Extended_Pictographic}$/u.test(msg.content.trim());
                                                if (isSingleEmoji && !msg.attachment) {
                                                    return (
                                                        <div className="text-5xl py-1 select-none animate-in zoom-in duration-300">
                                                            {msg.content}
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div className={`px-4 py-2.5 text-[14px] leading-relaxed shadow-sm
                                                        ${isMe
                                                            ? `bg-[var(--site-secondary)] text-white ${isGrouped ? 'rounded-[16px] rounded-br-md' : 'rounded-[16px] rounded-br-sm'}`
                                                            : `bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--glass-text)] backdrop-blur-sm ${isGrouped ? 'rounded-[16px] rounded-bl-md' : 'rounded-[16px] rounded-bl-sm'}`
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                );
                                            })()}

                                            {/* Timestamp */}
                                            <div className="flex items-center gap-1 mt-0.5 px-1">
                                                <span className="text-[10px] text-[var(--glass-text-muted)]/40 font-medium">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && (
                                                    <span className={msg.isRead ? "text-[var(--site-secondary)]" : "text-[var(--glass-text-muted)]/30"}>
                                                        {msg.isRead ? <CheckCheck size={11} /> : <Check size={11} />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
