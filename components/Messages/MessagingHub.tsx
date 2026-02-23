"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Plus, MoreVertical, Phone, Video, Info,
    Smile, Paperclip, Image as ImageIcon, Send,
    Check, CheckCheck, Circle, Mic
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
        status: "read" // sent, delivered, read
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
        text: "Really well, I think. I went with a very clean, Apple-esque aesthetic. Lots of white space, subtle gray borders, and a vibrant teal accent for the primary actions.",
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
        text: "That looks amazing! Let's review it tomorrow morning.",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
    }
];

export default function MessagingHub({ user, dict }: { user: any, dict: any }) {
    const [activeChatId, setActiveChatId] = useState<string>("1");
    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");

    const activeConversation = DUMMY_CONVERSATIONS.find(c => c.id === activeChatId);

    const filteredConversations = DUMMY_CONVERSATIONS.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-140px)] min-h-[600px] w-full bg-white rounded-3xl shadow-xl border border-gray-100/50 flex overflow-hidden">

            {/* Sidebar (Conversations List) */}
            <div className="w-80 lg:w-96 flex-shrink-0 border-r border-gray-100 bg-gray-50/30 flex flex-col">
                {/* Sidebar Header */}
                <div className="p-6 pb-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Messages</h2>
                        <button className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm" title="New Message">
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-100/80 border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
                    {filteredConversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => setActiveChatId(conv.id)}
                            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 text-left relative
                                ${activeChatId === conv.id
                                    ? "bg-white shadow-sm border border-gray-100/80 ring-1 ring-gray-900/5"
                                    : "hover:bg-gray-100/50 border border-transparent"
                                }`}
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <Image
                                    src={conv.avatar}
                                    alt={conv.name}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover shadow-sm bg-gray-100"
                                />
                                {conv.isOnline && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`text-sm font-semibold truncate ${activeChatId === conv.id ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {conv.name}
                                    </h3>
                                    <span className="text-[11px] font-medium text-gray-400 shrink-0 ml-2">
                                        {formatDistanceToNow(conv.timestamp, { addSuffix: false }).replace('about ', '')}
                                    </span>
                                </div>
                                <p className={`text-xs truncate ${conv.unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500 font-medium'}`}>
                                    {conv.lastMessage}
                                </p>
                            </div>

                            {/* Unread Badge */}
                            {conv.unread > 0 && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-teal-500/20">
                                    {conv.unread}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-[84px] px-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Image
                                        src={activeConversation.avatar}
                                        alt={activeConversation.name}
                                        width={44}
                                        height={44}
                                        className="rounded-full object-cover shadow-sm"
                                    />
                                    {activeConversation.isOnline && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">{activeConversation.name}</h2>
                                    <p className="text-xs font-medium text-emerald-500">
                                        {activeConversation.isOnline ? 'Online now' : 'Offline'}
                                    </p>
                                </div>
                            </div>

                            {/* Header Actions */}
                            <div className="flex items-center gap-2 text-gray-400">
                                <button className="p-2.5 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"><Phone size={20} /></button>
                                <button className="p-2.5 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"><Video size={20} /></button>
                                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                <button className="p-2.5 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"><Info size={20} /></button>
                                <button className="p-2.5 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Message History */}
                        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-gray-50/30 custom-scrollbar">
                            {/* Date Separator */}
                            <div className="flex justify-center">
                                <span className="px-4 py-1.5 bg-white border border-gray-100 rounded-full text-xs font-semibold text-gray-500 shadow-sm">
                                    Today, March 12
                                </span>
                            </div>

                            {DUMMY_MESSAGES.map((msg, index) => {
                                const isCurrentUser = msg.senderId === "currentUser";
                                const showAvatar = !isCurrentUser && (index === 0 || DUMMY_MESSAGES[index - 1]?.senderId !== msg.senderId);

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!isCurrentUser && (
                                            <div className="w-8 shrink-0 flex items-end">
                                                {showAvatar && (
                                                    <Image
                                                        src={activeConversation.avatar}
                                                        alt={activeConversation.name}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full shadow-sm"
                                                    />
                                                )}
                                            </div>
                                        )}

                                        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                            <div
                                                className={`px-5 py-3.5 rounded-[20px] text-[15px] leading-relaxed shadow-sm
                                                    ${isCurrentUser
                                                        ? 'bg-teal-500 text-white rounded-br-sm'
                                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                                                    }
                                                `}
                                            >
                                                {msg.text}
                                            </div>

                                            {/* Timestamp & Status */}
                                            <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                                <span className="text-[10px] font-semibold text-gray-400">
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isCurrentUser && (
                                                    <span className={`${msg.status === 'read' ? 'text-teal-500' : 'text-gray-300'}`}>
                                                        {msg.status === 'read' ? <CheckCheck size={14} /> : <Check size={14} />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                            <div className="flex items-end gap-3 bg-gray-50/80 border border-gray-200/60 rounded-3xl p-2.5 focus-within:border-teal-500/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-500/10 transition-all shadow-sm">

                                <div className="flex gap-1 pl-2 pb-1 text-gray-400 shrink-0">
                                    <button className="p-2 hover:text-gray-700 hover:bg-gray-200/50 rounded-full transition-colors"><Smile size={20} /></button>
                                    <button className="p-2 hover:text-gray-700 hover:bg-gray-200/50 rounded-full transition-colors"><Paperclip size={20} /></button>
                                    <button className="p-2 hover:text-gray-700 hover:bg-gray-200/50 rounded-full transition-colors"><ImageIcon size={20} /></button>
                                </div>

                                <textarea
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-3 text-[15px] text-gray-800 placeholder:text-gray-400 font-medium leading-relaxed custom-scrollbar"
                                    rows={1}
                                    style={{
                                        // Auto-resize logic would go here in a real impl
                                    }}
                                />

                                <div className="flex items-center gap-2 pr-1 pb-1 shrink-0">
                                    {messageInput.trim() ? (
                                        <button className="w-11 h-11 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center transition-all shadow-md shadow-teal-500/20 active:scale-95">
                                            <Send size={18} className="translate-x-0.5" />
                                        </button>
                                    ) : (
                                        <button className="w-11 h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95">
                                            <Mic size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
                        <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center text-teal-500 mb-6">
                            <Send size={40} className="translate-x-1" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h3>
                        <p className="text-sm font-medium text-gray-500 text-center max-w-sm">
                            Select a conversation from the sidebar to start chatting or create a new message.
                        </p>
                    </div>
                )}
            </div>

            {/* Custom Scrollbar Styles for this component */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.3);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(156, 163, 175, 0.5);
                }
            `}</style>
        </div>
    );
}
