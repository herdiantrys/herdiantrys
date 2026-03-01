"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Plus, MoreVertical, Phone, Video, Info,
    Smile, Paperclip, Image as ImageIcon, Send,
    Check, CheckCheck, Mic, MessageSquare, X, ArrowLeft
} from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

// Dummy Data
const DUMMY_CONVERSATIONS = [
    {
        id: "1",
        name: "Sarah Jenkins",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        isOnline: true,
        lastMessage: "That looks amazing! Let's review it tomorrow morning.",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        unread: 2,
    },
    {
        id: "2",
        name: "Design Team",
        avatar: "https://i.pravatar.cc/150?u=design",
        isOnline: false,
        lastMessage: "Alex: I've updated the Figma file.",
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        unread: 0,
    },
    {
        id: "3",
        name: "Michael Chen",
        avatar: "https://i.pravatar.cc/150?u=michael",
        isOnline: true,
        lastMessage: "Are we still on for the 2 PM meeting?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        unread: 0,
    },
    {
        id: "4",
        name: "Emily Rodriguez",
        avatar: "https://i.pravatar.cc/150?u=emily",
        isOnline: false,
        lastMessage: "Thanks for the help earlier!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        unread: 0,
    },
    {
        id: "5",
        name: "David Kim",
        avatar: "https://i.pravatar.cc/150?u=david",
        isOnline: true,
        lastMessage: "Can you send over the latest assets?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        unread: 0,
    }
];

const DUMMY_MESSAGES = [
    {
        id: "m1",
        senderId: "currentUser",
        text: "Hey Sarah, I've finished the initial mocks for the new dashboard.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        status: "read"
    },
    {
        id: "m2",
        senderId: "1",
        text: "Oh awesome! How did the light mode version turn out?",
        timestamp: new Date(Date.now() - 1000 * 60 * 55),
    },
    {
        id: "m3",
        senderId: "currentUser",
        text: "Really well! Clean aesthetic, subtle borders, and a vibrant accent for primary actions.",
        timestamp: new Date(Date.now() - 1000 * 60 * 50),
        status: "read"
    },
    {
        id: "m4",
        senderId: "1",
        text: "That sounds exactly like what we discussed.",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
    },
    {
        id: "m5",
        senderId: "1",
        text: "That looks amazing! Let's review it tomorrow morning. 🔥",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
    }
];

// Sub-components
function ConversationItem({
    conv,
    isActive,
    onClick,
}: {
    conv: typeof DUMMY_CONVERSATIONS[0];
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <motion.button
            layout
            onClick={onClick}
            whileHover={{ x: 2 }}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 text-left relative group
                ${isActive
                    ? "bg-[var(--site-sidebar-active)] border border-[var(--site-secondary)]/20 shadow-sm"
                    : "hover:bg-[var(--site-sidebar-active)]/60 border border-transparent"
                }`}
        >
            {/* Active indicator */}
            {isActive && (
                <motion.div
                    layoutId="activeConvIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[var(--site-secondary)] rounded-full"
                />
            )}

            {/* Avatar */}
            <div className="relative shrink-0 ml-1">
                <div className={`rounded-full overflow-hidden transition-all duration-200 ${isActive ? 'ring-2 ring-[var(--site-secondary)]/40 ring-offset-1 ring-offset-transparent' : ''}`}>
                    <Image
                        src={conv.avatar}
                        alt={conv.name}
                        width={44}
                        height={44}
                        className="rounded-full object-cover"
                    />
                </div>
                {conv.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--site-sidebar-accent)] border-2 border-[var(--site-sidebar-bg)] rounded-full shadow-sm" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-sm font-semibold truncate transition-colors
                        ${isActive ? 'text-[var(--site-secondary)]' : 'text-[var(--site-sidebar-fg)]'}`}>
                        {conv.name}
                    </h3>
                    <span className={`text-[10px] font-medium shrink-0 ml-2 ${conv.unread > 0 ? 'text-[var(--site-secondary)]' : 'text-[var(--site-sidebar-fg)]/40'}`}>
                        {formatDistanceToNow(conv.timestamp, { addSuffix: false }).replace('about ', '')}
                    </span>
                </div>
                <p className={`text-xs truncate transition-colors
                    ${conv.unread > 0 ? 'text-[var(--site-sidebar-fg)] font-semibold' : 'text-[var(--site-sidebar-fg)]/50 font-normal'}`}>
                    {conv.lastMessage}
                </p>
            </div>

            {/* Unread Badge */}
            {conv.unread > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="shrink-0 min-w-[20px] h-5 px-1.5 bg-[var(--site-secondary)] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                >
                    {conv.unread}
                </motion.div>
            )}
        </motion.button>
    );
}

