"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
    Upload, Plus, Trash2, Save, Layout, User, Briefcase,
    GraduationCap, MapPin, Globe, Camera, Sparkles,
    Building2, Calendar, BookOpen, Code2, Star, Check
} from "lucide-react";
import { updateSiteContent, uploadSiteImage } from "@/lib/actions/content.actions";
import { useRouter } from "next/navigation";

const tabVariants: Variants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 0.61, 0.36, 1] } },
    exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.25 } })
};

// ─── Reusable Field Components ────────────────────────────────────────────────

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
    return (
        <div className="mb-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{children}</label>
            {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{hint}</p>}
        </div>
    );
}

function StyledInput({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType }) {
    return (
        <div className="relative group">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Icon size={16} className="text-slate-400 dark:text-slate-500 group-focus-within:text-[var(--site-accent)] transition-colors duration-200" />
                </div>
            )}
            <input
                {...props}
                className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 rounded-xl
                    bg-white/60 dark:bg-black/20 
                    border border-slate-200 dark:border-white/10
                    text-slate-800 dark:text-slate-100 
                    placeholder-slate-400 dark:placeholder-slate-600
                    focus:outline-none focus:ring-2 focus:ring-[var(--site-accent)]/30 focus:border-[var(--site-accent)]/60
                    hover:bg-white/80 dark:hover:bg-black/30
                    transition-all duration-200 text-sm font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${props.className || ""}`}
            />
        </div>
    );
}

function StyledTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className={`w-full px-4 py-3 rounded-xl
                bg-white/60 dark:bg-black/20 
                border border-slate-200 dark:border-white/10
                text-slate-800 dark:text-slate-100 
                placeholder-slate-400 dark:placeholder-slate-600
                focus:outline-none focus:ring-2 focus:ring-[var(--site-accent)]/30 focus:border-[var(--site-accent)]/60
                hover:bg-white/80 dark:hover:bg-black/30
                transition-all duration-200 text-sm font-medium resize-none custom-scrollbar
                ${props.className || ""}`}
        />
    );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] ${className}`}>
            {children}
        </div>
    );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg
                bg-[var(--site-accent)]/10 hover:bg-[var(--site-accent)]/20
                text-[var(--site-accent)] text-sm font-semibold
                border border-[var(--site-accent)]/20 hover:border-[var(--site-accent)]/40
                transition-all duration-200 hover:scale-[1.02] active:scale-95"
        >
            <Plus size={14} />
            {label}
        </button>
    );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
        >
            <Trash2 size={15} />
        </button>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContentManager({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: initialData.fullName || "",
        headline: initialData.headline || "",
        bio: initialData.bio || "",
        aboutTitle: initialData.aboutTitle || "",
        location: initialData.location || "",
        website: initialData.website || "",
        skills: initialData.skills || [],
        experience: initialData.experience || [],
        education: initialData.education || [],
        socialLinks: initialData.socialLinks || [],
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await updateSiteContent(formData);
            if (result.success) {
                setSaveSuccess(true);
                toast.success("Content saved successfully!");
                router.refresh();
                setTimeout(() => setSaveSuccess(false), 2500);
            } else {
                toast.error(result.error || "Failed to update content");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "banner") => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        const fd = new FormData();
        fd.append("image", file);
        const promise = uploadSiteImage(type, fd);
        toast.promise(promise, {
            loading: `Uploading ${type} image…`,
            success: (data) => {
                if (data.success) { router.refresh(); return "Image uploaded!"; }
                throw new Error(data.error || "Upload failed");
            },
            error: "Failed to upload image"
        });
    };

    const addItem = (field: "skills" | "experience" | "education") => {
        const templates: any = {
            skills: { name: "", proficiency: 70 },
            experience: { position: "", company: "", startDate: "", endDate: "", description: "", isCurrent: false },
            education: { degree: "", institution: "", startDate: "", endDate: "", description: "" }
        };
        setFormData(prev => ({ ...prev, [field]: [...(prev[field] as any[]), templates[field]] }));
    };

    const removeItem = (field: "skills" | "experience" | "education", index: number) => {
        setFormData(prev => ({ ...prev, [field]: (prev[field] as any[]).filter((_, i) => i !== index) }));
    };

    const updateItem = (field: "skills" | "experience" | "education", index: number, key: string, value: any) => {
        const newArray = [...(formData[field] as any[])];
        newArray[index] = { ...newArray[index], [key]: value };
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const tabs = [
        { id: "general", label: "General", icon: Layout, color: "from-violet-500 to-indigo-500" },
        { id: "about", label: "About & Bio", icon: User, color: "from-sky-500 to-cyan-500" },
        { id: "skills", label: "Skills", icon: Code2, color: "from-emerald-500 to-teal-500" },
        { id: "experience", label: "Experience", icon: Briefcase, color: "from-orange-500 to-amber-500" },
        { id: "education", label: "Education", icon: GraduationCap, color: "from-pink-500 to-rose-500" },
    ];

    const activeTabDef = tabs.find(t => t.id === activeTab);

    return (
        <div className="flex flex-col gap-6">

            {/* ── Tab Navigation ─────────────────────────────────────────── */}
            <div className="bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.07] rounded-2xl p-1.5 shadow-sm dark:shadow-none">
                <div className="flex flex-wrap gap-1">
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-250 ${isActive
                                    ? "text-white shadow-md"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabBg"
                                        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.color} opacity-90`}
                                        transition={{ type: "spring", stiffness: 380, damping: 36 }}
                                    />
                                )}
                                <span className="relative flex items-center gap-2">
                                    <tab.icon size={15} />
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <span className="relative ml-1 w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Tab Content Card ───────────────────────────────────────── */}
            <div className="bg-white/75 dark:bg-[#1A1A1A]/70 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.07] rounded-3xl shadow-xl dark:shadow-2xl overflow-hidden">

                {/* Card Header */}
                <div className={`px-8 py-5 border-b border-slate-100 dark:border-white/[0.06] bg-gradient-to-r ${activeTabDef?.color || "from-slate-500 to-slate-600"} bg-opacity-5`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${activeTabDef?.color} text-white shadow-lg`}>
                            {activeTabDef && <activeTabDef.icon size={18} />}
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-none">{activeTabDef?.label}</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                {activeTab === "general" && "Hero banner, display name, headline & links"}
                                {activeTab === "about" && "Profile photo, biography, and about section title"}
                                {activeTab === "skills" && "Technical skills with proficiency levels"}
                                {activeTab === "experience" && "Work history and professional roles"}
                                {activeTab === "education" && "Degrees, institutions, and certifications"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                    <AnimatePresence mode="wait">

                        {/* ── GENERAL TAB ─────────────────────── */}
                        {activeTab === "general" && (
                            <motion.div key="general" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">

                                {/* Banner */}
                                <div>
                                    <FieldLabel>Hero Banner Image</FieldLabel>
                                    <div className="relative h-52 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-black/20 border-2 border-dashed border-slate-300 dark:border-white/10 group hover:border-[var(--site-accent)]/50 transition-all duration-300 shadow-inner">
                                        {initialData.bannerImage ? (
                                            <img src={initialData.bannerImage} alt="Banner" onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                                                    <Camera size={22} className="text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">No banner image</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5">
                                            <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-white/15 backdrop-blur-md text-white text-sm font-semibold hover:bg-white/25 transition-colors flex items-center gap-2 border border-white/20 shadow-lg">
                                                <Upload size={15} />
                                                Upload Banner
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "banner")} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Name & Headline */}
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <FieldLabel>Display Name</FieldLabel>
                                        <StyledInput
                                            icon={User}
                                            type="text"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel hint="Used in the Hero typewriter animation">Headline / Roles</FieldLabel>
                                        <StyledInput
                                            icon={Sparkles}
                                            type="text"
                                            value={formData.headline}
                                            onChange={e => setFormData({ ...formData, headline: e.target.value })}
                                            placeholder="e.g. Creative Developer, UI Designer"
                                        />
                                    </div>
                                </div>

                                {/* Location & Website */}
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <FieldLabel>Location</FieldLabel>
                                        <StyledInput
                                            icon={MapPin}
                                            type="text"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g. Jakarta, Indonesia"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Website URL</FieldLabel>
                                        <StyledInput
                                            icon={Globe}
                                            type="text"
                                            value={formData.website}
                                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── ABOUT TAB ───────────────────────── */}
                        {activeTab === "about" && (
                            <motion.div key="about" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">

                                {/* Profile Picture */}
                                <SectionCard>
                                    <FieldLabel>Profile Picture</FieldLabel>
                                    <div className="flex items-center gap-6 mt-3">
                                        <div className="relative w-28 h-28 flex-shrink-0">
                                            <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/10 dark:to-black/20 border-2 border-slate-200 dark:border-white/10 group cursor-pointer shadow-lg">
                                                {initialData.profileImage ? (
                                                    <img src={initialData.profileImage} alt="Profile" onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User size={36} className="text-slate-300 dark:text-slate-600" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-2xl">
                                                    <label className="cursor-pointer p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                                                        <Camera size={20} />
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "profile")} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${activeTabDef?.color} text-white`}>
                                                <Camera size={14} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1">Profile Photo</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                                Used in the Hero section and About section. Recommended size: 400×400px or larger. Hover over the image to upload a new one.
                                            </p>
                                            <label className="cursor-pointer inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold border border-sky-500/20 transition-all">
                                                <Upload size={13} />
                                                Upload New Photo
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "profile")} />
                                            </label>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* About Title */}
                                <div>
                                    <FieldLabel hint="Replaces the default 'Design with Passion & Purpose' title">About Section Title</FieldLabel>
                                    <StyledInput
                                        icon={BookOpen}
                                        type="text"
                                        value={formData.aboutTitle}
                                        onChange={e => setFormData({ ...formData, aboutTitle: e.target.value })}
                                        placeholder="e.g. Design with Passion"
                                    />
                                </div>

                                {/* Bio */}
                                <div>
                                    <FieldLabel>Bio / About Me</FieldLabel>
                                    <StyledTextarea
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        rows={7}
                                        placeholder="Tell your story… share your background, passions, and what drives you."
                                    />
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 text-right">{formData.bio.length} characters</p>
                                </div>
                            </motion.div>
                        )}

                        {/* ── SKILLS TAB ──────────────────────── */}
                        {activeTab === "skills" && (
                            <motion.div key="skills" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Technical Skills</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{(formData.skills as any[]).length} skill{(formData.skills as any[]).length !== 1 ? "s" : ""} added</p>
                                    </div>
                                    <AddButton onClick={() => addItem("skills")} label="Add Skill" />
                                </div>

                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {(formData.skills as any[]).length === 0 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center mx-auto mb-3">
                                                    <Code2 size={24} className="text-emerald-500/60" />
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No skills added yet</p>
                                                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Click "Add Skill" to get started</p>
                                            </motion.div>
                                        )}
                                        {(formData.skills as any[]).map((skill, idx) => (
                                            <motion.div
                                                key={idx}
                                                custom={idx}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit={{ opacity: 0, x: -20 }}
                                                className="group p-4 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover:border-emerald-300/50 dark:hover:border-emerald-500/20 transition-all duration-200 hover:shadow-sm"
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="flex-1">
                                                        <StyledInput
                                                            type="text"
                                                            value={skill.name}
                                                            onChange={e => updateItem("skills", idx, "name", e.target.value)}
                                                            placeholder="Skill name (e.g. React, TypeScript)"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-xl px-3 py-2 border border-slate-200 dark:border-white/10 min-w-[80px]">
                                                        <Star size={12} className="text-amber-500" />
                                                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm tabular-nums w-6 text-center">{skill.proficiency}</span>
                                                        <span className="text-xs text-slate-400">%</span>
                                                    </div>
                                                    <DeleteButton onClick={() => removeItem("skills", idx)} />
                                                </div>
                                                {/* Proficiency Slider */}
                                                <div className="px-1">
                                                    <div className="relative h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-1">
                                                        <motion.div
                                                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                                            style={{ width: `${skill.proficiency}%` }}
                                                            layoutId={`skill-bar-${idx}`}
                                                        />
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0" max="100" step="1"
                                                        value={skill.proficiency}
                                                        onChange={e => updateItem("skills", idx, "proficiency", parseInt(e.target.value))}
                                                        className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-emerald-500 -mt-3"
                                                        style={{ position: "relative", zIndex: 1 }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1 px-1">
                                                    <span>Beginner</span>
                                                    <span>Expert</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {/* ── EXPERIENCE TAB ──────────────────── */}
                        {activeTab === "experience" && (
                            <motion.div key="experience" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Work Experience</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{(formData.experience as any[]).length} position{(formData.experience as any[]).length !== 1 ? "s" : ""} added</p>
                                    </div>
                                    <AddButton onClick={() => addItem("experience")} label="Add Position" />
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {(formData.experience as any[]).length === 0 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                                                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 dark:bg-orange-500/5 flex items-center justify-center mx-auto mb-3">
                                                    <Briefcase size={24} className="text-orange-500/60" />
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No experience added yet</p>
                                                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Click "Add Position" to get started</p>
                                            </motion.div>
                                        )}
                                        {(formData.experience as any[]).map((exp, idx) => (
                                            <motion.div
                                                key={idx}
                                                custom={idx}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit={{ opacity: 0, x: -20 }}
                                                className="rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover:border-orange-300/50 dark:hover:border-orange-500/20 transition-all duration-200 overflow-hidden"
                                            >
                                                {/* Entry Header */}
                                                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.05] bg-gradient-to-r from-orange-500/5 to-amber-500/5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                                                            <Building2 size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-none">{exp.position || `Position #${idx + 1}`}</p>
                                                            {exp.company && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{exp.company}</p>}
                                                        </div>
                                                    </div>
                                                    <DeleteButton onClick={() => removeItem("experience", idx)} />
                                                </div>

                                                {/* Entry Fields */}
                                                <div className="p-5 space-y-4">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <FieldLabel>Position / Title</FieldLabel>
                                                            <StyledInput
                                                                type="text"
                                                                value={exp.position}
                                                                onChange={e => updateItem("experience", idx, "position", e.target.value)}
                                                                placeholder="e.g. Senior Developer"
                                                                icon={Briefcase}
                                                            />
                                                        </div>
                                                        <div>
                                                            <FieldLabel>Company / Organization</FieldLabel>
                                                            <StyledInput
                                                                type="text"
                                                                value={exp.company}
                                                                onChange={e => updateItem("experience", idx, "company", e.target.value)}
                                                                placeholder="e.g. Acme Corp"
                                                                icon={Building2}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 items-end">
                                                        <div>
                                                            <FieldLabel>Start Date</FieldLabel>
                                                            <StyledInput
                                                                type="date"
                                                                value={exp.startDate ? exp.startDate.split("T")[0] : ""}
                                                                onChange={e => updateItem("experience", idx, "startDate", e.target.value)}
                                                                icon={Calendar}
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">End Date</label>
                                                                <label className="flex items-center gap-1.5 cursor-pointer">
                                                                    <div className={`w-8 h-4 rounded-full transition-colors ${exp.isCurrent ? "bg-[var(--site-accent)]" : "bg-slate-200 dark:bg-white/10"} relative`}>
                                                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${exp.isCurrent ? "translate-x-4" : "translate-x-0.5"}`} />
                                                                    </div>
                                                                    <input type="checkbox" className="hidden" checked={exp.isCurrent} onChange={e => updateItem("experience", idx, "isCurrent", e.target.checked)} />
                                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current</span>
                                                                </label>
                                                            </div>
                                                            <StyledInput
                                                                type="date"
                                                                value={exp.endDate ? exp.endDate.split("T")[0] : ""}
                                                                onChange={e => updateItem("experience", idx, "endDate", e.target.value)}
                                                                disabled={exp.isCurrent}
                                                                icon={Calendar}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <FieldLabel>Description</FieldLabel>
                                                        <StyledTextarea
                                                            value={exp.description}
                                                            onChange={e => updateItem("experience", idx, "description", e.target.value)}
                                                            rows={3}
                                                            placeholder="Describe your role, achievements, and responsibilities…"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {/* ── EDUCATION TAB ───────────────────── */}
                        {activeTab === "education" && (
                            <motion.div key="education" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Education</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{(formData.education as any[]).length} entr{(formData.education as any[]).length !== 1 ? "ies" : "y"} added</p>
                                    </div>
                                    <AddButton onClick={() => addItem("education")} label="Add Education" />
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {(formData.education as any[]).length === 0 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                                                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 dark:bg-pink-500/5 flex items-center justify-center mx-auto mb-3">
                                                    <GraduationCap size={24} className="text-pink-500/60" />
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No education added yet</p>
                                                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Click "Add Education" to get started</p>
                                            </motion.div>
                                        )}
                                        {(formData.education as any[]).map((edu, idx) => (
                                            <motion.div
                                                key={idx}
                                                custom={idx}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit={{ opacity: 0, x: -20 }}
                                                className="rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] hover:border-pink-300/50 dark:hover:border-pink-500/20 transition-all duration-200 overflow-hidden"
                                            >
                                                {/* Entry Header */}
                                                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.05] bg-gradient-to-r from-pink-500/5 to-rose-500/5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
                                                            <GraduationCap size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-none">{edu.degree || `Education #${idx + 1}`}</p>
                                                            {edu.institution && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{edu.institution}</p>}
                                                        </div>
                                                    </div>
                                                    <DeleteButton onClick={() => removeItem("education", idx)} />
                                                </div>

                                                {/* Entry Fields */}
                                                <div className="p-5 space-y-4">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <FieldLabel>Degree / Major</FieldLabel>
                                                            <StyledInput
                                                                type="text"
                                                                value={edu.degree}
                                                                onChange={e => updateItem("education", idx, "degree", e.target.value)}
                                                                placeholder="e.g. Bachelor of Computer Science"
                                                                icon={GraduationCap}
                                                            />
                                                        </div>
                                                        <div>
                                                            <FieldLabel>Institution / School</FieldLabel>
                                                            <StyledInput
                                                                type="text"
                                                                value={edu.institution}
                                                                onChange={e => updateItem("education", idx, "institution", e.target.value)}
                                                                placeholder="e.g. University of Indonesia"
                                                                icon={BookOpen}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <FieldLabel>Start Date</FieldLabel>
                                                            <StyledInput
                                                                type="date"
                                                                value={edu.startDate ? edu.startDate.split("T")[0] : ""}
                                                                onChange={e => updateItem("education", idx, "startDate", e.target.value)}
                                                                icon={Calendar}
                                                            />
                                                        </div>
                                                        <div>
                                                            <FieldLabel>End Date</FieldLabel>
                                                            <StyledInput
                                                                type="date"
                                                                value={edu.endDate ? edu.endDate.split("T")[0] : ""}
                                                                onChange={e => updateItem("education", idx, "endDate", e.target.value)}
                                                                icon={Calendar}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <FieldLabel>Description / Notes</FieldLabel>
                                                        <StyledTextarea
                                                            value={edu.description}
                                                            onChange={e => updateItem("education", idx, "description", e.target.value)}
                                                            rows={3}
                                                            placeholder="Optional: courses, GPA, honors, thesis topic…"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* ── Sticky Save Footer ─────────────────────────────────── */}
                <div className="px-8 py-5 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02] flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
                        Changes are saved to the database — refresh the page to see them live.
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm 
                            shadow-lg transition-all duration-300 overflow-hidden 
                            disabled:opacity-60 disabled:cursor-not-allowed
                            hover:scale-[1.03] hover:shadow-xl active:scale-95
                            ${saveSuccess
                                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                                : "bg-[var(--site-button)] text-[var(--site-button-text)] shadow-[var(--site-accent)]/30"
                            }`}
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                    Saving…
                                </motion.div>
                            ) : saveSuccess ? (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                    <Check size={16} />
                                    Saved!
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                    <Save size={16} />
                                    Save Changes
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>
        </div>
    );
}
