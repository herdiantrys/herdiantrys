"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Plus, Trash2, Save, Layout, User, Briefcase, GraduationCap, GripVertical } from "lucide-react";
import { updateSiteContent, uploadSiteImage } from "@/lib/actions/content.actions";
import { useRouter } from "next/navigation";

export default function ContentManager({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

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
                toast.success("Content updated successfully");
                router.refresh();
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
        const formData = new FormData();
        formData.append("image", file);

        const promise = uploadSiteImage(type, formData);

        toast.promise(promise, {
            loading: "Uploading image...",
            success: (data) => {
                if (data.success) {
                    router.refresh();
                    return "Image uploaded successfully";
                } else {
                    throw new Error(data.error || "Upload failed");
                }
            },
            error: "Failed to upload image"
        });
    };

    // Generic JSON Array Managers
    const addItem = (field: "skills" | "experience" | "education") => {
        const templates: any = {
            skills: { name: "", proficiency: 50 },
            experience: { position: "", company: "", startDate: "", endDate: "", description: "", isCurrent: false },
            education: { degree: "", institution: "", startDate: "", endDate: "", description: "" }
        };
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] as any[]), templates[field]]
        }));
    };

    const removeItem = (field: "skills" | "experience" | "education", index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] as any[]).filter((_, i) => i !== index)
        }));
    };

    const updateItem = (field: "skills" | "experience" | "education", index: number, key: string, value: any) => {
        const newArray = [...(formData[field] as any[])];
        newArray[index] = { ...newArray[index], [key]: value };
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const tabs = [
        { id: "general", label: "General & Hero", icon: Layout },
        { id: "about", label: "About Info", icon: User },
        { id: "skills", label: "Skills", icon: Briefcase }, // Reusing icon
        { id: "experience", label: "Experience", icon: GripVertical },
        { id: "education", label: "Education", icon: GraduationCap },
    ];

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                            ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                            : "bg-[var(--glass-border)] text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] hover:bg-[var(--glass-border)]/80"
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="glass p-8 rounded-3xl border-[var(--glass-border)]">
                {/* General Tab */}
                {activeTab === "general" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        {/* Banner Image */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-3">Hero Banner Image</label>
                            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-white/5 border-2 border-dashed border-white/10 group hover:border-teal-500/50 transition-colors">
                                {initialData.bannerImage ? (
                                    <Image src={initialData.bannerImage} alt="Banner" fill className="object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">No Banner Image</div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                                        <Upload size={16} />
                                        Upload Banner
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "banner")} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500 focus:outline-none text-[var(--glass-text)] transition-colors"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Headline / Roles</label>
                                <input
                                    type="text"
                                    value={formData.headline}
                                    onChange={e => setFormData({ ...formData, headline: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500 focus:outline-none text-[var(--glass-text)] transition-colors"
                                    placeholder="e.g. Creative Developer"
                                />
                                <p className="text-sm text-gray-400">Manage your &quot;About&quot; section content</p>
                                <p className="text-xs text-gray-500 mt-1">Single string for now (will be used in Hero typer).</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500 focus:outline-none text-[var(--glass-text)] transition-colors"
                                    placeholder="e.g. Jakarta, Indonesia"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Website URL</label>
                                <input
                                    type="text"
                                    value={formData.website}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500 focus:outline-none text-[var(--glass-text)] transition-colors"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* About Tab */}
                {activeTab === "about" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-3">Profile Picture</label>
                            <div className="flex items-center gap-6">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 group">
                                    {initialData.profileImage ? (
                                        <Image src={initialData.profileImage} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors">
                                            <Upload size={20} />
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "profile")} />
                                        </label>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-[var(--glass-text-muted)] mb-2">This image will be used in the Hero section and About section unless separate images are provided.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">About Section Title</label>
                            <input
                                type="text"
                                value={formData.aboutTitle}
                                onChange={e => setFormData({ ...formData, aboutTitle: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500 focus:outline-none text-[var(--glass-text)] transition-colors"
                                placeholder="e.g. Design with Passion"
                            />
                            <p className="text-xs text-gray-500 mt-1">Replaces the default "Design with Passion & Purpose" title.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Bio / About Me</label>
                            <textarea
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                rows={6}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500 focus:outline-none text-[var(--glass-text)] transition-colors custom-scrollbar"
                                placeholder="Tell your story..."
                            />
                        </div>
                    </motion.div>
                )}

                {/* Skills Tab */}
                {activeTab === "skills" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-[var(--glass-text)]">Skills</h3>
                            <button onClick={() => addItem('skills')} className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 text-sm font-medium hover:bg-teal-500/20 transition-colors flex items-center gap-1">
                                <Plus size={14} /> Add Skill
                            </button>
                        </div>
                        <div className="space-y-4">
                            {(formData.skills as any[]).map((skill, idx) => (
                                <div key={idx} className="flex gap-4 items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                    <input
                                        type="text"
                                        value={skill.name}
                                        onChange={e => updateItem('skills', idx, 'name', e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-teal-500 outline-none text-white text-sm"
                                        placeholder="Skill Name"
                                    />
                                    <div className="w-32 flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={skill.proficiency}
                                            onChange={e => updateItem('skills', idx, 'proficiency', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-teal-500 outline-none text-white text-sm"
                                            min="0" max="100"
                                        />
                                        <span className="text-xs text-gray-500">%</span>
                                    </div>
                                    <button onClick={() => removeItem('skills', idx)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Experience Tab */}
                {activeTab === "experience" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-[var(--glass-text)]">Experience</h3>
                            <button onClick={() => addItem('experience')} className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 text-sm font-medium hover:bg-teal-500/20 transition-colors flex items-center gap-1">
                                <Plus size={14} /> Add Job
                            </button>
                        </div>
                        <div className="space-y-6">
                            {(formData.experience as any[]).map((exp, idx) => (
                                <div key={idx} className="p-6 rounded-xl bg-white/5 border border-white/5 space-y-4">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-white">Position #{idx + 1}</h4>
                                        <button onClick={() => removeItem('experience', idx)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={exp.position}
                                            onChange={e => updateItem('experience', idx, 'position', e.target.value)}
                                            className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-teal-500 outline-none text-white text-sm"
                                            placeholder="Position / Title"
                                        />
                                        <input
                                            type="text"
                                            value={exp.company}
                                            onChange={e => updateItem('experience', idx, 'company', e.target.value)}
                                            className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-teal-500 outline-none text-white text-sm"
                                            placeholder="Company Name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="date"
                                            value={exp.startDate ? exp.startDate.split('T')[0] : ""}
                                            onChange={e => updateItem('experience', idx, 'startDate', e.target.value)}
                                            className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-teal-500 outline-none text-white text-sm"
                                        />
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                value={exp.endDate ? exp.endDate.split('T')[0] : ""}
                                                onChange={e => updateItem('experience', idx, 'endDate', e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-teal-500 outline-none text-white text-sm"
                                                disabled={exp.isCurrent}
                                            />
                                            <label className="flex items-center gap-2 text-xs text-gray-400">
                                                <input
                                                    type="checkbox"
                                                    checked={exp.isCurrent}
                                                    onChange={e => updateItem('experience', idx, 'isCurrent', e.target.checked)}
                                                />
                                                Current
                                            </label>
                                        </div>
                                    </div>
                                    <textarea
                                        value={exp.description}
                                        onChange={e => updateItem('experience', idx, 'description', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-teal-500 outline-none text-white text-sm"
                                        placeholder="Job Description"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Education Tab */}
                {activeTab === "education" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-[var(--glass-text)]">Education</h3>
                            <button onClick={() => addItem('education')} className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 text-sm font-medium hover:bg-teal-500/20 transition-colors flex items-center gap-1">
                                <Plus size={14} /> Add Education
                            </button>
                        </div>
                        <div className="space-y-6">
                            {(formData.education as any[]).map((edu, idx) => (
                                <div key={idx} className="p-6 rounded-xl bg-white/5 border border-white/5 space-y-4">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-white">Education #{idx + 1}</h4>
                                        <button onClick={() => removeItem('education', idx)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={e => updateItem('education', idx, 'degree', e.target.value)}
                                            className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-teal-500 outline-none text-white text-sm"
                                            placeholder="Degree / Major"
                                        />
                                        <input
                                            type="text"
                                            value={edu.institution}
                                            onChange={e => updateItem('education', idx, 'institution', e.target.value)}
                                            className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-teal-500 outline-none text-white text-sm"
                                            placeholder="Institution / School"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="date"
                                            value={edu.startDate ? edu.startDate.split('T')[0] : ""}
                                            onChange={e => updateItem('education', idx, 'startDate', e.target.value)}
                                            className="px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-teal-500 outline-none text-white text-sm"
                                        />
                                        <input
                                            type="date"
                                            value={edu.endDate ? edu.endDate.split('T')[0] : ""}
                                            onChange={e => updateItem('education', idx, 'endDate', e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-teal-500 outline-none text-white text-sm"
                                        />
                                    </div>
                                    <textarea
                                        value={edu.description}
                                        onChange={e => updateItem('education', idx, 'description', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 focus:border-teal-500 outline-none text-white text-sm"
                                        placeholder="Description (Optional)"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Save Button */}
                <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} />
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
