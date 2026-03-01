"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Download, CreditCard, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createCheckoutSession } from "@/lib/actions/checkout.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DigitalProductDetailClient({ product }: { product: any }) {
    const router = useRouter();
    const [isBuying, setIsBuying] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState<"MIDTRANS" | "STRIPE">(product.currency === "IDR" ? "MIDTRANS" : "STRIPE");

    const handlePurchase = async () => {
        setIsBuying(true);
        try {
            const result = await createCheckoutSession(product.id, selectedGateway) as any;
            if (result.success && result.url) {
                // Redirect to payment gateway URL
                window.location.href = result.url;
            } else {
                toast.error(result.error || "Checkout failed. Please try again or ensure you are logged in.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred during checkout.");
        } finally {
            setIsBuying(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Navigation */}
            <Link
                href="/digitalproducts"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-medium text-sm"
            >
                <ArrowLeft size={16} />
                Back to Catalog
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Visuals Column */}
                <div className="lg:col-span-7 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200/50 dark:border-white/10"
                    >
                        {product.coverImage ? (
                            <Image
                                src={product.coverImage}
                                alt={product.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-slate-400 font-bold">No Image Available</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </motion.div>

                    {/* Features section (Mocked for design depth) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-white/60 dark:bg-[#1A1A1A]/40 backdrop-blur-xl border border-slate-200/70 dark:border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Download size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">Instant</p>
                                <p className="text-[10px] text-slate-500 dark:text-gray-400">Digital Delivery</p>
                            </div>
                        </div>
                        <div className="bg-white/60 dark:bg-[#1A1A1A]/40 backdrop-blur-xl border border-slate-200/70 dark:border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">Secure</p>
                                <p className="text-[10px] text-slate-500 dark:text-gray-400">Safe Checkout</p>
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-1 bg-white/60 dark:bg-[#1A1A1A]/40 backdrop-blur-xl border border-slate-200/70 dark:border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">Premium</p>
                                <p className="text-[10px] text-slate-500 dark:text-gray-400">Quality Verified</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details & Action Column */}
                <div className="lg:col-span-5 relative">
                    <div className="lg:sticky lg:top-28 space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--site-secondary)]/10 text-[var(--site-secondary)] text-xs font-black tracking-widest uppercase mb-4 border border-[var(--site-secondary)]/20">
                                {product.category}
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                {product.title}
                            </h1>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-gray-300">
                            <p className="whitespace-pre-line leading-relaxed">
                                {product.description || "No detailed description provided for this product."}
                            </p>
                        </div>

                        {/* Purchase Card */}
                        <div className="bg-white/90 dark:bg-[#111111]/80 backdrop-blur-3xl border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-[var(--site-accent)]/10 dark:shadow-none">
                            <div className="flex items-end gap-2 mb-6">
                                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {product.currency === "IDR" ? "Rp " : "$"}{product.price.toLocaleString('id-ID')}
                                </span>
                                <span className="text-sm font-bold text-slate-400 mb-2 uppercase">{product.currency}</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700 dark:text-gray-300">Full lifetime access to this product</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700 dark:text-gray-300">Free future updates included</span>
                                </div>
                            </div>

                            {/* Payment Provider Selection */}
                            <div className="mb-6 space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Select Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {product.currency === "IDR" && (
                                        <button
                                            onClick={() => setSelectedGateway("MIDTRANS")}
                                            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${selectedGateway === "MIDTRANS" ? "border-[var(--site-secondary)] bg-[var(--site-secondary)]/5 text-[var(--site-secondary)]" : "border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300 dark:hover:border-white/20"}`}
                                        >
                                            <CreditCard size={24} />
                                            <span className="text-xs font-bold">QRIS / Bank</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedGateway("STRIPE")}
                                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${selectedGateway === "STRIPE" ? "border-blue-500 bg-blue-500/5 text-blue-500" : "border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300 dark:hover:border-white/20"}`}
                                    >
                                        <CreditCard size={24} />
                                        <span className="text-xs font-bold">Card (Stripe)</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={isBuying}
                                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[var(--site-button)] text-[var(--site-button-text)] font-black text-lg shadow-[0_8px_32px_var(--site-accent)]/20 hover:shadow-[0_16px_48px_var(--site-accent)]/30 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none"
                            >
                                {isBuying ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                                {isBuying ? "Processing..." : "Buy Now"}
                            </button>
                            <p className="text-center text-[11px] text-slate-400 mt-4">
                                Payments are securely processed. Instant delivery via your inventory upon successful payment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
