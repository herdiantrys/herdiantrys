
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Shield,
    Layers,
    Bell,
    MapPin,
    Globe,
    Mail,
    AtSign,
    Info,
    Save,
    Loader2,
    ExternalLink,
    ChevronRight,
    CircleDashed,
    Palette
} from "lucide-react";
import { updateUserProfile, updateUsername } from "@/lib/actions/user.actions";
import { updatePreferences } from "@/lib/actions/settings.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SettingsClientProps {
    user: any;
    dict: any;
    currentLocale: string;
}

export default function SettingsClient({ user, dict, currentLocale }: SettingsClientProps) {
    const [activeTab, setActiveTab] = useState<"profile" | "account" | "interface" | "notifications">("profile");
    const [isSaving, setIsSaving] = useState(false);

    // Calculate initial cooldown
    const getInitialCooldown = () => {
        if (!user.lastUsernameChange) return null;
        const lastChange = new Date(user.lastUsernameChange).getTime();
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const diff = now - lastChange;

        if (diff < thirtyDaysInMs) {
            const daysRemaining = Math.ceil((thirtyDaysInMs - diff) / (24 * 60 * 60 * 1000));
            return { active: true, daysRemaining };
        }
        return null;
    };

    const [cooldown, setCooldown] = useState<{ active: boolean; daysRemaining: number } | null>(getInitialCooldown());
    const router = useRouter();

    const ds = dict.settings || {};
    const tabs = ds.tabs || {};

    // Form States
    const [profileData, setProfileData] = useState({
        fullName: user.name || "",
        headline: user.headline || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
    });

    const [accountData, setAccountData] = useState({
        username: user.username || "",
        email: user.email || "",
    });

    const [preferences, setPreferences] = useState(() => {
        const basePrefs = user.preferences || {};
        return {
            language: basePrefs.language || currentLocale || "en",
            notifications: {
                email: true,
                push: true,
                inApp: true,
                ...(basePrefs.notifications || {})
            }
        };
    });

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await updateUserProfile(user.id, profileData);
            if (res.success) {
                toast.success(ds.profile?.save_success || "Profile updated!");
                router.refresh();
            } else {
                toast.error(res.error || ds.profile?.save_error || "Update failed.");
            }
        } catch (err) {
            toast.error("An error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (accountData.username === user.username) return;

        setIsSaving(true);
        try {
            const res = await updateUsername(user.id, accountData.username);
            if (res.success) {
                toast.success(res.message || ds.account?.save_success || "Username updated!");
                router.refresh();
            } else {
                if (res.cooldownActive) {
                    setCooldown({ active: true, daysRemaining: res.daysRemaining! });
                }
                toast.error(res.error || ds.account?.save_error || "Update failed.");
            }
        } catch (err) {
            toast.error("An error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrefSubmit = async () => {
        setIsSaving(true);
        try {
            const res = await updatePreferences(user.id, preferences);
            if (res.success) {
                toast.success(ds.interface?.save_success || "Preferences updated!");

                // If language changed, handle redirect
                if (preferences.language !== currentLocale) {
                    const segments = window.location.pathname.split('/');
                    if (segments[1] === currentLocale) {
                        segments[1] = preferences.language;
                    } else {
                        segments.splice(1, 0, preferences.language);
                    }
                    document.cookie = `NEXT_LOCALE=${preferences.language}; path=/; max-age=31536000; SameSite=Lax`;
                    window.location.href = segments.join('/');
                } else {
                    router.refresh();
                }
            }
        } catch (err) {
            toast.error("An error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    const renderTabs = () => (
        <div className="flex p-1.5 bg-slate-100/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-white/10 mb-8 overflow-x-auto shadow-sm no-scrollbar">
            {(["profile", "account", "interface", "notifications"] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all relative z-10 font-bold text-sm whitespace-nowrap ${activeTab === tab
                        ? "text-slate-900 dark:text-white text-shadow-sm"
                        : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white text-shadow-sm"
                        }`}
                >
                    {activeTab === tab && (
                        <motion.div
                            layoutId="activeTabSettings"
                            className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-sm dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-slate-200/50 dark:border-white/10 -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        />
                    )}
                    {tab === "profile" && <User size={16} />}
                    {tab === "account" && <Shield size={16} />}
                    {tab === "interface" && <Palette size={16} />}
                    {tab === "notifications" && <Bell size={16} />}
                    <span className="relative uppercase tracking-widest text-[10px]">
                        {tabs[tab] || tab}
                    </span>
                </button>
            ))}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4">
            <header className="mb-10 text-center sm:text-left">
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 drop-shadow-sm">
                    {ds.title || "Settings"}
                </h1>
                <p className="text-slate-500 dark:text-gray-400 font-medium">
                    {ds.description || "Manage your account and preferences."}
                </p>
            </header>

            {renderTabs()}

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                    transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                >
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl dark:shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 dark:bg-teal-500/5 blur-[100px] -z-10" />

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-teal-100 dark:bg-teal-500/10 rounded-2xl text-teal-600 dark:text-teal-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{ds.profile?.title || "Public Profile"}</h3>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">{ds.profile?.subtitle || "How you appear to the world."}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                                            {ds.profile?.display_name || "Display Name"}
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.fullName}
                                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--site-secondary)]/50 transition-all placeholder:text-slate-400 dark:placeholder-gray-500"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                                            {ds.profile?.headline || "Headline"}
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.headline}
                                            onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--site-secondary)]/50 transition-all placeholder:text-slate-400 dark:placeholder-gray-500"
                                            placeholder="e.g. Creative Developer"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                                            {ds.profile?.bio || "Bio"}
                                        </label>
                                        <textarea
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            rows={4}
                                            className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--site-secondary)]/50 transition-all resize-none placeholder:text-slate-400 dark:placeholder-gray-500"
                                            placeholder="Tell us a bit about yourself..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                                            {ds.profile?.location || "Location"}
                                        </label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400" />
                                            <input
                                                type="text"
                                                value={profileData.location}
                                                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-4 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--site-secondary)]/50 transition-all placeholder:text-slate-400 dark:placeholder-gray-500"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                                            {ds.profile?.website || "Website"}
                                        </label>
                                        <div className="relative">
                                            <Globe size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400" />
                                            <input
                                                type="url"
                                                value={profileData.website}
                                                onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-4 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--site-secondary)]/50 transition-all placeholder:text-slate-400 dark:placeholder-gray-500"
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-8 py-4 bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
                                            {isSaving ? "Updating..." : ds.profile?.save_btn || "Save Profile"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === "account" && (
                        <div className="space-y-6">
                            <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl dark:shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 dark:bg-blue-500/5 blur-[100px] -z-10" />

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{ds.account?.title || "Account Security"}</h3>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">{ds.account?.subtitle || "Manage access and security credentials."}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleUsernameSubmit} className="space-y-6 max-w-lg">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                                            {ds.account?.username || "Username"}
                                        </label>
                                        <div className="relative">
                                            <AtSign size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400" />
                                            <input
                                                type="text"
                                                value={accountData.username}
                                                onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                                                className={`w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-4 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--site-secondary)]/50 transition-all ${cooldown?.active ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                placeholder="username"
                                                disabled={cooldown?.active}
                                            />
                                        </div>
                                        {cooldown?.active && (
                                            <p className="text-[10px] text-amber-500 font-bold mt-1 ml-1 flex items-center gap-1.5">
                                                <Info size={12} />
                                                {ds.account?.username_available_in?.replace("{days}", cooldown.daysRemaining.toString()) ||
                                                    `Username can be changed again in ${cooldown.daysRemaining} days.`}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                                            {ds.account?.email || "Email Address"}
                                        </label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400" />
                                            <input
                                                type="email"
                                                value={accountData.email}
                                                disabled
                                                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-slate-900 dark:text-white opacity-50 cursor-not-allowed"
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold mt-1 ml-1">
                                            Contact support to change your verified email address.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSaving || accountData.username === user.username || cooldown?.active}
                                            className="w-full sm:w-auto px-8 py-4 bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {isSaving ? "Updating..." : ds.account?.change_username || "Update Username"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === "interface" && (
                        <div className="space-y-6">
                            <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl dark:shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 dark:bg-purple-500/5 blur-[100px] -z-10" />

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
                                        <Palette size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{ds.interface?.title || "Interface Preferences"}</h3>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">{ds.interface?.subtitle || "Customize how the platform looks and feels."}</p>
                                    </div>
                                </div>

                                <div className="space-y-8 max-w-lg">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">
                                            {ds.interface?.language || "Language"}
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {(["en", "id"] as const).map((lang) => (
                                                <button
                                                    key={lang}
                                                    onClick={() => setPreferences({ ...preferences, language: lang })}
                                                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${preferences.language === lang
                                                        ? "bg-[var(--site-secondary)]/10 border-[var(--site-secondary)]/40 text-[var(--site-secondary)]"
                                                        : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-500 dark:text-gray-400"
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${preferences.language === lang ? "bg-[var(--site-secondary)]/20" : "bg-slate-200 dark:bg-white/10"
                                                        }`}>
                                                        {lang.toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-sm">
                                                        {lang === "en" ? "English" : "Indonesia"}
                                                    </span>
                                                    {preferences.language === lang && (
                                                        <motion.div layoutId="activeLang" className="ml-auto">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--site-secondary)] shadow-[0_0_10px_rgba(var(--site-secondary-rgb),0.5)]" />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5">
                                        <button
                                            onClick={handlePrefSubmit}
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-8 py-4 bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {isSaving ? "Saving..." : ds.interface?.save_btn || "Save Preferences"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl dark:shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 dark:bg-amber-500/5 blur-[100px] -z-10" />

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-amber-100 dark:bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400">
                                        <Bell size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{ds.notifications?.title || "Update Channels"}</h3>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">{ds.notifications?.subtitle || "Choose how we should keep you in the loop."}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 max-w-lg">
                                    {[
                                        { id: 'email', icon: <Mail size={18} />, label: ds.notifications?.email_notifs || "Email Notifications" },
                                        { id: 'push', icon: <Globe size={18} />, label: ds.notifications?.push_notifs || "Push Notifications" },
                                        { id: 'inApp', icon: <CircleDashed size={18} />, label: ds.notifications?.in_app_notifs || "In-App Notifications" },
                                    ].map((channel) => (
                                        <div
                                            key={channel.id}
                                            onClick={() => setPreferences({
                                                ...preferences,
                                                notifications: {
                                                    ...preferences.notifications,
                                                    [channel.id]: !preferences.notifications?.[channel.id as keyof typeof preferences.notifications]
                                                }
                                            })}
                                            className="flex items-center justify-between p-5 bg-slate-50 dark:bg-black/20 rounded-[2rem] border border-slate-200 dark:border-white/10 cursor-pointer hover:border-slate-300 dark:hover:border-white/20 shadow-sm transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-slate-200 dark:bg-white/5 rounded-2xl group-hover:bg-amber-100 dark:group-hover:bg-amber-400/10 group-hover:text-amber-600 group-hover:text-amber-400 transition-colors">
                                                    {channel.icon}
                                                </div>
                                                <span className="font-bold text-sm tracking-tight">{channel.label}</span>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${preferences.notifications?.[channel.id as keyof typeof preferences.notifications] ? "bg-amber-400" : "bg-slate-300 dark:bg-zinc-700"
                                                }`}>
                                                <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${preferences.notifications?.[channel.id as keyof typeof preferences.notifications] ? "translate-x-6" : "translate-x-0"
                                                    }`} />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-8 pt-6 border-t border-white/5">
                                        <button
                                            onClick={handlePrefSubmit}
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-8 py-4 bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {isSaving ? "Update Preferences" : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

