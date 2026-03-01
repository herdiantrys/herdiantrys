"use client";

import { motion } from "framer-motion";
import { Search, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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
    const [search, setSearch] = useState("");

    const filtered = conversations.filter(c => {
        const other = c.participants.find((p: any) => p.id !== currentUserId);
        return other?.name?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="flex flex-col h-full w-full bg-[var(--site-sidebar-bg)]">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-[var(--site-sidebar-border)]">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[var(--glass-text)] tracking-tight">Conversations</h3>
                    <span className="text-[10px] text-[var(--glass-text-muted)] font-medium">
                        {conversations.length} chat{conversations.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--glass-text-muted)]/50" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search chats..."
                        className="w-full bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)] rounded-xl pl-9 pr-4 py-2 text-[13px] text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/40 focus:outline-none focus:border-[var(--site-secondary)]/40 focus:ring-1 focus:ring-[var(--site-secondary)]/15 transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--site-sidebar-border)] scrollbar-track-transparent py-1.5">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--site-sidebar-active)] border border-[var(--site-sidebar-border)] mb-3 flex items-center justify-center">
                            <MessageSquare size={22} className="text-[var(--glass-text-muted)]/40" />
                        </div>
                        <p className="text-sm font-medium text-[var(--glass-text-muted)]/60">
                            {search ? "No results found" : "No conversations yet"}
                        </p>
                    </div>
                ) : (
                    filtered.map((conv) => {
                        const other = conv.participants.find((p: any) => p.id !== currentUserId);
                        const lastMessage = conv.messages[0];
                        const isActive = conv.id === activeId;
                        const isOnline = other?.lastActiveAt && (new Date().getTime() - new Date(other.lastActiveAt).getTime()) < 5 * 60 * 1000;
                        const isUnread = lastMessage && !lastMessage.isRead && lastMessage.senderId !== currentUserId;

                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={`w-full flex items-center gap-3 px-3 py-3 mx-1.5 transition-all relative group rounded-xl
                                    ${isActive
                                        ? "bg-[var(--site-sidebar-active)] border border-[var(--site-secondary)]/15"
                                        : "border border-transparent hover:bg-[var(--site-sidebar-active)]/60"
                                    }`}
                                style={{ width: "calc(100% - 12px)" }}
                            >
                                {/* Active bar */}
                                {isActive && (
                                    <motion.div
                                        layoutId="conv-active"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-[var(--site-secondary)] rounded-full"
                                    />
                                )}

                                {/* Avatar */}
                                <div className="relative shrink-0 ml-1">
                                    <div className={`w-10 h-10 rounded-full overflow-hidden border bg-[var(--site-sidebar-active)] relative shadow-sm transition-all ${isActive ? 'border-[var(--site-secondary)]/30 ring-2 ring-[var(--site-secondary)]/15' : 'border-[var(--site-sidebar-border)]'}`}>
                                        <Image
                                            src={other?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || "U")}&background=random`}
                                            alt={other?.name || "User"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--site-sidebar-bg)] shadow-sm ${isOnline ? 'bg-[var(--site-sidebar-accent)]' : 'bg-[var(--glass-text-muted)]/30'}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <span className={`text-[13px] font-semibold truncate transition-colors
                                            ${isActive ? "text-[var(--site-secondary)]" : "text-[var(--glass-text)]"}`}>
                                            {other?.name || "Deleted User"}
                                        </span>
                                        {lastMessage && (
                                            <span className={`text-[10px] shrink-0 ml-2 font-medium ${isUnread ? 'text-[var(--site-secondary)]' : 'text-[var(--glass-text-muted)]/40'}`}>
                                                {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-xs truncate flex-1 transition-colors
                                            ${isUnread ? "text-[var(--glass-text)] font-semibold" : "text-[var(--glass-text-muted)]/60 font-normal"}`}>
                                            {lastMessage?.content || "Start a conversation..."}
                                        </p>
                                        {isUnread && (
                                            <div className="w-2 h-2 rounded-full bg-[var(--site-secondary)] shrink-0" />
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
