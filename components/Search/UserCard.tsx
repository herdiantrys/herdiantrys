"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { User, Shield, CheckCircle } from "lucide-react";

interface UserCardProps {
    user: any;
}

export default function UserCard({ user }: UserCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-2xl glass-panel p-4 border border-white/10 hover:border-site-secondary/30 transition-all duration-300"
        >
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-site-secondary/50 transition-all">
                        {user.image || user.imageURL ? (
                            <img
                                src={user.image || user.imageURL}
                                alt={user.name || user.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                <User className="w-6 h-6 text-zinc-400" />
                            </div>
                        )}
                    </div>
                    {/* Online/Status Indicator (Optional) */}
                    {user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? (
                        <div className="absolute -bottom-1 -right-1 bg-site-secondary rounded-full p-1 border-2 border-black">
                            <Shield size={10} className="text-white fill-current" />
                        </div>
                    ) : null}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <Link href={`/user/${user.username}`} className="block focus:outline-none">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-white group-hover:text-site-secondary transition-colors truncate">
                                {user.name || "User"}
                            </h3>
                            {user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? (
                                <Shield size={14} className="text-site-secondary" />
                            ) : null}
                        </div>
                        <p className="text-sm text-zinc-400 truncate">@{user.username}</p>
                    </Link>
                    {user.headline && (
                        <p className="text-xs text-zinc-500 mt-1 truncate max-w-[200px]">
                            {user.headline}
                        </p>
                    )}
                </div>

                {/* Action (Follow/View) */}
                <Link
                    href={`/profile/${user.username}`}
                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-site-secondary/20 text-sm font-medium text-zinc-300 hover:text-site-secondary transition-colors"
                >
                    View
                </Link>
            </div>

            {/* Hover Effect Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 pointer-events-none" />
        </motion.div>
    );
}
