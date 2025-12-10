"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { ProjectCard, Project } from "@/components/ProjectCard";
import { ProjectModal } from "@/components/ProjectModal";
import { Portal } from "@/components/ui/Portal";

const WorksExplorer = ({ projects, dict }: { projects: Project[], dict: any }) => {
    const [selectedId, setSelectedId] = useState<string | number | null>(null);
    const [activeCategory, setActiveCategory] = useState(dict.portfolio.all);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [displayCount, setDisplayCount] = useState(12);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);
    const ITEMS_PER_LOAD = 12;

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
            {/* Search and Filters Bar */}
            <div className="sticky top-20 z-30 bg-black/60 backdrop-blur-xl border-y border-white/10 py-4 mb-8 transition-all">
                <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
                    {/* Search Input */}
                    <div className="relative w-full lg:max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-400 db transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder={dict.portfolio?.search_placeholder || "Search projects..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all placeholder:text-gray-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category as string}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${activeCategory === category
                                    ? "bg-teal-500/20 text-teal-300 border-teal-500/50"
                                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                {category as string}
                            </button>
                        ))}
                    </div>

                    {/* Advanced Filter Button (Mobile mainly, or for Tags) */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`p-3 rounded-full border transition-all ${isFilterOpen || activeTags.length > 0
                            ? "bg-teal-500 text-white border-teal-400"
                            : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                            }`}
                    >
                        <Filter size={20} />
                    </button>
                </div>

                {/* Expanded Filters (Tags) */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-black/40 border-t border-white/5 mt-4"
                        >
                            <div className="container mx-auto px-4 py-6">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Filter by Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${activeTags.includes(tag)
                                                ? "bg-teal-500 text-white border-teal-400"
                                                : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30"
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                    {allTags.length === 0 && (
                                        <p className="text-gray-500 italic text-sm">No tags found for current projects.</p>
                                    )}
                                </div>
                                {activeTags.length > 0 && (
                                    <button
                                        onClick={() => setActiveTags([])}
                                        className="mt-4 text-xs text-red-400 hover:text-red-300 underline"
                                    >
                                        Clear all tags
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {visibleProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => setSelectedId(project.id)}
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
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Search size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
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

                                return <ProjectModal project={project} onClose={() => setSelectedId(null)} dict={dict} />;
                            })()}
                        </div>
                    </Portal>
                )}
            </AnimatePresence>
        </section>
    );
};

export default WorksExplorer;
