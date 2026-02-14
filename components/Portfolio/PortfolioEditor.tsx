"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form"; // Assuming installed or will use simple state
// Actually better to use standard React state for simplicity if extensive deps not present
import { motion } from "framer-motion";
import { Save, Loader2, Layout, Type, Palette, Image as ImageIcon, Upload } from "lucide-react";
import { updatePortfolioConfig, uploadPortfolioHeroImage } from "@/lib/actions/portfolio.actions";
import { useRouter } from "next/navigation";
import PortfolioLandingPage from "./PortfolioLandingPage";

interface PortfolioEditorProps {
    config: any;
    userId: string;
    user: any;
}

export default function PortfolioEditor({ config, userId, user }: PortfolioEditorProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        isEnabled: config?.isEnabled || false,
        layoutType: config?.layoutType || "minimal",
        primaryColor: config?.primaryColor || "#0ea5e9", // Sky-500 default
        fontFamily: config?.fontFamily || "inter",
        heroTitle: config?.heroTitle || "",
        heroDescription: config?.heroDescription || "",
        heroImage: config?.heroImage || "",
        showResume: config?.showResume ?? true,
        showContact: config?.showContact ?? true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updatePortfolioConfig(userId, formData);
            router.refresh();
            // Show toast success
        } catch (error) {
            console.error(error);
            // Show toast error
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append("image", file);

        try {
            const res = await uploadPortfolioHeroImage(userId, uploadData);
            if (res.success && res.imageUrl) {
                setFormData(prev => ({ ...prev, heroImage: res.imageUrl }));
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Editor Sidebar / Panel */}
            <div className="w-full lg:w-[450px] bg-slate-950 border-r border-white/10 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">
                            Editor
                        </h1>
                        <p className="text-xs text-slate-400">Customize your portfolio</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg text-sm font-bold hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        <span>Save</span>
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Template */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                            <Layout size={16} className="text-teal-400" />
                            Layout & Template
                        </h3>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Template Style</label>
                            <select
                                name="layoutType"
                                value={formData.layoutType}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-teal-500 outline-none"
                            >
                                <option value="minimal">MinimalIST</option>
                                <option value="creative">Creative Studio</option>
                                <option value="professional">Enterprise</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-sm font-medium">Enable Portfolio</span>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    name="isEnabled"
                                    checked={formData.isEnabled}
                                    onChange={handleChange}
                                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
                                    style={{ transform: formData.isEnabled ? 'translateX(100%)' : 'translateX(0)', borderColor: formData.isEnabled ? '#14b8a6' : '#cbd5e1' }}
                                />
                                <label className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${formData.isEnabled ? 'bg-teal-400' : 'bg-slate-700'}`}></label>
                            </div>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                            <Palette size={16} className="text-purple-400" />
                            Appearance
                        </h3>

                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Primary Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'].map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, primaryColor: color }))}
                                        className={`w-6 h-6 rounded-full border-2 transition-all ${formData.primaryColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    name="primaryColor"
                                    value={formData.primaryColor}
                                    onChange={handleChange}
                                    className="w-6 h-6 bg-transparent border-0 p-0 rounded-full overflow-hidden cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Font Family</label>
                            <select
                                name="fontFamily"
                                value={formData.fontFamily}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-teal-500 outline-none"
                            >
                                <option value="inter">Inter (Sans)</option>
                                <option value="serif">Playfair Display (Serif)</option>
                                <option value="mono">JetBrains Mono (Code)</option>
                            </select>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                            <Type size={16} className="text-teal-400" />
                            Hero Content
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Headline</label>
                                <input
                                    type="text"
                                    name="heroTitle"
                                    value={formData.heroTitle}
                                    onChange={handleChange}
                                    placeholder="e.g. Creative Developer"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-teal-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Bio / Intro</label>
                                <textarea
                                    name="heroDescription"
                                    value={formData.heroDescription}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Brief intro..."
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-teal-500 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">
                                    Hero Background
                                </label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                name="heroImage"
                                                value={formData.heroImage}
                                                onChange={handleChange}
                                                placeholder="Image URL"
                                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-teal-500 outline-none"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="px-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                                            title="Upload Image"
                                        >
                                            {isUploading ? <Loader2 className="animate-spin text-teal-400" size={16} /> : <Upload size={16} className="text-slate-400" />}
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                    {formData.heroImage && (
                                        <div className="w-full h-24 rounded-lg overflow-hidden border border-white/10 relative group">
                                            <img src={formData.heroImage} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, heroImage: "" }))}
                                                className="absolute top-2 right-2 p-1 bg-black/50 rounded hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>



                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                            <Layout size={16} className="text-teal-400" />
                            Section Visibility
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                                <span className="text-xs font-medium text-slate-300">Resume</span>
                                <input
                                    type="checkbox"
                                    name="showResume"
                                    checked={formData.showResume}
                                    onChange={handleChange}
                                    className="accent-teal-500"
                                />
                            </label>
                            <label className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                                <span className="text-xs font-medium text-slate-300">Contact</span>
                                <input
                                    type="checkbox"
                                    name="showContact"
                                    checked={formData.showContact}
                                    onChange={handleChange}
                                    className="accent-teal-500"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Preview Area */}
            <div className="flex-1 bg-black/90 h-[calc(100vh-6rem)] relative overflow-hidden flex flex-col">
                <div className="bg-slate-900 border-b border-white/5 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">Live Preview</span>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 bg-dots-pattern flex justify-center items-start">
                    <div className="w-full max-w-[1400px] h-full shadow-2xl relative">
                        {/* Render the actual landing page with live data */}
                        <div className="transform scale-[0.8] origin-top h-[125%] w-[125%] -ml-[12.5%] -mt-0">
                            {/* Scale down slightly to fit more content, or just render 1:1 responsive */}
                            {/* Actually no scale is better for "true" preview unless we simulate mobile. Let's just do 1:1 responsive */}
                        </div>
                        <div className="absolute inset-0">
                            <PortfolioLandingPage
                                user={user}
                                config={formData}
                                projects={user.projects || []}
                                isPreview={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
