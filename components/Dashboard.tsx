"use client";

import { motion } from "framer-motion";
import { Users, FileImage, Eye, Clock, Heart, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DashboardProps {
    stats: {
        totalProjects: number;
        totalUsers: number;
        totalViews: number;
    };
    recentProjects: any[];
    recentUsers: any[];
    recentUpdates: any[];
    popularProjects: any[];
    dict: any;
}

export default function Dashboard({ stats, recentProjects, recentUsers, recentUpdates, popularProjects, dict }: DashboardProps) {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    className="glass p-6 rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)]/50"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500">
                            <FileImage size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--glass-text-muted)]">{dict.dashboard.total_projects}</p>
                            <h3 className="text-2xl font-bold text-[var(--glass-text)]">{stats.totalProjects}</h3>
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-6 rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)]/50"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--glass-text-muted)]">{dict.dashboard.total_users}</p>
                            <h3 className="text-2xl font-bold text-[var(--glass-text)]">{stats.totalUsers}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass p-6 rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)]/50"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                            <Eye size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--glass-text-muted)]">{dict.dashboard.total_views}</p>
                            <h3 className="text-2xl font-bold text-[var(--glass-text)]">{stats.totalViews}</h3>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Projects */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass p-6 rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)]/50"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Clock size={20} className="text-teal-500" />
                        <h3 className="text-lg font-bold text-[var(--glass-text)]">{dict.dashboard.recent_projects}</h3>
                    </div>
                    <div className="space-y-4">
                        {recentProjects.map((project) => (
                            <div key={project._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--glass-border)] transition-colors">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                                    {project.imageUrl && (
                                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--glass-text)] truncate">{project.title}</p>
                                    <p className="text-xs text-[var(--glass-text-muted)]">{project.category?.title}</p>
                                </div>
                                <span className="text-xs text-[var(--glass-text-muted)]">
                                    {formatDate(project._createdAt)}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Users */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass p-6 rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)]/50"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Users size={20} className="text-cyan-500" />
                        <h3 className="text-lg font-bold text-[var(--glass-text)]">{dict.dashboard.new_users}</h3>
                    </div>
                    <div className="space-y-4">
                        {recentUsers.map((user) => (
                            <div key={user._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--glass-border)] transition-colors">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold">
                                            {user.name?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--glass-text)] truncate">{user.name}</p>
                                    <p className="text-xs text-[var(--glass-text-muted)] truncate">{user.email}</p>
                                </div>
                                <span className="text-xs text-[var(--glass-text-muted)]">
                                    {formatDate(user._createdAt)}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Popular Projects */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass p-6 rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)]/50"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Heart size={20} className="text-red-500" />
                        <h3 className="text-lg font-bold text-[var(--glass-text)]">{dict.dashboard.popular_projects}</h3>
                    </div>
                    <div className="space-y-4">
                        {popularProjects.map((project) => (
                            <div key={project._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--glass-border)] transition-colors">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                                    {project.imageUrl && (
                                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--glass-text)] truncate">{project.title}</p>
                                </div>
                                <div className="flex items-center gap-1 text-red-400">
                                    <Heart size={14} fill="currentColor" />
                                    <span className="text-xs font-bold">{project.likesCount || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Updates */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass p-6 rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)]/50"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Activity size={20} className="text-yellow-500" />
                        <h3 className="text-lg font-bold text-[var(--glass-text)]">{dict.dashboard.recent_updates}</h3>
                    </div>
                    <div className="space-y-4">
                        {recentUpdates.map((project) => (
                            <div key={project._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--glass-border)] transition-colors">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                                    {project.imageUrl && (
                                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--glass-text)] truncate">{project.title}</p>
                                    <p className="text-xs text-[var(--glass-text-muted)]">{dict.dashboard.updated}</p>
                                </div>
                                <span className="text-xs text-[var(--glass-text-muted)]">
                                    {formatDate(project._updatedAt)}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
