import TermsClient from "@/components/Legal/TermsClient";
import { getDictionary } from "@/get-dictionary";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Syarat Layanan | Portofolio Desain Grafis",
    description: "Syarat Layanan (Terms of Service) untuk layanan desain grafis.",
};

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary((lang || 'en') as "en" | "id");

    return (
        <main className="min-h-screen relative overflow-hidden pt-32 pb-20">
            {/* Background premium ambient gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--site-primary)]/5 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--site-secondary)]/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-6xl">
                <div className="max-w-3xl mb-16 animate-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-white/90 dark:to-gray-500">
                        Syarat Layanan
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--glass-text-muted)] font-light leading-relaxed">
                        Panduan, perjanjian operasional, dan komitmen profesional antara Anda (Klien) dan kami (Desainer) untuk alur kerja yang berkualitas, transparan, dan terpercaya.
                    </p>
                </div>

                <TermsClient />

                <div className="mt-20 pt-8 border-t border-black/10 dark:border-white/10 flex justify-between items-center text-sm text-[var(--glass-text-muted)]">
                    <p>Berlaku mulai: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>© {new Date().getFullYear()} Hak Cipta Dilindungi.</p>
                </div>
            </div>
        </main>
    );
}
