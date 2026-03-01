"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getConversations, getMessages, sendMessage, markAsRead } from "@/lib/actions/message.actions";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import { X, MessageCircle, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface MessageCenterProps {
    currentUserId: string;
    isOpen?: boolean;
    onClose?: () => void;
    onOpen?: () => void;
}

export default function MessageCenter({ currentUserId, isOpen = false, onClose, onOpen }: MessageCenterProps) {
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const fetchConvs = useCallback(async () => {
        const res = await getConversations();
        if (res.success) {
            setConversations(res.conversations || []);
        }
    }, []);

    const fetchMsgs = useCallback(async (id: string, silent = false) => {
        if (!silent) setLoading(true);
        const res = await getMessages(id);
        if (res.success) {
            setMessages(res.messages || []);
            await markAsRead(id);
        }
        if (!silent) setLoading(false);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        fetchConvs();
        const interval = setInterval(fetchConvs, 10000);
        return () => clearInterval(interval);
    }, [isOpen, fetchConvs]);

    useEffect(() => {
        if (!activeConvId || !isOpen) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            return;
        }
        pollingRef.current = setInterval(() => {
            fetchMsgs(activeConvId, true);
        }, 3000);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [activeConvId, isOpen, fetchMsgs]);

    const handleSelectConversation = useCallback(async (id: string | null, recipientId?: string) => {
        if (id) {
            setActiveConvId(id);
            fetchMsgs(id);
        } else if (recipientId) {
            const existing = conversations.find(c =>
                c.participants.some((p: any) => p.id === recipientId)
            );
            if (existing) {
                setActiveConvId(existing.id);
                fetchMsgs(existing.id);
            } else {
                setActiveConvId(`new-${recipientId}`);
                setMessages([]);
            }
        }
    }, [conversations, fetchMsgs]);

    useEffect(() => {
        const handleOpenDM = (e: any) => {
            const { recipientId } = e.detail;
            if (recipientId) {
                if (onOpen) onOpen();
                handleSelectConversation(null, recipientId);
            }
        };
        window.addEventListener('open-direct-message' as any, handleOpenDM);
        return () => window.removeEventListener('open-direct-message' as any, handleOpenDM);
    }, [onOpen, handleSelectConversation]);

    const handleSendMessage = async (content: string, attachment?: string, attachmentType?: string) => {
        if (!activeConvId) return;

        let recipientId = "";
        let isNew = false;

        if (activeConvId.startsWith("new-")) {
            recipientId = activeConvId.replace("new-", "");
            isNew = true;
        } else {
            const activeConv = conversations.find(c => c.id === activeConvId);
            const recipient = activeConv?.participants.find((p: any) => p.id !== currentUserId);
            if (!recipient) return;
            recipientId = recipient.id;
        }

        const tempId = `temp-${Date.now()}`;
        const newMessage = {
            id: tempId,
            content,
            attachment,
            attachmentType,
            createdAt: new Date().toISOString(),
            senderId: currentUserId,
            sender: { id: currentUserId }
        };
        setMessages(prev => [...prev, newMessage]);

        const res = await sendMessage(recipientId, content, attachment, attachmentType);
        if (!res.success) {
            toast.error("Failed to send message");
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } else {
            setMessages(prev => prev.map(m => m.id === tempId ? res.message : m));
            if (isNew) {
                setActiveConvId(res.conversationId);
            }
            fetchConvs();
        }
    };

    const activeConversation = conversations.find(c => c.id === activeConvId);
    const otherParticipant = activeConversation?.participants.find((p: any) => p.id !== currentUserId);

    if (!isOpen) return null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{
                duration: 0.35,
                ease: [0.32, 0.72, 0, 1],
                layout: { duration: 0.35, ease: [0.32, 0.72, 0, 1] }
            }}
            style={{ willChange: "transform, opacity" }}
            className={`fixed bottom-4 right-4 z-[200] flex flex-col overflow-hidden
                bg-[var(--site-sidebar-bg)] border border-[var(--site-sidebar-border)]
                shadow-2xl shadow-black/20 rounded-2xl
                ${isExpanded ? "top-4 left-4" : "w-[92vw] md:w-[860px] h-[70vh]"}
            `}
        >
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)] backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--site-secondary)]/10 flex items-center justify-center text-[var(--site-secondary)]">
                        <MessageCircle size={17} />
                    </div>
                    <div>
                        <span className="font-bold text-sm text-[var(--glass-text)] tracking-tight">Messaging Hub</span>
                        {conversations.length > 0 && (
                            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--site-secondary)]/10 text-[var(--site-secondary)]">
                                {conversations.length}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-[var(--site-sidebar-active)] rounded-xl transition-colors text-[var(--glass-text-muted)] hover:text-[var(--glass-text)]"
                    >
                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-[var(--glass-text-muted)] hover:text-red-500"
                    >
                        <X size={16} />
                    </motion.button>
                </div>
            </div>

            {/* ─── Body ─── */}
            <div className="flex-1 flex min-h-0 divide-x divide-[var(--site-sidebar-border)]">
                {/* Conversations Sidebar */}
                <div className={`${activeConvId ? "hidden md:flex" : "flex w-full"} md:w-[280px] shrink-0`}>
                    <ConversationList
                        conversations={conversations}
                        activeId={activeConvId || undefined}
                        onSelect={handleSelectConversation}
                        currentUserId={currentUserId}
                    />
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col min-w-0 ${!activeConvId ? "hidden md:flex" : "flex"}`}>
                    {activeConvId ? (
                        <>
                            {/* Mobile back */}
                            <div className="md:hidden p-2 border-b border-[var(--site-sidebar-border)]">
                                <button
                                    onClick={() => setActiveConvId(null)}
                                    className="text-xs font-bold uppercase tracking-widest text-[var(--glass-text-muted)] p-2 hover:bg-[var(--site-sidebar-active)] rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    ← Back
                                </button>
                            </div>
                            <ChatWindow
                                messages={messages}
                                currentUserId={currentUserId}
                                loading={loading}
                                otherParticipant={otherParticipant}
                            />
                            <ChatInput onSend={handleSendMessage} />
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                        >
                            <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                className="w-20 h-20 rounded-2xl bg-[var(--site-secondary)]/10 border border-[var(--site-secondary)]/20 flex items-center justify-center mb-5"
                            >
                                <MessageCircle size={36} className="text-[var(--site-secondary)]/60" />
                            </motion.div>
                            <h4 className="text-base font-bold mb-2 text-[var(--glass-text)]">Select a conversation</h4>
                            <p className="text-sm text-[var(--glass-text-muted)] max-w-xs">
                                Pick a chat from the left or visit someone's profile to start a new direct message.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
