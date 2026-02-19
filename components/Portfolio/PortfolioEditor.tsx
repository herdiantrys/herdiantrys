"use client";

import { useState } from "react";
import { updatePortfolioConfig, uploadPortfolioHeroImage, uploadPortfolioLogo } from "@/lib/actions/portfolio.actions";
import { Loader2, LayoutTemplate, Image as ImageIcon, Type, Briefcase, MessageSquare, Quote, Save, Eye, Palette, UserCircle, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PortfolioPreview from "./PortfolioPreview";
import ProjectManager from "./ProjectManager";

interface PortfolioEditorProps {
    userId: string;
    username: string;
    initialConfig: any;
    user: any;
    projects: any[];
}

const TABS = [
    { id: "branding", label: "Branding", icon: UserCircle },
    { id: "style", label: "Style", icon: Palette },
    { id: "hero", label: "Hero", icon: LayoutTemplate },
    { id: "about", label: "About", icon: Type },
    { id: "works", label: "Works", icon: Briefcase },
    { id: "testimony", label: "Testimony", icon: Quote },
    { id: "contact", label: "Contact", icon: MessageSquare },
];

export default function PortfolioEditor({ userId, username, initialConfig, user, projects }: PortfolioEditorProps) {
    const [config, setConfig] = useState(initialConfig || {
        showHero: true,
        showAbout: true,
        showWorks: true,
        showTestimony: true,
        showContact: true,
        showResume: true,
        layoutType: "minimal",
        // Defaults for new fields
        fontFamily: "sans",
        heroAlign: "center",
        gridCols: 3,
        borderRadius: "xl",
        glassIntensity: "medium",
        animationStyle: "dynamic",
        bgPattern: "mesh"
    });
    const [activeTab, setActiveTab] = useState("hero");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await updatePortfolioConfig(userId, config);
            if (res.success) {
                router.refresh();
            } else {
                alert("Failed to save: " + res.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error saving configuration");
        }
        setIsSaving(false);
    };

    const handleInputChange = (field: string, value: any) => {
        setConfig((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (!e.target.files?.[0]) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", e.target.files[0]);

        try {
            // Currently only have action for Hero image, might need generic or specific ones
            if (field === "heroImage") {
                const res = await uploadPortfolioHeroImage(userId, formData);
                if (res.success) {
                    handleInputChange("heroImage", res.imageUrl);
                    router.refresh();
                }
            } else if (field === "logo") {
                const res = await uploadPortfolioLogo(userId, formData);
                if (res.success) {
                    handleInputChange("logo", res.imageUrl);
                    router.refresh();
                }
            }
            // Implement others as needed or make generic upload action
        } catch (e) {
            console.error(e);
        }
        setIsUploading(false);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-140px)]">
            {/* Editor Panel */}
            <div className="w-full lg:w-[45%] lg:overflow-y-auto pr-1 custom-scrollbar pb-20 lg:pb-0">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex flex-wrap gap-2">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === tab.id
                                    ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                                    : "text-[var(--glass-text-muted)] hover:bg-white/5 hover:text-[var(--glass-text)]"
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}

                        <div className="ml-auto flex gap-2">
                            <a
                                href={`/profile/${username}/portfolio`}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-[var(--glass-text)] hover:bg-white/10 transition-colors"
                            >
                                <Eye size={16} />
                                <span className="hidden sm:inline">Preview</span>
                            </a>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* BRANDING TAB */}
                        {activeTab === "branding" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <h3 className="font-bold text-[var(--glass-text)]">Publicly Visible</h3>
                                        <p className="text-sm text-[var(--glass-text-muted)]">Make your portfolio accessible via your public URL</p>
                                    </div>
                                    <button
                                        onClick={() => handleInputChange("isEnabled", !config.isEnabled)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${config.isEnabled ? "bg-teal-500" : "bg-white/10"}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.isEnabled ? "left-7" : "left-1"}`} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={config.displayName || ""}
                                            onChange={(e) => handleInputChange("displayName", e.target.value)}
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                            placeholder={username}
                                        />
                                        <p className="text-xs text-[var(--glass-text-muted)] mt-1">Leave empty to use your default username.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Logo</label>
                                        <div className="flex items-start gap-4">
                                            {config.logo && (
                                                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                                                    <Image src={config.logo} alt="Logo" width={80} height={80} className="object-contain" />
                                                </div>
                                            )}
                                            <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl hover:bg-white/5 text-[var(--glass-text)] transition-colors">
                                                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                                                <span>Upload Logo</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "logo")} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STYLE TAB */}
                        {activeTab === "style" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Primary Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={config.primaryColor || "#0f172a"}
                                                onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                                                className="w-12 h-12 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.primaryColor || ""}
                                                onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                                                className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-[var(--glass-text)] w-32"
                                                placeholder="#0f172a"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Secondary Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={config.secondaryColor || "#1e293b"}
                                                onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                                                className="w-12 h-12 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.secondaryColor || ""}
                                                onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                                                className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-[var(--glass-text)] w-32"
                                                placeholder="#1e293b"
                                            />
                                        </div>
                                        <p className="text-xs text-[var(--glass-text-muted)] mt-1">Colors will be automatically generated based on the primary color.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Accent Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={config.accentColor || "#14b8a6"}
                                                onChange={(e) => handleInputChange("accentColor", e.target.value)}
                                                className="w-12 h-12 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.accentColor || ""}
                                                onChange={(e) => handleInputChange("accentColor", e.target.value)}
                                                className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-[var(--glass-text)] w-32"
                                                placeholder="#14b8a6"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Text Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={config.textColor || "#ffffff"}
                                                onChange={(e) => handleInputChange("textColor", e.target.value)}
                                                className="w-12 h-12 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.textColor || ""}
                                                onChange={(e) => handleInputChange("textColor", e.target.value)}
                                                className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-[var(--glass-text)] w-32"
                                                placeholder="#ffffff"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* HERO TAB */}
                        {activeTab === "hero" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <h3 className="font-bold text-[var(--glass-text)]">Enable Hero Section</h3>
                                        <p className="text-sm text-[var(--glass-text-muted)]">Show the main introduction banner</p>
                                    </div>
                                    <button
                                        onClick={() => handleInputChange("showHero", !config.showHero)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${config.showHero ? "bg-teal-500" : "bg-white/10"}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.showHero ? "left-7" : "left-1"}`} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Greeting / Title</label>
                                        <input
                                            type="text"
                                            value={config.heroTitle || ""}
                                            onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                            placeholder="Hi, I'm John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Short Description</label>
                                        <textarea
                                            value={config.heroDescription || ""}
                                            onChange={(e) => handleInputChange("heroDescription", e.target.value)}
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none h-24 resize-none"
                                            placeholder="Creative Designer & Developer based in..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Hero Image</label>
                                        <div className="flex items-start gap-4">
                                            {config.heroImage && (
                                                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10">
                                                    <Image src={config.heroImage} alt="Hero" fill className="object-cover" />
                                                </div>
                                            )}
                                            <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl hover:bg-white/5 text-[var(--glass-text)] transition-colors">
                                                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                                                <span>Upload Image</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "heroImage")} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ABOUT TAB */}
                        {activeTab === "about" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <h3 className="font-bold text-[var(--glass-text)]">Enable About Section</h3>
                                        <p className="text-sm text-[var(--glass-text-muted)]">Show the about me information</p>
                                    </div>
                                    <button
                                        onClick={() => handleInputChange("showAbout", !config.showAbout)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${config.showAbout ? "bg-teal-500" : "bg-white/10"}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.showAbout ? "left-7" : "left-1"}`} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Section Title</label>
                                        <input
                                            type="text"
                                            value={config.aboutTitle || ""}
                                            onChange={(e) => handleInputChange("aboutTitle", e.target.value)}
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                            placeholder="About Me"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Full Bio</label>
                                        <textarea
                                            value={config.aboutDescription || ""}
                                            onChange={(e) => handleInputChange("aboutDescription", e.target.value)}
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none h-40 resize-none"
                                            placeholder="Tell your story..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* WORKS TAB */}
                        {activeTab === "works" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <h3 className="font-bold text-[var(--glass-text)]">Enable Works Section</h3>
                                        <p className="text-sm text-[var(--glass-text-muted)]">Show your projects from the CMS</p>
                                    </div>
                                    <button
                                        onClick={() => handleInputChange("showWorks", !config.showWorks)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${config.showWorks ? "bg-teal-500" : "bg-white/10"}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.showWorks ? "left-7" : "left-1"}`} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Section Title</label>
                                        <input
                                            type="text"
                                            value={config.worksTitle || ""}
                                            onChange={(e) => handleInputChange("worksTitle", e.target.value)}
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                            placeholder="Selected Works"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Description</label>
                                        <input
                                            type="text"
                                            value={config.worksDescription || ""}
                                            onChange={(e) => handleInputChange("worksDescription", e.target.value)}
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                            placeholder="A collection of my best projects"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <ProjectManager userId={userId} projects={projects} />
                                </div>
                            </div>
                        )}

                        {/* TESTIMONY TAB */}
                        {activeTab === "testimony" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <h3 className="font-bold text-[var(--glass-text)]">Enable Testimony Section</h3>
                                        <p className="text-sm text-[var(--glass-text-muted)]">Show what others say about you</p>
                                    </div>
                                    <button
                                        onClick={() => handleInputChange("showTestimony", !config.showTestimony)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${config.showTestimony ? "bg-teal-500" : "bg-white/10"}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.showTestimony ? "left-7" : "left-1"}`} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Section Title</label>
                                        <input
                                            type="text"
                                            value={config.testimonyTitle || ""}
                                            onChange={(e) => handleInputChange("testimonyTitle", e.target.value)}
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                            placeholder="Testimonials"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONTACT TAB */}
                        {activeTab === "contact" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <h3 className="font-bold text-[var(--glass-text)]">Enable Contact Section</h3>
                                        <p className="text-sm text-[var(--glass-text-muted)]">Show a contact form</p>
                                    </div>
                                    <button
                                        onClick={() => handleInputChange("showContact", !config.showContact)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${config.showContact ? "bg-teal-500" : "bg-white/10"}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.showContact ? "left-7" : "left-1"}`} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Section Title</label>
                                        <input
                                            type="text"
                                            value={config.contactTitle || ""}
                                            onChange={(e) => handleInputChange("contactTitle", e.target.value)}
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                            placeholder="Get in Touch"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Contact Email</label>
                                        <input
                                            type="email"
                                            value={config.contactEmail || ""}
                                            onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Location</label>
                                        <input
                                            type="text"
                                            value={config.location || ""}
                                            onChange={(e) => handleInputChange("location", e.target.value)}
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                            placeholder="New York, USA"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Google Maps Embed URL</label>
                                        <input
                                            type="text"
                                            value={config.googleMapsUrl || ""}
                                            onChange={(e) => handleInputChange("googleMapsUrl", e.target.value)}
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                            placeholder="https://www.google.com/maps/embed?..."
                                        />
                                        <p className="text-xs text-[var(--glass-text-muted)] mt-1">Paste the 'Embed a map' HTML src URL here.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Social Media</label>
                                        <div className="space-y-3">
                                            {(config.socials || []).map((social: any, index: number) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={social.platform}
                                                        onChange={(e) => {
                                                            const newSocials = [...(config.socials || [])];
                                                            newSocials[index].platform = e.target.value;
                                                            handleInputChange("socials", newSocials);
                                                        }}
                                                        className="w-1/3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-2 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                                        placeholder="Platform (e.g. GitHub)"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={social.url}
                                                        onChange={(e) => {
                                                            const newSocials = [...(config.socials || [])];
                                                            newSocials[index].url = e.target.value;
                                                            handleInputChange("socials", newSocials);
                                                        }}
                                                        className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-2 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                                        placeholder="URL"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newSocials = (config.socials || []).filter((_: any, i: number) => i !== index);
                                                            handleInputChange("socials", newSocials);
                                                        }}
                                                        className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newSocials = [...(config.socials || []), { platform: "", url: "" }];
                                                    handleInputChange("socials", newSocials);
                                                }}
                                                className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300"
                                            >
                                                <Plus size={16} /> Add Social Link
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <input
                                            type="checkbox"
                                            id="showResume"
                                            checked={config.showResume}
                                            onChange={(e) => handleInputChange("showResume", e.target.checked)}
                                            className="w-5 h-5 accent-teal-500"
                                        />
                                        <label htmlFor="showResume" className="text-sm text-[var(--glass-text)]">Show Download Resume Button</label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Panel - Desktop Only */}
            <div className="hidden lg:block flex-1 bg-black/50 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl">
                <div className="absolute top-4 right-4 z-50 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-mono text-white/50 border border-white/10 pointer-events-none">
                    LIVE PREVIEW
                </div>
                {/* Transform used to contain 'fixed' elements inside the preview */}
                <div className="w-full h-full overflow-y-auto custom-scrollbar" style={{ transform: "translateZ(0)" }}>
                    <PortfolioPreview
                        config={config}
                        user={{ ...user, username }}
                        projects={projects}
                    />
                </div>
            </div>
        </div>
    );
}
