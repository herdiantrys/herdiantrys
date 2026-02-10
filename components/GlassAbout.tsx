"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Briefcase, GraduationCap } from "lucide-react";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import { SectionTitle } from "@/components/ui/SectionTitle";

const GlassAbout = ({ profile, dict }: { profile: any, dict: any }) => {
    const stats = [
        { label: dict.about.stats.years_experience, value: "5+" },
        { label: dict.about.stats.projects_completed, value: "120+" },
        { label: dict.about.stats.happy_clients, value: "80+" },
        { label: dict.about.stats.awards, value: "12" },
    ];

    const [currentStat, setCurrentStat] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentStat((prev) => (prev + 1) % stats.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [stats.length]);

    const skills = profile?.skills || [
        { name: "Desain Grafis", proficiency: 95 },
        { name: "Ilustrasi", proficiency: 88 },
        { name: "Grafis Gerak", proficiency: 82 },
        { name: "Desain UI/UX", proficiency: 90 },
    ];

    return (
        <section className="py-20 relative z-10">
            <div className="container mx-auto px-4">
                {/* Stats Counter (Mobile) */}
                <div className="md:hidden mb-12 flex justify-center">
                    <div className="glass px-8 py-4 rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)]/50 backdrop-blur-md flex items-center gap-4">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={stats[currentStat].value}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500"
                            >
                                {stats[currentStat].value}
                            </motion.span>
                        </AnimatePresence>
                        <p className="text-[var(--glass-text)] font-medium tracking-wide uppercase text-sm">
                            {stats[currentStat].label}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Image & Skills */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-4 space-y-8"
                    >
                        {/* Profile Image Card */}
                        <div className="glass p-4 rounded-3xl border-[var(--glass-border)] bg-[var(--glass-bg)] relative group overflow-hidden">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden relative">
                                <img
                                    src={profile?.aboutImage ? urlFor(profile.aboutImage).url() : (profile?.profileImage ? urlFor(profile.profileImage).url() : "/placeholder-user.jpg")}
                                    alt={profile?.fullName || "Profile"}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-white font-bold text-xl">{profile?.fullName}</h3>
                                    <p className="text-teal-400 text-sm">{Array.isArray(profile?.headline) ? profile.headline[0] : profile?.headline}</p>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="glass p-8 rounded-3xl border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl">
                            <h3 className="text-xl font-bold text-[var(--glass-text)] mb-6">{dict.about.skills_title}</h3>
                            <div className="space-y-6">
                                {skills.map((skill: any, index: number) => (
                                    <div key={index}>
                                        <div className="flex justify-between mb-2 text-sm">
                                            <span className="text-[var(--glass-text)] font-medium">{skill.name}</span>
                                            <span className="text-[var(--glass-text-muted)]">{skill.proficiency}%</span>
                                        </div>
                                        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${skill.proficiency}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                                                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Bio & Experience */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            {/* Desktop Stats */}
                            <div className="hidden md:grid grid-cols-4 gap-4 mb-12">
                                {stats.map((stat, index) => (
                                    <div key={index} className="glass p-6 rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)]/30 text-center hover:bg-[var(--glass-bg)]/50 transition-colors">
                                        <span className="block text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 mb-2">
                                            {stat.value}
                                        </span>
                                        <span className="text-xs text-[var(--glass-text-muted)] uppercase tracking-wider font-semibold">
                                            {stat.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <SectionTitle
                                title={
                                    profile?.aboutTitle ? (
                                        profile.aboutTitle
                                    ) : (
                                        <>
                                            {dict.about.title.design_with} <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">{dict.about.title.passion}</span> {dict.about.title.purpose}
                                        </>
                                    )
                                }
                                alignment="left"
                                className="mb-8"
                            />

                            <div className="text-[var(--glass-text-muted)] mb-12 leading-relaxed text-lg prose prose-invert max-w-none">
                                {profile?.bio ? (
                                    typeof profile.bio === 'string' ? (
                                        profile.bio.split('\n').map((line: string, i: number) => (
                                            <p key={i} className="mb-4">{line}</p>
                                        ))
                                    ) : (
                                        <PortableText value={profile.bio} />
                                    )
                                ) : (
                                    <>
                                        <p className="mb-6">
                                            {dict.about.bio_fallback_1}
                                        </p>
                                        <p>
                                            {dict.about.bio_fallback_2}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Experience Timeline */}
                            <div className="grid md:grid-cols-2 gap-12">
                                <div>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-3 rounded-lg bg-teal-500/10 text-teal-400">
                                            <Briefcase size={24} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-[var(--glass-text)]">{dict.about.experience_title}</h3>
                                    </div>

                                    <div className="border-l border-[var(--glass-border)] ml-3 space-y-12">
                                        {profile?.experience?.map((exp: any, index: number) => {
                                            const start = new Date(exp.startDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
                                            const end = exp.isCurrent ? dict.about.present : exp.endDate ? new Date(exp.endDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '';

                                            return (
                                                <div key={index} className="relative pl-8 group">
                                                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] group-hover:scale-150 transition-transform" />

                                                    <h4 className="text-lg font-bold text-[var(--glass-text)] group-hover:text-teal-400 transition-colors">{exp.position}</h4>
                                                    <p className="text-sm font-medium text-[var(--glass-text-muted)] mb-2">{exp.company} • {start} - {end}</p>
                                                    {exp.description && (
                                                        <div className="text-sm text-[var(--glass-text-muted)]/80 leading-relaxed">
                                                            {typeof exp.description === 'string' ? (
                                                                exp.description.split('\n').map((line: string, i: number) => (
                                                                    <p key={i} className="mb-1">{line}</p>
                                                                ))
                                                            ) : (
                                                                <PortableText value={exp.description} />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                                            <GraduationCap size={24} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-[var(--glass-text)]">{dict.about.education_title}</h3>
                                    </div>

                                    <div className="border-l border-[var(--glass-border)] ml-3 space-y-12">
                                        {profile?.education?.map((edu: any, index: number) => {
                                            const start = new Date(edu.startDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
                                            const end = edu.endDate ? new Date(edu.endDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : dict.about.present;

                                            return (
                                                <div key={index} className="relative pl-8 group">
                                                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] group-hover:scale-150 transition-transform" />

                                                    <h4 className="text-lg font-bold text-[var(--glass-text)] group-hover:text-cyan-400 transition-colors">{edu.degree}</h4>
                                                    <p className="text-sm font-medium text-[var(--glass-text-muted)] mb-2">{edu.institution} • {start} - {end}</p>
                                                    {edu.description && (
                                                        <div className="text-sm text-[var(--glass-text-muted)]/80 leading-relaxed">
                                                            {typeof edu.description === 'string' ? (
                                                                edu.description.split('\n').map((line: string, i: number) => (
                                                                    <p key={i} className="mb-1">{line}</p>
                                                                ))
                                                            ) : (
                                                                <PortableText value={edu.description} />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GlassAbout;
