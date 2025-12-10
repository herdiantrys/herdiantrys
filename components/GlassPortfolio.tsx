"use client";

import { useState, useRef, useEffect, useOptimistic, startTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProjectCard, Project } from "@/components/ProjectCard";
import { ProjectModal } from "@/components/ProjectModal";
import { Portal } from "@/components/ui/Portal";

const GlassPortfolio = ({ projects, dict }: { projects: Project[], dict: any }) => {
    const [selectedId, setSelectedId] = useState<string | number | null>(null);
    const [activeCategory, setActiveCategory] = useState(dict.portfolio.all);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // Derive unique categories from projects
    const categories = [dict.portfolio.all, ...Array.from(new Set(projects.map((p) => p.category)))];

    const filteredProjects = activeCategory === dict.portfolio.all
        ? projects
        : projects.filter(project => project.category === activeCategory);

    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory]);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedId !== null) {
                setSelectedId(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedId]);

    return (
        <section className="py-20 relative z-10">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[var(--glass-text)]">{dict.portfolio.title}</h2>
                    <p className="text-[var(--glass-text-muted)] max-w-2xl mx-auto mb-8">
                        {dict.portfolio.description}
                    </p>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {categories.map((category) => (
                            <button
                                key={category as string}
                                onClick={() => setActiveCategory(category)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${activeCategory === category
                                    ? "bg-[var(--glass-text)] text-[var(--background)] border-[var(--glass-text)] shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                    : "glass text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] border-[var(--glass-border)] hover:border-[var(--glass-text)]"
                                    }`}
                            >
                                {category as string}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    layout
                    className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {paginatedProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => setSelectedId(project.id)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-16 flex justify-center items-center gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-3 rounded-full glass hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${currentPage === page
                                        ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg"
                                        : "glass text-gray-400 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-3 rounded-full glass hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}

                <AnimatePresence>
                    {selectedId && (
                        <Portal>
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedId(null)}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                />

                                {(() => {
                                    const project = projects.find((p) => p.id === selectedId);
                                    if (!project) return null;

                                    return <ProjectModal project={project} onClose={() => setSelectedId(null)} dict={dict} />;
                                })()}
                            </div>
                        </Portal>
                    )}
                </AnimatePresence>
            </div>
        </section >
    );
};

export default GlassPortfolio;
