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

    // Polling interval ref
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
            // Mark as read when opening a conversation
            await markAsRead(id);
        }
        if (!silent) setLoading(false);
    }, []);

    // Initial load and periodic refresh of conversations
    useEffect(() => {
        if (!isOpen) return;
        fetchConvs();
        const interval = setInterval(fetchConvs, 10000); // Poll conversations list every 10s
        return () => clearInterval(interval);
    }, [isOpen, fetchConvs]);

    // Polling messages for active conversation
    useEffect(() => {
        if (!activeConvId || !isOpen) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            return;
        }

        // Silent poll messages every 3 seconds for a "live" feel
        pollingRef.current = setInterval(() => {
            fetchMsgs(activeConvId, true);
        }, 3000);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [activeConvId, isOpen, fetchMsgs]);

    // Handle selecting a conversation
    const handleSelectConversation = useCallback(async (id: string | null, recipientId?: string) => {
        if (id) {
            setActiveConvId(id);
            fetchMsgs(id);
        } else if (recipientId) {
            // Try to find a conversation with this recipient first
            const existing = conversations.find(c =>
                c.participants.some((p: any) => p.id === recipientId)
            );
            if (existing) {
                setActiveConvId(existing.id);
                fetchMsgs(existing.id);
            } else {
                // Pre-select a "new" conversation state (handle in UI)
                setActiveConvId(`new-${recipientId}`);
                setMessages([]);
            }
        }
    }, [conversations, fetchMsgs]);

    // Listen for custom event to open chat
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

    // Handle sending a message
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

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const newMessage = {
            id: tempId,
            content,
            attachment,
            attachmentType,
            createdAt: new Date().toISOString(),
            senderId: currentUserId,
            sender: { id: currentUserId } // Minimal for UI
        };
        setMessages(prev => [...prev, newMessage]);

        const res = await sendMessage(recipientId, content, attachment, attachmentType);
        if (!res.success) {
            toast.error("Failed to send message");
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } else {
            // Replace temp message with real one
            setMessages(prev => prev.map(m => m.id === tempId ? res.message : m));
            if (isNew) {
                setActiveConvId(res.conversationId);
            }
            fetchConvs(); // Refresh list to update preview
        }
    };

    const activeConversation = conversations.find(c => c.id === activeConvId);
    const otherParticipant = activeConversation?.participants.find((p: any) => p.id !== currentUserId);

    if (!isOpen) return null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: "100%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: "100%" }}
            transition={{
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
                layout: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                }
            }}
            style={{ willChange: "transform, opacity, width, height" }}
            className={`fixed bottom-4 right-4 z-[200] flex flex-col bg-white dark:bg-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-black/50 overflow-hidden border border-gray-200 dark:border-gray-800 rounded-2xl
                ${isExpanded ? "top-4 left-4" : "w-[90vw] md:w-[900px] h-[70vh]"}
            `}
        >
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between p-4 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                        <MessageCircle size={18} />
                    </div>
                    <span className="font-bold tracking-tight text-gray-900 dark:text-gray-100">Messaging Hub</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-200"
                    >
                        {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-500/20 focus:outline-none rounded-lg transition-colors text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex min-h-0 divide-x divide-gray-100 dark:divide-gray-800">
                {/* Conversations Sidebar */}
                <div className={`${activeConvId ? "hidden md:flex" : "flex w-full"} md:w-80 shrink-0`}>
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
                            {/* Back button for mobile */}
                            <div className="md:hidden p-2 border-b border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => setActiveConvId(null)}
                                    className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg flex items-center gap-2"
                                >
                                    ← Back to chats
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
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/30 dark:bg-gray-900/50">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500/10 dark:from-teal-500/20 via-transparent to-transparent flex items-center justify-center mb-6">
                                <MessageCircle size={48} className="text-teal-500/50 dark:text-teal-500/60" />
                            </div>
                            <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Select a conversation</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Pick a chat from the left or visit someone's profile to start a new direct message.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
