"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Image from "next/image";

interface ConversationListProps {
    conversations: any[];
    activeId?: string;
    onSelect: (id: string) => void;
    currentUserId: string;
}

export default function ConversationList({
    conversations,
    activeId,
    onSelect,
    currentUserId
}: ConversationListProps) {
    return (
        <div className="flex flex-col h-full bg-white/5 border-r border-white/5 md:w-80 transition-all duration-300">
            {/* Header / Search */}
            <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-2xl">
                <h3 className="text-xl font-bold mb-4 tracking-tight">Messages</h3>
                <div className="relative group/search">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-[var(--site-secondary)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--site-secondary)]/30 transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 opacity-40 text-center">
                        <div className="w-16 h-16 rounded-full border border-dashed border-white/20 mb-4 flex items-center justify-center">
                            <Search size={24} />
                        </div>
                        <p className="text-sm">No active conversations yet.</p>
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const otherParticipant = conv.participants.find((p: any) => p.id !== currentUserId);
                        const lastMessage = conv.messages[0];
                        const isActive = conv.id === activeId;
                        const isUnread = lastMessage && !lastMessage.isRead && lastMessage.senderId !== currentUserId;

                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={`w-full flex items-center gap-4 p-4 transition-all relative group
                                    ${isActive ? "bg-white/10" : "hover:bg-white/5"}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="conv-active"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--site-secondary)]"
                                    />
                                )}

                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5 relative">
                                        <Image
                                            src={otherParticipant?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant?.name || "U")}&background=random`}
                                            alt={otherParticipant?.name || "User"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {/* Online indicator based on lastActiveAt */}
                                    {otherParticipant?.lastActiveAt && (new Date().getTime() - new Date(otherParticipant.lastActiveAt).getTime()) < 5 * 60 * 1000 ? (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#111] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    ) : (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 border-2 border-[#111] rounded-full" />
                                    )}
                                </div>

                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={`text-sm font-bold truncate ${isActive ? "text-white" : "text-gray-300"}`}>
                                            {otherParticipant?.name || "Deleted User"}
                                        </span>
                                        {lastMessage && (
                                            <span className="text-[10px] text-gray-500 shrink-0 uppercase tracking-tighter">
                                                {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-xs truncate flex-1 ${isUnread ? "text-white font-bold" : "text-gray-500"}`}>
                                            {lastMessage?.content || "Start a conversation..."}
                                        </p>
                                        {isUnread && (
                                            <div className="w-2 h-2 rounded-full bg-[var(--site-secondary)] shadow-[0_0_10px_var(--site-secondary)]" />
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
