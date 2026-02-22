"use client";

import { motion } from "framer-motion";
import { Shield, Database, Lock, Image as ImageIcon, RefreshCcw, FileText, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function PrivacyClient() {
    const [activeSection, setActiveSection] = useState("info");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            const sections = ["info", "usage", "security", "portfolio", "changes"];
            for (const id of sections) {
                const element = document.getElementById(id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 200 && rect.bottom >= 200) {
                        setActiveSection(id);
                        break;
                    }
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: "smooth"
            });
        }
    };

    if (!mounted) return null;

    const sections = [
        { id: "info", title: "Informasi yang Kami Kumpulkan", icon: <Database size={18} /> },
        { id: "usage", title: "Penggunaan Data", icon: <Shield size={18} /> },
        { id: "security", title: "Keamanan Data", icon: <Lock size={18} /> },
        { id: "portfolio", title: "Aset dalam Portofolio", icon: <ImageIcon size={18} /> },
        { id: "changes", title: "Perubahan Kebijakan", icon: <RefreshCcw size={18} /> },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

            {/* Sidebar Navigation */}
            <div className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-32 glass-liquid p-6 rounded-3xl">
                    <h3 className="text-[var(--glass-text)] font-semibold mb-6 flex items-center gap-2">
                        <FileText size={20} className="text-[var(--site-primary)]" />
                        Daftar Isi
                    </h3>
                    <ul className="space-y-3">
                        {sections.map((section) => (
                            <li key={section.id}>
                                <button
                                    onClick={() => scrollTo(section.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 text-sm font-medium
                    ${activeSection === section.id
                                            ? "bg-[var(--site-primary)]/10 text-[var(--site-primary)] shadow-sm border border-[var(--site-primary)]/20"
                                            : "text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] hover:bg-black/5 dark:hover:bg-white/5"
                                        }`}
                                >
                                    <span className={`${activeSection === section.id ? "text-[var(--site-primary)]" : "text-gray-500"}`}>
                                        {section.icon}
                                    </span>
                                    {section.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-12">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="prose prose-invert max-w-none"
                >
                    {/* Section 1 */}
                    <div id="info" className="scroll-mt-32 relative group">
                        <div className="absolute -inset-x-6 -inset-y-4 bg-transparent group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.02] rounded-3xl transition-colors duration-500 -z-10" />
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--glass-text)] mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--site-primary)]/20 to-transparent text-[var(--site-primary)] border border-[var(--site-primary)]/20">
                                1
                            </span>
                            Informasi yang Kami Kumpulkan
                        </h2>
                        <div className="text-[var(--glass-text-muted)] leading-relaxed text-base md:text-lg">
                            <p className="mb-4">
                                Saat Anda menggunakan layanan desain grafis kami, kami mungkin meminta Anda untuk memberikan informasi pengenal pribadi tertentu yang dapat digunakan untuk menghubungi atau mengidentifikasi Anda. Informasi pengenal pribadi dapat mencakup, namun tidak terbatas pada:
                            </p>
                            <ul className="space-y-3 mt-6">
                                {["Alamat Email", "Nama Depan dan Nama Belakang", "Nomor Telepon", "Detail Proyek dan Aset Perusahaan"].map((item, i) => (
                                    <motion.li
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        key={i}
                                        className="flex items-start gap-3"
                                    >
                                        <CheckCircle2 size={20} className="text-[var(--site-secondary)] mt-1 flex-shrink-0" />
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent my-12" />

                    {/* Section 2 */}
                    <div id="usage" className="scroll-mt-32 relative group">
                        <div className="absolute -inset-x-6 -inset-y-4 bg-transparent group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.02] rounded-3xl transition-colors duration-500 -z-10" />
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--glass-text)] mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--site-secondary)]/20 to-transparent text-[var(--site-secondary)] border border-[var(--site-secondary)]/20">
                                2
                            </span>
                            Penggunaan Data
                        </h2>
                        <div className="text-[var(--glass-text-muted)] leading-relaxed text-base md:text-lg">
                            <p className="mb-4">
                                Informasi yang dikumpulkan digunakan untuk berbagai tujuan desain dan layanan:
                            </p>
                            <ul className="space-y-3 mt-6 mb-4">
                                {[
                                    "Untuk menyediakan dan memelihara komunikasi proyek yang efektif.",
                                    "Untuk memberi tahu Anda tentang kemajuan atau perubahan pada layanan kami.",
                                    "Untuk memberikan dukungan pelanggan yang responsif (konsultasi, revisi, penyerahan file akhir).",
                                    "Untuk mengumpulkan analisis atau ruang lingkup guna meningkatkan kualitas desain."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Shield size={20} className="text-[var(--site-primary)] mt-1 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent my-12" />

                    {/* Section 3 */}
                    <div id="security" className="scroll-mt-32 relative group">
                        <div className="absolute -inset-x-6 -inset-y-4 bg-transparent group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.02] rounded-3xl transition-colors duration-500 -z-10" />
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--glass-text)] mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-transparent text-purple-400 border border-purple-500/20">
                                3
                            </span>
                            Keamanan Data
                        </h2>
                        <div className="text-[var(--glass-text-muted)] leading-relaxed text-base md:text-lg">
                            <p className="glass-panel p-6 rounded-2xl border-l-4 border-purple-500 bg-black/5 dark:bg-white/5 italic">
                                "Keamanan data proyek Anda sangat penting bagi kami. Kami menjaga kerahasiaan materi yang belum dirilis dengan sangat ketat."
                            </p>
                            <p className="mt-6">
                                Ingatlah bahwa tidak ada metode transmisi melalui Internet, atau metode penyimpanan elektronik yang 100% aman. Meskipun kami berusaha menggunakan cara yang aman secara komersial untuk melindungi Data Pribadi dan aset proyek Anda, kami tidak dapat menjamin keamanan mutlaknya dari pihak ketiga yang tidak berwenang.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent my-12" />

                    {/* Section 4 */}
                    <div id="portfolio" className="scroll-mt-32 relative group">
                        <div className="absolute -inset-x-6 -inset-y-4 bg-transparent group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.02] rounded-3xl transition-colors duration-500 -z-10" />
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--glass-text)] mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--site-accent)]/20 to-transparent text-[var(--site-accent)] border border-[var(--site-accent)]/20">
                                4
                            </span>
                            Penggunaan Aset Klien dalam Portofolio
                        </h2>
                        <div className="text-[var(--glass-text-muted)] leading-relaxed text-base md:text-lg">
                            <p>
                                Kami berhak menampilkan hasil karya desain yang telah diselesaikan di dalam portofolio situs web ini atau media sosial kami sebagai bentuk bukti representasi profesional kami kepada klien lain.
                            </p>
                            <p className="mt-4 font-semibold text-[var(--site-secondary)]">
                                Kepemilikan ini berlaku kecuali terdapat perjanjian Kerahasiaan (Non-Disclosure Agreement / NDA) tertulis yang telah disepakati bersama sebelum pengerjaan desain dimulai.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent my-12" />

                    {/* Section 5 */}
                    <div id="changes" className="scroll-mt-32 relative group">
                        <div className="absolute -inset-x-6 -inset-y-4 bg-transparent group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.02] rounded-3xl transition-colors duration-500 -z-10" />
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--glass-text)] mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent text-blue-400 border border-blue-500/20">
                                5
                            </span>
                            Perubahan Kebijakan Privasi
                        </h2>
                        <div className="text-[var(--glass-text-muted)] leading-relaxed text-base md:text-lg">
                            <p>
                                Kami dapat memperbarui Kebijakan Privasi dari waktu ke waktu sesuai perkembangan standar perlindungan data. Kami akan memberi tahu Anda tentang segala perubahan material dengan memperbarui tanggal "Terakhir diperbarui" di bagian bawah halaman ini.
                            </p>
                            <p className="mt-4">
                                Anda disarankan untuk meninjau Kebijakan Privasi ini secara berkala untuk mengetahui perubahannya.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
