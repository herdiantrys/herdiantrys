"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PortableText } from "@portabletext/react";

const stats = [
    { label: "Years Experience", value: "5+" },
    { label: "Projects Completed", value: "120+" },
    { label: "Happy Clients", value: "80+" },
    { label: "Awards Won", value: "12" },
];

const GlassAbout = ({ profile }: { profile: any }) => {
    const [currentStat, setCurrentStat] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentStat((prev) => (prev + 1) % stats.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const nextStat = () => setCurrentStat((prev) => (prev + 1) % stats.length);
    const prevStat = () => setCurrentStat((prev) => (prev - 1 + stats.length) % stats.length);

    const skills = profile?.skills || [
        { name: "Graphic Design", proficiency: 95 },
        { name: "Illustration", proficiency: 88 },
        { name: "Motion Graphics", proficiency: 82 },
        { name: "UI/UX Design", proficiency: 90 },
    ];

    return (
        <section className="py-20 relative z-10">
            <div className="container mx-auto px-4">
                <div className="glass rounded-3xl p-8 md:p-12 border-[var(--glass-border)] relative overflow-hidden backdrop-blur-xs">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-start">
                        {/* Left Column: Bio */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="flex-1"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--glass-text)]">
                                Designing with <span className="text-gradient">Passion</span> & Purpose
                            </h2>

                            <div className="text-[var(--glass-text-muted)] mb-8 leading-relaxed text-lg prose prose-invert max-w-none">
                                {profile?.bio ? (
                                    <PortableText value={profile.bio} />
                                ) : (
                                    <>
                                        <p className="mb-6">
                                            I am a multidisciplinary graphic designer with a focus on digital experiences.
                                            My work is driven by a desire to create meaningful connections between brands and people.
                                        </p>
                                        <p>
                                            I believe that good design is not just about how things look, but how they work and how they make you feel.
                                            When I'm not designing, you can find me exploring new art galleries, experimenting with 3D modeling,
                                            or seeking inspiration in nature.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Experience Timeline */}
                            {(profile?.experience?.length > 0 || true) && (
                                <div className="mt-12">
                                    <h3 className="text-2xl font-bold text-[var(--glass-text)] mb-8">Experience</h3>
                                    <div className="relative border-l border-[var(--glass-border)] ml-3 space-y-8">
                                        {(profile?.experience?.length > 0 ? profile.experience : [
                                            {
                                                jobTitle: "Senior Graphic Designer",
                                                company: "Creative Studio",
                                                startDate: "2021-01-01",
                                                isCurrent: true,
                                                description: null
                                            },
                                            {
                                                jobTitle: "UI/UX Designer",
                                                company: "Tech Agency",
                                                startDate: "2019-03-01",
                                                endDate: "2020-12-31",
                                                isCurrent: false,
                                                description: null
                                            }
                                        ]).map((exp: any, index: number) => {
                                            const start = new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                            const end = exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

                                            return (
                                                <div key={index} className="relative pl-8">
                                                    {/* Dot */}
                                                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />

                                                    <div className="glass p-6 rounded-xl border-[var(--glass-border)] bg-[var(--glass-bg)]/50 hover:bg-[var(--glass-bg)] transition-colors">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                                                            <h4 className="text-lg font-bold text-[var(--glass-text)]">{exp.jobTitle}</h4>
                                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 w-fit">
                                                                {start} - {end}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-[var(--glass-text-muted)] font-medium mb-3">{exp.company}</p>
                                                        {exp.description && (
                                                            <div className="text-sm text-[var(--glass-text-muted)]/80 prose prose-invert prose-sm max-w-none">
                                                                <PortableText value={exp.description} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}


                        </motion.div>

                        {/* Right Column: Stats & Skills */}
                        <div className="flex-1 w-full flex flex-col gap-10">
                            {/* Stats Carousel */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative h-48 glass bg-[var(--glass-bg)] rounded-2xl border-[var(--glass-border)] overflow-hidden flex items-center justify-center"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStat}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-center"
                                    >
                                        <h3 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 mb-2">
                                            {stats[currentStat].value}
                                        </h3>
                                        <p className="text-[var(--glass-text)] font-medium tracking-wide uppercase text-sm">
                                            {stats[currentStat].label}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Carousel Controls */}
                                <button onClick={prevStat} className="absolute left-4 p-2 rounded-full hover:bg-white/10 text-[var(--glass-text-muted)] hover:text-white transition-colors z-10">
                                    <ChevronLeft size={24} />
                                </button>
                                <button onClick={nextStat} className="absolute right-4 p-2 rounded-full hover:bg-white/10 text-[var(--glass-text-muted)] hover:text-white transition-colors z-10">
                                    <ChevronRight size={24} />
                                </button>

                                {/* Indicators */}
                                <div className="absolute bottom-4 flex gap-2">
                                    {stats.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentStat ? "w-6 bg-teal-500" : "w-1.5 bg-white/20"}`}
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            {/* Skills Sliders */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <h3 className="text-xl font-bold text-[var(--glass-text)] mb-6">Technical Proficiency</h3>
                                <div className="space-y-6">
                                    {skills.map((skill: any, index: number) => (
                                        <div key={skill.name}>
                                            <div className="flex justify-between mb-2 text-sm">
                                                <span className="text-[var(--glass-text)]">{skill.name}</span>
                                                <span className="text-[var(--glass-text-muted)]">{skill.proficiency || skill.level}%</span>
                                            </div>
                                            <div className="h-2 bg-[var(--glass-border)] rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${skill.proficiency || skill.level}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1.5, delay: 0.5 + (index * 0.1), ease: "easeOut" }}
                                                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full relative"
                                                >
                                                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Education Timeline (Moved to Right Column) */}
                            {profile?.education?.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                >
                                    <h3 className="text-xl font-bold text-[var(--glass-text)] mb-6">Education</h3>
                                    <div className="relative border-l border-[var(--glass-border)] ml-3 space-y-8">
                                        {profile.education.map((edu: any, index: number) => {
                                            const start = new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                            const end = edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';

                                            return (
                                                <div key={index} className="relative pl-8">
                                                    {/* Dot */}
                                                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />

                                                    <div className="glass p-6 rounded-xl border-[var(--glass-border)] bg-[var(--glass-bg)]/50 hover:bg-[var(--glass-bg)] transition-colors">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                                                            <h4 className="text-lg font-bold text-[var(--glass-text)]">{edu.degree}</h4>
                                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit">
                                                                {start} - {end}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-[var(--glass-text-muted)] font-medium mb-3">{edu.institution}</p>
                                                        {edu.description && (
                                                            <div className="text-sm text-[var(--glass-text-muted)]/80 prose prose-invert prose-sm max-w-none">
                                                                <PortableText value={edu.description} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GlassAbout;
