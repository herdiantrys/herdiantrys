"use client";

import { useState, useRef, useEffect, useOptimistic, startTransition, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { ProjectCard, Project } from "@/components/ProjectCard";
import { ProjectModal } from "@/components/ProjectModal";
import { Portal } from "@/components/ui/Portal";
import { SectionTitle } from "@/components/ui/SectionTitle";

const GlassPortfolio = ({ projects, dict }: { projects: Project[], dict: any }) => {
    const [selectedId, setSelectedId] = useState<string | number | null>(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // Derive unique categories from projects, excluding "all" to avoid duplicates
    const categories = useMemo(() => {
        return ["all", ...Array.from(new Set(projects.map((p) => p.category))).filter(c => c !== "all")];
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return activeCategory === "all"
            ? projects
            : projects.filter(project => project.category === activeCategory);
    }, [projects, activeCategory]);

    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

    // Robust pagination: ensure current page is always within bounds
    // We use effectivePage for rendering to avoid empty results during transitions
    const effectivePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

    const paginatedProjects = filteredProjects.slice(
        (effectivePage - 1) * ITEMS_PER_PAGE,
        effectivePage * ITEMS_PER_PAGE
    );



    // Ensure activeCategory stays valid if projects change
    useEffect(() => {
        if (activeCategory !== "all" && !projects.some(p => p.category === activeCategory)) {
            // Defer the update to avoid set-state-in-effect warning if possible, but here just ensure it's needed
            setActiveCategory("all");
        }
    }, [projects, activeCategory]);

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
        <section className="relative z-10 py-16 sm:py-20">
            <div className="container mx-auto px-4">
                <SectionTitle
                    title={dict.portfolio.title}
                    subtitle={dict.portfolio.description}
                    alignment="center"
                    className="mb-14 sm:mb-20"
                />

                {/* Filter Buttons */}
                <div className="scrollbar-hide mb-10 flex flex-nowrap justify-start gap-3 overflow-x-auto pb-2 sm:mb-12 sm:flex-wrap sm:justify-center sm:gap-4 sm:overflow-visible sm:pb-0">
                    {categories.map((category) => (
                        <button
                            key={category as string}
                            onClick={() => {
                                setActiveCategory(category);
                                setCurrentPage(1);
                            }}
                            className={`shrink-0 rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-300 sm:px-6 ${activeCategory === category
                                ? "bg-[var(--site-button)] text-[var(--site-button-text)] border-[var(--site-button)] shadow-[0_4px_20px_rgba(20,184,166,0.3)] scale-105"
                                : "glass text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] border-[var(--glass-border)] hover:border-[var(--glass-text)] bg-[var(--glass-bg)]/50 shadow-sm hover:shadow-md"
                                }`}
                        >
                            {category === "all" ? dict.portfolio.all : category as string}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${activeCategory}-${effectivePage}`}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-10%" }}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: {
                                    duration: 0.3,
                                    staggerChildren: 0.1
                                }
                            },
                        }}
                        exit={{ opacity: 0, y: -20 }}
                        className="columns-1 gap-4 space-y-4 sm:columns-2 sm:gap-6 sm:space-y-6 lg:columns-3 xl:columns-4"
                    >
                        {paginatedProjects.length > 0 ? (
                            paginatedProjects.map((project) => (
                                <motion.div
                                    key={project.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 30, scale: 0.98, filter: "blur(8px)" },
                                        visible: {
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                            filter: "blur(0px)",
                                            transition: { type: "spring", bounce: 0.2, duration: 1.2 }
                                        }
                                    }}
                                    className="break-inside-avoid mb-6"
                                >
                                    <ProjectCard
                                        project={project}
                                        onClick={() => setSelectedId(project.id)}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-[var(--glass-text-muted)] italic">
                                {dict.portfolio.no_projects || "No projects found."}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Pagination Controls */}
                {
                    totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-3 sm:mt-16 sm:gap-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-3 rounded-full glass hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[var(--glass-text)] border-[var(--glass-border)] shadow-sm"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <div className="scrollbar-hide flex max-w-[calc(100vw-8rem)] gap-2 overflow-x-auto px-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold transition-all ${effectivePage === page
                                            ? "bg-[var(--site-secondary)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-secondary)]/30 scale-110"
                                            : "glass text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] hover:bg-white/20 border-[var(--glass-border)]"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-3 rounded-full glass hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[var(--glass-text)] border-[var(--glass-border)] shadow-sm"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )
                }

                {/* View All Projects Button */}
                <div className="mt-12 flex justify-center sm:mt-16">
                    <Link
                        href="/projects"
                        className="group flex w-full items-center justify-center gap-2 rounded-full bg-[var(--site-accent)] px-8 py-4 font-bold text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--site-accent)]/50 sm:w-auto"
                    >
                        {dict.portfolio?.view_all || "View All Projects"}
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

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
            </div >
        </section >
    );
};

export default GlassPortfolio;