function MessageBubble({ msg, activeConversation, index }: {
    msg: typeof DUMMY_MESSAGES[0];
    activeConversation: typeof DUMMY_CONVERSATIONS[0];
    index: number;
}) {
    const isCurrentUser = msg.senderId === "currentUser";
    const showAvatar = !isCurrentUser && (index === 0 || DUMMY_MESSAGES[index - 1]?.senderId !== msg.senderId);
    const isGrouped = !isCurrentUser && index > 0 && DUMMY_MESSAGES[index - 1]?.senderId === msg.senderId;

    return (
        <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.04 }}
            className={`flex gap-2.5 ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}
        >
            {/* Other user avatar */}
            {!isCurrentUser && (
                <div className="w-8 shrink-0 flex items-end">
                    {showAvatar ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Image
                                src={activeConversation.avatar}
                                alt={activeConversation.name}
                                width={32}
                                height={32}
                                className="rounded-full object-cover shadow-sm ring-1 ring-[var(--site-sidebar-border)]"
                            />
                        </motion.div>
                    ) : null}
                </div>
            )}

            <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[72%]`}>
                <div
                    className={`px-4 py-2.5 text-[14px] leading-relaxed shadow-sm relative
                        ${isCurrentUser
                            ? `bg-[var(--site-secondary)] text-white
                               ${isGrouped ? 'rounded-[18px] rounded-br-md' : 'rounded-[18px] rounded-br-sm'}`
                            : `bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--glass-text)] backdrop-blur-sm
                               ${isGrouped ? 'rounded-[18px] rounded-bl-md' : 'rounded-[18px] rounded-bl-sm'}`
                        }`}
                >
                    {msg.text}
                </div>

                {/* Timestamp & Status */}
                <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] font-medium text-[var(--site-sidebar-fg)]/35">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isCurrentUser && (
                        <span className={msg.status === 'read' ? 'text-[var(--site-secondary)]' : 'text-[var(--site-sidebar-fg)]/30'}>
                            {msg.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function MessagingHub({ user, dict }: { user: any, dict: any }) {
    const [activeChatId, setActiveChatId] = useState<string>("1");
    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [isMobileListView, setIsMobileListView] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const activeConversation = DUMMY_CONVERSATIONS.find(c => c.id === activeChatId);
    const filteredConversations = DUMMY_CONVERSATIONS.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Auto-scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeChatId]);

    // Auto-resize textarea
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageInput(e.target.value);
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
        }
    };

    const handleSelectChat = (id: string) => {
        setActiveChatId(id);
        setIsMobileListView(false);
    };

    return (
        <div className="h-[calc(100vh-160px)] min-h-[560px] max-h-[780px] w-full flex overflow-hidden rounded-2xl bg-[var(--site-sidebar-bg)] border border-[var(--site-sidebar-border)] shadow-2xl shadow-black/10">

            {/* ─── Conversation Sidebar ─── */}
            <motion.div
                className={`w-[300px] lg:w-[320px] flex-shrink-0 flex flex-col border-r border-[var(--site-sidebar-border)]
                    ${!isMobileListView ? 'hidden lg:flex' : 'flex'}`}
            >
                {/* Sidebar Header */}
                <div className="px-5 pt-5 pb-4 border-b border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-[var(--site-sidebar-fg)] leading-tight">Messages</h2>
                            <p className="text-[11px] text-[var(--site-sidebar-fg)]/50 font-medium mt-0.5">
                                {DUMMY_CONVERSATIONS.filter(c => c.unread > 0).length} unread
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-9 h-9 bg-[var(--site-secondary)] text-white rounded-xl flex items-center justify-center shadow-md shadow-[var(--site-secondary)]/20 hover:opacity-90 transition-opacity"
                            title="New Message"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                        </motion.button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--site-sidebar-fg)]/40" size={15} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)] rounded-xl py-2.5 pl-9 pr-4 text-[13px] text-[var(--site-sidebar-fg)] placeholder:text-[var(--site-sidebar-fg)]/35 focus:border-[var(--site-secondary)]/40 focus:ring-2 focus:ring-[var(--site-secondary)]/10 transition-all outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--site-sidebar-fg)]/40 hover:text-[var(--site-sidebar-fg)] transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 px-4 pt-3 pb-1">
                    {["All", "Unread", "Groups"].map((tab, i) => (
                        <button
                            key={tab}
                            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${i === 0
                                ? 'bg-[var(--site-secondary)]/10 text-[var(--site-secondary)]'
                                : 'text-[var(--site-sidebar-fg)]/50 hover:text-[var(--site-sidebar-fg)] hover:bg-[var(--site-sidebar-active)]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-thin scrollbar-thumb-[var(--site-sidebar-border)] scrollbar-track-transparent">
                    <AnimatePresence>
                        {filteredConversations.length > 0 ? filteredConversations.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conv={conv}
                                isActive={activeChatId === conv.id}
                                onClick={() => handleSelectChat(conv.id)}
                            />
                        )) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-12 h-12 rounded-full bg-[var(--site-sidebar-active)] flex items-center justify-center mb-3">
                                    <Search size={20} className="text-[var(--site-sidebar-fg)]/30" />
                                </div>
                                <p className="text-sm text-[var(--site-sidebar-fg)]/50 font-medium">No results found</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* ─── Main Chat Area ─── */}
            <div className={`flex-1 flex flex-col min-w-0 bg-[var(--glass-bg)] backdrop-blur-sm
                ${isMobileListView ? 'hidden lg:flex' : 'flex'}`}>

                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-5 py-3.5 border-b border-[var(--site-sidebar-border)] bg-[var(--site-sidebar-bg)]/80 backdrop-blur-md flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                {/* Mobile back button */}
                                <button
                                    onClick={() => setIsMobileListView(true)}
                                    className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--site-sidebar-active)] text-[var(--site-sidebar-fg)] transition-colors mr-1"
                                >
                                    <ArrowLeft size={18} />
                                </button>

                                <div className="relative">
                                    <Image
                                        src={activeConversation.avatar}
                                        alt={activeConversation.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover shadow-sm ring-1 ring-[var(--site-sidebar-border)]"
                                    />
                                    {activeConversation.isOnline && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--site-sidebar-accent)] border-2 border-[var(--site-sidebar-bg)] rounded-full" />
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-sm font-bold text-[var(--site-sidebar-fg)] leading-tight">
                                        {activeConversation.name}
                                    </h2>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${activeConversation.isOnline ? 'bg-[var(--site-sidebar-accent)]' : 'bg-[var(--site-sidebar-fg)]/30'}`} />
                                        <p className={`text-[11px] font-medium ${activeConversation.isOnline ? 'text-[var(--site-sidebar-accent)]' : 'text-[var(--site-sidebar-fg)]/40'}`}>
                                            {activeConversation.isOnline ? 'Active now' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Header Actions */}
                            <div className="flex items-center gap-1 text-[var(--site-sidebar-fg)]/40">
                                {[
                                    { icon: Phone, label: "Call" },
                                    { icon: Video, label: "Video" },
                                    { icon: Info, label: "Info" },
                                    { icon: MoreVertical, label: "More" },
                                ].map(({ icon: Icon, label }, i) => (
                                    <motion.button
                                        key={label}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 hover:bg-[var(--site-sidebar-active)] hover:text-[var(--site-sidebar-fg)] rounded-xl transition-all"
                                        title={label}
                                    >
                                        <Icon size={17} />
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Message History */}
                        <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin scrollbar-thumb-[var(--site-sidebar-border)] scrollbar-track-transparent">
                            {/* Date Separator */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 h-px bg-[var(--site-sidebar-border)]" />
                                <span className="px-3 py-1 bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)] rounded-full text-[10px] font-semibold text-[var(--site-sidebar-fg)]/50 uppercase tracking-wider">
                                    Today
                                </span>
                                <div className="flex-1 h-px bg-[var(--site-sidebar-border)]" />
                            </div>

                            {/* Messages */}
                            {DUMMY_MESSAGES.map((msg, index) => (
                                <MessageBubble
                                    key={msg.id}
                                    msg={msg}
                                    activeConversation={activeConversation}
                                    index={index}
                                />
                            ))}

                            {/* Typing Indicator */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="flex gap-2.5 mt-4"
                            >
                                <Image
                                    src={activeConversation.avatar}
                                    alt={activeConversation.name}
                                    width={28}
                                    height={28}
                                    className="rounded-full object-cover self-end"
                                />
                                <div className="px-4 py-3 rounded-[18px] rounded-bl-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm flex items-center gap-1">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1.5 h-1.5 rounded-full bg-[var(--site-sidebar-fg)]/30"
                                            animate={{ y: [0, -4, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input Area */}
                        <div className="p-4 bg-[var(--site-sidebar-bg)]/90 backdrop-blur-md border-t border-[var(--site-sidebar-border)] shrink-0">
                            <div className="flex items-end gap-2 bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)] rounded-2xl p-2 focus-within:border-[var(--site-secondary)]/40 focus-within:ring-2 focus-within:ring-[var(--site-secondary)]/10 transition-all shadow-sm">

                                {/* Attachment tools */}
                                <div className="flex gap-0.5 pl-1 pb-0.5 text-[var(--site-sidebar-fg)]/40 shrink-0">
                                    {[
                                        { icon: Smile, label: "Emoji" },
                                        { icon: Paperclip, label: "Attach" },
                                        { icon: ImageIcon, label: "Image" },
                                    ].map(({ icon: Icon, label }) => (
                                        <motion.button
                                            key={label}
                                            whileHover={{ scale: 1.15 }}
                                            whileTap={{ scale: 0.9 }}
                                            title={label}
                                            className="p-1.5 hover:text-[var(--site-sidebar-fg)] hover:bg-[var(--site-sidebar-border)]/30 rounded-lg transition-all"
                                        >
                                            <Icon size={18} />
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Text Input */}
                                <textarea
                                    ref={textareaRef}
                                    value={messageInput}
                                    onChange={handleTextareaChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (messageInput.trim()) setMessageInput("");
                                        }
                                    }}
                                    placeholder="Write a message..."
                                    className="flex-1 max-h-[120px] min-h-[40px] bg-transparent border-none focus:ring-0 resize-none py-2.5 px-2 text-[14px] text-[var(--site-sidebar-fg)] placeholder:text-[var(--site-sidebar-fg)]/30 font-normal leading-relaxed outline-none"
                                    rows={1}
                                />

                                {/* Send / Mic button */}
                                <div className="pb-0.5 pr-0.5 shrink-0">
                                    <AnimatePresence mode="wait">
                                        {messageInput.trim() ? (
                                            <motion.button
                                                key="send"
                                                initial={{ scale: 0, rotate: -90 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 90 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setMessageInput("")}
                                                className="w-10 h-10 bg-[var(--site-accent)] hover:opacity-90 text-white rounded-xl flex items-center justify-center transition-opacity shadow-lg shadow-[var(--site-accent)]/25"
                                            >
                                                <Send size={16} className="translate-x-0.5" />
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                key="mic"
                                                initial={{ scale: 0, rotate: 90 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: -90 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.85 }}
                                                className="w-10 h-10 bg-[var(--site-secondary)]/10 hover:bg-[var(--site-secondary)]/20 text-[var(--site-secondary)] rounded-xl flex items-center justify-center transition-all"
                                            >
                                                <Mic size={16} />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Hint text */}
                            <p className="text-[10px] text-[var(--site-sidebar-fg)]/25 text-center mt-2 font-medium">
                                Enter to send · Shift+Enter for new line
                            </p>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center"
                    >
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="w-20 h-20 rounded-2xl bg-[var(--site-secondary)]/10 border border-[var(--site-secondary)]/20 flex items-center justify-center mb-5 shadow-lg shadow-[var(--site-secondary)]/10"
                        >
                            <MessageSquare size={36} className="text-[var(--site-secondary)]" />
                        </motion.div>
                        <h3 className="text-lg font-bold text-[var(--site-sidebar-fg)] mb-2">Your Messages</h3>
                        <p className="text-sm text-[var(--site-sidebar-fg)]/50 text-center max-w-[240px] leading-relaxed">
                            Select a conversation to start chatting
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-[var(--site-secondary)] text-white text-sm font-semibold rounded-xl shadow-md shadow-[var(--site-secondary)]/20 hover:opacity-90 transition-opacity"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            New Conversation
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
