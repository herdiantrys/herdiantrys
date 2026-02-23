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
        <div className="flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/50 border-r border-gray-100 dark:border-gray-800 md:w-80 transition-all duration-300">
            {/* Header / Search */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/80 backdrop-blur-md">
                <h3 className="text-xl font-bold mb-4 tracking-tight text-gray-900 dark:text-gray-100">Messages</h3>
                <div className="relative group/search">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-teal-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400 dark:text-gray-500">
                        <div className="w-16 h-16 rounded-full border border-dashed border-gray-300 dark:border-gray-700 mb-4 flex items-center justify-center bg-white/50 dark:bg-gray-800/50">
                            <Search size={24} />
                        </div>
                        <p className="text-sm font-medium">No active conversations yet.</p>
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
                                className={`w-full flex items-center gap-4 p-4 transition-all relative group border-b border-transparent
                                    ${isActive ? "bg-white dark:bg-gray-800/80 shadow-sm ring-1 ring-gray-100/50 dark:ring-gray-700/50" : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50 border-b-gray-50 dark:border-b-gray-800/50"}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="conv-active"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"
                                    />
                                )}

                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 relative shadow-sm">
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
                                        <span className={`text-sm font-bold truncate ${isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100"}`}>
                                            {otherParticipant?.name || "Deleted User"}
                                        </span>
                                        {lastMessage && (
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0 uppercase tracking-tighter">
                                                {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-xs truncate flex-1 ${isUnread ? "text-gray-900 dark:text-gray-100 font-bold" : "text-gray-500 dark:text-gray-400 font-medium"}`}>
                                            {lastMessage?.content || "Start a conversation..."}
                                        </p>
                                        {isUnread && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-sm shadow-teal-500/20 shrink-0" />
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
