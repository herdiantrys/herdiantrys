"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { ProjectCard, Project } from "@/components/ProjectCard";
import { ProjectModal } from "@/components/ProjectModal";
import { Portal } from "@/components/ui/Portal";



const WorksExplorer = ({ projects, dict, initialBookmarkedIds = [] }: { projects: Project[], dict: any, initialBookmarkedIds?: string[] }) => {
    const searchParams = useSearchParams();
    const [selectedId, setSelectedId] = useState<string | number | null>(null);
    const [activeCategory, setActiveCategory] = useState(dict.portfolio.all);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [displayCount, setDisplayCount] = useState(12);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);
    const ITEMS_PER_LOAD = 12;

    // Sync URL search to state
    useEffect(() => {
        const query = searchParams.get("search");
        if (query !== null) {
            setSearchQuery(query);
            setActiveCategory(dict.portfolio.all);
        }
    }, [searchParams, dict.portfolio.all]);

    // Derive unique categories and tags
    const categories = [dict.portfolio.all, ...Array.from(new Set(projects.map((p) => p.category)))];
    const allTags = Array.from(new Set(projects.flatMap((p) => p.tags || [])));

    // Filtering Logic
    const filteredProjects = projects.filter(project => {
        // Filter by Category
        const matchCategory = activeCategory === dict.portfolio.all || project.category === activeCategory;

        // Filter by Search Query (Title or Description)
        const query = searchQuery.toLowerCase();
        const matchSearch = project.title.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query) ||
            (project.album && project.album.toLowerCase().includes(query));

        // Filter by Tags (if any tags are selected, project must match at least one)
        // You can change 'some' to 'every' for strict matching
        const matchTags = activeTags.length === 0 ||
            (project.tags && project.tags.some(tag => activeTags.includes(tag)));

        return matchCategory && matchSearch && matchTags;
    });

    const visibleProjects = filteredProjects.slice(0, displayCount);
    const hasMore = displayCount < filteredProjects.length;

    // Reset pagination when filters change
    useEffect(() => {
        setDisplayCount(ITEMS_PER_LOAD);
    }, [activeCategory, searchQuery, activeTags]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setDisplayCount((prev) => prev + ITEMS_PER_LOAD);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore]);

    // Handle Tag Selection
    const toggleTag = (tag: string) => {
        setActiveTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (selectedId !== null) setSelectedId(null);
                else if (isFilterOpen) setIsFilterOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedId, isFilterOpen]);

    return (
        <section className="relative z-10 w-full">
            {/* Floating Search and Filters Dock */}
            <div className="sticky top-24 z-[45] container mx-auto px-4 mb-10">
                <div className="bg-white/80 dark:bg-black/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl p-2 md:p-3 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">

                        {/* Search Input */}
                        <div className="relative w-full lg:max-w-xs group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder={dict.portfolio?.search_placeholder || "Search..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-teal-500/30 rounded-full py-2.5 pl-11 pr-8 text-sm text-gray-800 dark:text-white focus:outline-none focus:bg-white/50 dark:focus:bg-white/10 transition-all placeholder:text-gray-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Filter Toggles (Horizontal Scroll) */}
                        <div className="flex-1 w-full overflow-hidden">
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mask-fade-sides items-center">
                                {categories.map((category) => (
                                    <button
                                        key={category as string}
                                        onClick={() => setActiveCategory(category)}
                                        className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap border ${activeCategory === category
                                            ? "bg-teal-500 text-white border-teal-400 shadow-lg shadow-teal-500/20"
                                            : "bg-transparent text-gray-600 dark:text-gray-400 border-transparent hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                    >
                                        {category as string}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions Right */}
                        <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 border-white/10 pt-2 lg:pt-0">
                            {/* Clear Filters (Conditional) */}
                            {(activeCategory !== dict.portfolio.all || searchQuery || activeTags.length > 0) && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setActiveCategory(dict.portfolio.all);
                                        setActiveTags([]);
                                    }}
                                    className="px-3 py-2 rounded-full text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors whitespace-nowrap"
                                >
                                    Clear
                                </button>
                            )}

                            {/* Tags Filter Toggle */}
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`p-2.5 rounded-xl border transition-all ${isFilterOpen || activeTags.length > 0
                                    ? "bg-teal-500 text-white border-teal-400 shadow-md"
                                    : "bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-transparent hover:bg-black/10 dark:hover:bg-white/10"
                                    }`}
                                title="Filter by Tags"
                            >
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Expanded Filters (Tags) Drawer */}
                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden border-t border-black/5 dark:border-white/5"
                            >
                                <div className="pt-2 pb-1">
                                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                        {allTags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-wider font-bold transition-all border ${activeTags.includes(tag)
                                                    ? "bg-teal-500 text-white border-teal-400"
                                                    : "bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-transparent hover:border-teal-500/30 hover:text-teal-500"
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="container mx-auto px-4 min-h-[50vh]">
                {/* Results Count */}
                <div className="mb-6 text-gray-400 text-sm">
                    Showing {visibleProjects.length} of {filteredProjects.length} results
                    {searchQuery && ` for "${searchQuery}"`}
                    {activeCategory !== dict.portfolio.all && ` in ${activeCategory}`}
                </div>

                {/* Grid */}
                <motion.div
                    layout
                    className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {visibleProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => setSelectedId(project.id)}
                                initialIsBookmarked={initialBookmarkedIds.includes(String(project.id))}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Loading Trigger / Sentinel */}
                <div ref={observerTarget} className="h-20 flex items-center justify-center w-full mt-8">
                    {hasMore && (
                        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                    )}
                </div>

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Search size={32} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No projects found</h3>
                        <p className="text-gray-400 max-w-md">
                            We couldn't find any projects matching your search or filters. Try adjusting your criteria.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setActiveCategory(dict.portfolio.all);
                                setActiveTags([]);
                            }}
                            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Modal Portal */}
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

                                return <ProjectModal
                                    project={project}
                                    onClose={() => setSelectedId(null)}
                                    dict={dict}
                                    initialIsBookmarked={initialBookmarkedIds.includes(String(project.id))}
                                />;
                            })()}
                        </div>
                    </Portal>
                )}
            </AnimatePresence>
        </section>
    );
};

export default WorksExplorer;
