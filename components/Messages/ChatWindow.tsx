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

    // Auto-scroll logic
    useEffect(() => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const hasNewMessages = messages.length > prevMsgLength.current;
            const lastMessage = messages[messages.length - 1];
            const isMe = lastMessage?.senderId === currentUserId;

            // Check if user is near bottom (within 100px)
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

            // Only scroll if:
            // 1. New messages arrived AND (user is near bottom OR it's my own message)
            // 2. Initial load (messages were 0 and now not)
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

    if (loading && messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-transparent">
                <div className="w-8 h-8 border-2 border-[var(--site-secondary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30 dark:bg-gray-900/50 relative overflow-hidden">
            {/* Background Pattern with lower opacity for light mode */}
            <div
                className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: "url('/images/chat-bg.png')",
                    backgroundRepeat: "repeat",
                    backgroundSize: "400px",
                    backgroundPosition: "top left",
                }}
            />

            {/* Header info for mobile or just clarity */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex items-center gap-4 relative z-10 shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 relative shadow-sm">
                    <Image
                        src={otherParticipant?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant?.name || "U")}&background=random`}
                        alt={otherParticipant?.name || "User"}
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{otherParticipant?.name || "User"}</h4>
                    {otherParticipant?.lastActiveAt && (new Date().getTime() - new Date(otherParticipant.lastActiveAt).getTime()) < 5 * 60 * 1000 ? (
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active Now</p>
                    ) : (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                            {otherParticipant?.lastActiveAt
                                ? `Last seen ${new Date(otherParticipant.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : "Offline"}
                        </p>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10"
            >
                <div className="space-y-4">
                    <AnimatePresence initial={false}>
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-60 text-center py-20 text-gray-500 dark:text-gray-400">
                                <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 mb-6 flex items-center justify-center shadow-sm">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        💬
                                    </motion.div>
                                </div>
                                <h5 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">No messages here yet</h5>
                                <p className="text-xs max-w-[200px]">Send a message to start a conversation with {otherParticipant?.name}.</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUserId;
                                const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
                                    >
                                        {!isMe && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 relative shadow-sm">
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

                                        <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                            {msg.attachment && (
                                                <div className="mb-2">
                                                    {msg.attachmentType === "image" ? (
                                                        <a href={msg.attachment} target="_blank" rel="noopener noreferrer" className="block relative w-full max-w-[450px] min-h-[100px] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:opacity-90 transition-opacity bg-white dark:bg-gray-800 shadow-sm">
                                                            <img
                                                                src={msg.attachment}
                                                                alt="Attachment"
                                                                className="w-full h-auto max-h-[500px] object-contain block"
                                                                loading="lazy"
                                                            />
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href={msg.attachment}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all shadow-sm
                                                                ${isMe ? "bg-teal-600/20 border-teal-500/20 hover:bg-teal-600/30 text-white" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-gray-100"}
                                                            `}
                                                        >
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMe ? "bg-white/20" : "bg-gray-100 dark:bg-gray-900 text-teal-600 dark:text-teal-400"}`}>
                                                                <FileIcon size={20} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold truncate">File Attachment</p>
                                                                <p className="text-[10px] opacity-70">Click to view/download</p>
                                                            </div>
                                                            <FileDown size={16} className="opacity-50" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            {(() => {
                                                if (!msg.content || !msg.content.trim()) return null;

                                                const isSingleEmoji = /^\p{Extended_Pictographic}$/u.test(msg.content.trim());
                                                if (isSingleEmoji && !msg.attachment) {
                                                    return (
                                                        <div className="text-6xl py-2 select-none animate-in zoom-in duration-300">
                                                            {msg.content}
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div className={`px-5 py-3.5 rounded-[20px] text-[15px] font-medium leading-relaxed shadow-sm
                                                        ${isMe
                                                            ? "bg-teal-500 text-white rounded-br-sm shadow-teal-500/10"
                                                            : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm"}
                                                    `}>
                                                        {msg.content}
                                                    </div>
                                                );
                                            })()}

                                            <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && (
                                                    <span className={msg.isRead ? "text-teal-500" : "text-gray-300 dark:text-gray-600"}>
                                                        {msg.isRead ? <CheckCheck size={14} /> : <Check size={14} />}
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
        </div >
    );
}
