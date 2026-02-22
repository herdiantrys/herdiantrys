"use client";

import { motion } from "framer-motion";
import { Scale, BookOpen, Edit2, Wallet, Briefcase, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function TermsClient() {
    const [activeSection, setActiveSection] = useState("intro");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            const sections = ["intro", "services", "revisions", "payment", "haki", "disclaimer"];
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
        { id: "intro", title: "Pendahuluan", icon: <BookOpen size={18} /> },
        { id: "services", title: "Layanan Desain", icon: <Briefcase size={18} /> },
        { id: "revisions", title: "Revisi & Persetujuan", icon: <Edit2 size={18} /> },
        { id: "payment", title: "Pembayaran & Refund", icon: <Wallet size={18} /> },
        { id: "haki", title: "Hak Kekayaan Intelektual", icon: <Scale size={18} /> },
        { id: "disclaimer", title: "Penafian (Disclaimer)", icon: <AlertTriangle size={18} /> },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

            {/* Sidebar Navigation */}
            <div className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-32 glass-liquid p-6 rounded-3xl">
                    <h3 className="text-[var(--glass-text)] font-semibold mb-6 flex items-center gap-2">
                        <Scale size={20} className="text-[var(--site-secondary)]" />
                        Navigasi Syarat
                    </h3>
                    <ul className="space-y-3">
                        {sections.map((section) => (
                            <li key={section.id}>
                                <button
                                    onClick={() => scrollTo(section.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 text-sm font-medium
                    ${activeSection === section.id
                                            ? "bg-[var(--site-secondary)]/10 text-[var(--site-secondary)] shadow-sm border border-[var(--site-secondary)]/20"
                                            : "text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] hover:bg-black/5 dark:hover:bg-white/5"
                                        }`}
                                >
                                    <span className={`${activeSection === section.id ? "text-[var(--site-secondary)]" : "text-gray-500"}`}>
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
                    <div id="intro" className="scroll-mt-32 relative group">
                        <div className="absolute -inset-x-6 -inset-y-4 bg-transparent group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.02] rounded-3xl transition-colors duration-500 -z-10" />
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--glass-text)] mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--site-secondary)]/20 to-transparent text-[var(--site-secondary)] border border-[var(--site-secondary)]/20">
                                1
                            </span>
                            Pendahuluan
                        </h2>
                        <div className="text-[var(--glass-text-muted)] leading-relaxed text-base md:text-lg">
                            <p>
                                Dengan mengakses website ini dan menggunakan layanan desain grafis kami, Anda menyetujui untuk terikat dengan Syarat Layanan ini, serta patuh terhadap semua hukum dan peraturan yang berlaku. Jika Anda tidak setuju dengan salah satu syarat ini, Anda dilarang menggunakan atau mengakses situs ini dan layanannya.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent my-12" />

                    {/* Section 2 */}
                    <div id="services" className="scroll-mt-32 relative group">
                        <div className="absolute -inset-x-6 -inset-y-4 bg-transparent group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.02] rounded-3xl transition-colors duration-500 -z-10" />
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--glass-text)] mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--site-primary)]/20 to-transparent text-[var(--site-primary)] border border-[var(--site-primary)]/20">
                                2
                            </span>
                            Layanan Desain
                        </h2>
                        <div className="text-[var(--glass-text-muted)] leading-relaxed text-base md:text-lg">
                            <p>
                                Layanan utama kami meliputi pembuatan karya desain grafis kustom (seperti identitas merek, desain UI/UX, ilustrasi, materi sosial media, dll) yang rincian pekerjaannya—termasuk ruang lingkup, durasi, dan harga—disepakati melalui komunikasi tertulis sebelum proyek secara resmi dimulai.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent my-12" />

                    {/* Section 3 */}
                    <div id="revisions" className="scroll-mt-32 relative group">
                        <div className="absolute -inset-x-6 -inset-y-4 bg-transparent group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.02] rounded-3xl transition-colors duration-500 -z-10" />
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--glass-text)] mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-transparent text-green-400 border border-green-500/20">
                                3
                            </span>
                            Revisi dan Persetujuan
                        </h2>
                        <div className="text-[var(--glass-text-muted)] leading-relaxed text-base md:text-lg">
                            <p className="mb-4">
                                Setiap paket atau penawaran desain mencakup jumlah revisi tertentu yang relevan dan telah disepakati dari awal.
                            </p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-green-400 mt-1 flex-shrink-0" />
                                    <span>Revisi tambahan di luar batas kesepakatan awal dapat dikenakan biaya ekstra.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-green-400 mt-1 flex-shrink-0" />
                                    <span>Proyek dianggap sepenuhnya selesai ketika Anda memberikan persetujuan akhir atau ketika batas waktu peninjauan telah lewat tanpa ada tanggapan lanjutan.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent my-12" />

                    {/* Section 4 */}
                    <div id="payment" className="scroll-mt-32 relative group">
                        <div className="absolute -inset-x-6 -inset-y-4 bg-transparent group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.02] rounded-3xl transition-colors duration-500 -z-10" />
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--glass-text)] mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-transparent text-yellow-400 border border-yellow-500/20">
                                4
                            </span>
                            Kebijakan Pembayaran & Pengembalian Dana
                        </h2>
                        <div className="text-[var(--glass-text-muted)] leading-relaxed text-base md:text-lg">
                            <div className="glass-panel p-6 rounded-2xl border-l-4 border-yellow-500 bg-black/5 dark:bg-white/5 space-y-4">
                                <p><strong>Uang Muka (DP):</strong> Pembayaran Down Payment sebesar angka kesepakatan (umumnya 50%) diperlukan demi mengamankan slot sebelum riset dan eksekusi draf desain dimulai.</p>
                                <p><strong>Pelunasan:</strong> Sisa tagihan wajib diselesaikan secara penuh sebelum aset master (source files beresolusi tinggi) diserahkan final kepada Anda.</p>
                                <p className="text-yellow-400"><strong>Non-Refundable:</strong> DP tidak dapat dikembalikan jika proyek dibatalkan secara sepihak oleh klien saat pengerjaan konsep dan draf sudah dilangsungkan.</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent my-12" />

                    {/* Section 5 */}
                    <div id="haki" className="scroll-mt-32 relative group">
                        <div className="absolute -inset-x-6 -inset-y-4 bg-transparent group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.02] rounded-3xl transition-colors duration-500 -z-10" />
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--glass-text)] mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent text-blue-400 border border-blue-500/20">
                                5
                            </span>
                            Hak Kekayaan Intelektual (HAKI)
                        </h2>
                        <div className="text-[var(--glass-text-muted)] leading-relaxed text-base md:text-lg">
                            <p>
                                Setelah pelunasan pembayaran penuh diterima, hak guna (License) aset desain otomatis beralih dan sepenuhnya merepresentasikan identitas perusahaan/kampanye Anda sesuai persetujuan. Namun, sebagai desainer orisinal, kami secara mendasar memegang hak moral untuk menggunakan nama proyek atau hasil visualnya secara terbatas di dalam etalase portofolio profesional kami (kecuali jika ada perjanjian NDA).
                            </p>
                            <p className="mt-4">
                                File asli operasional (source file seperti .PSD, .AI, .FIG) hanya akan disertakan jika secara eksplisit tercantum dalam paket layanan awal yang telah disepakati atau apabila dibeli/ditagihkan secara terpisah.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent my-12" />

                    {/* Section 6 */}
                    <div id="disclaimer" className="scroll-mt-32 relative group">
                        <div className="absolute -inset-x-6 -inset-y-4 bg-transparent group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.02] rounded-3xl transition-colors duration-500 -z-10" />
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--glass-text)] mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-transparent text-red-400 border border-red-500/20">
                                6
                            </span>
                            Penafian (Disclaimer)
                        </h2>
                        <div className="text-[var(--glass-text-muted)] leading-relaxed text-base md:text-lg">
                            <p>
                                Kami tidak bertanggung jawab secara hukum maupun materiil atas kerugian yang mungkin timbul akibat penerapan desain tersebut oleh perusahaan di ranah publik atau pasar terbuka. Termasuk namun tidak terbatas pada klaim pelanggaran hak cipta tak sengaja dari materi referensi eksklusif, tipografi, elemen, atau klaim iklan yang diberikan langsung oleh klien agar kami cantumkan ke dalam bahan desain.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
