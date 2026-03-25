"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    CheckCircle2,
    DownloadCloud,
    FileText,
    ImageIcon,
    Loader2,
    Package,
    Palette,
    PlayCircle,
    Search,
    SlidersHorizontal,
    Sparkles,
    Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { purchaseShopItemWithRunes, toggleEquipItem } from "@/lib/actions/inventory.actions";

type CatalogProduct = {
    id: string;
    title: string;
    description?: string | null;
    slug?: string | null;
    category?: string | null;
    kind?: "digital" | "cosmetic";
    collection?: string | null;
    coverImage?: string | null;
    currency?: string | null;
    price?: number;
    priceRunes?: number;
    priceIdr?: number;
    owned?: boolean;
    equipped?: boolean;
    customizable?: boolean;
    customizationHint?: string | null;
    type?: string | null;
    value?: string | null;
};

type CollectionFilter = "ALL" | "COSMETIC" | "DIGITAL";
type SortMode = "featured" | "price-low" | "price-high" | "name";

const collectionTabs = [
    { id: "ALL" as const, label: "Semua", desc: "Digital goods + cosmetics" },
    { id: "COSMETIC" as const, label: "Cosmetics", desc: "Frame, backdrop, custom style" },
    { id: "DIGITAL" as const, label: "Digital", desc: "Asset, ebook, course" },
];

const sortOptions = [
    { id: "featured" as const, label: "Paling Menarik" },
    { id: "price-low" as const, label: "Harga Terendah" },
    { id: "price-high" as const, label: "Harga Tertinggi" },
    { id: "name" as const, label: "Nama A-Z" },
];

const getPrice = (product: CatalogProduct) => product.kind === "cosmetic"
    ? (product.priceRunes || 0)
    : (product.priceIdr || product.price || 0);

const getFeaturedScore = (product: CatalogProduct) =>
    (product.customizable ? 30 : 0)
    + (product.collection === "COSMETIC" ? 20 : 0)
    + (product.owned ? 8 : 0)
    + (product.category === "FRAME" ? 10 : 0)
    + getPrice(product) / 100;

export default function DigitalProductsClient({
    products,
    currentUserId,
    currentUsername,
    initialUserPoints = 0,
}: {
    products: CatalogProduct[];
    currentUserId?: string;
    currentUsername?: string;
    initialUserPoints?: number;
}) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearch = useDeferredValue(searchQuery);
    const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>("ALL");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [sortMode, setSortMode] = useState<SortMode>("featured");
    const [catalog, setCatalog] = useState(products);
    const [userPoints, setUserPoints] = useState(initialUserPoints);
    const [busyProductId, setBusyProductId] = useState<string | null>(null);
    const customizationHref = currentUsername ? `/profile/${currentUsername}?tab=inventory` : "/inventory";
    const primaryButton = "bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20";

    const scopedCatalog = useMemo(() => catalog.filter((product) => (
        collectionFilter === "ALL" || product.collection === collectionFilter
    )), [catalog, collectionFilter]);

    const categories = useMemo(() => Array.from(new Set(
        scopedCatalog.map((product) => product.category).filter(Boolean)
    )) as string[], [scopedCatalog]);

    const filteredProducts = useMemo(() => {
        const items = scopedCatalog.filter((product) => {
            const matchesSearch = !deferredSearch.trim()
                || product.title.toLowerCase().includes(deferredSearch.toLowerCase())
                || product.description?.toLowerCase().includes(deferredSearch.toLowerCase());
            const matchesCategory = filterCategory === "ALL" || product.category === filterCategory;
            return matchesSearch && matchesCategory;
        });

        return items.sort((a, b) => {
            if (sortMode === "price-low") return getPrice(a) - getPrice(b);
            if (sortMode === "price-high") return getPrice(b) - getPrice(a);
            if (sortMode === "name") return a.title.localeCompare(b.title);
            return getFeaturedScore(b) - getFeaturedScore(a);
        });
    }, [scopedCatalog, deferredSearch, filterCategory, sortMode]);

    const featured = useMemo(() => [...catalog].sort((a, b) => getFeaturedScore(b) - getFeaturedScore(a))[0], [catalog]);
    const stats = useMemo(() => ({
        total: catalog.length,
        cosmetics: catalog.filter((product) => product.collection === "COSMETIC").length,
        digital: catalog.filter((product) => product.collection === "DIGITAL").length,
        custom: catalog.filter((product) => product.customizable).length,
    }), [catalog]);

    const getCategoryIcon = (category: string) => {
        if (category === "EBOOK") return <FileText size={16} />;
        if (category === "COURSE") return <PlayCircle size={16} />;
        if (category === "ASSET") return <DownloadCloud size={16} />;
        if (category === "FRAME") return <Sparkles size={16} />;
        if (category === "BACKGROUND") return <Palette size={16} />;
        return <Package size={16} />;
    };

    const renderMedia = (product: CatalogProduct) => {
        if (product.kind === "cosmetic" && product.type === "FRAME") {
            const ringClass = product.value === "custom-color" ? "from-pink-500 via-orange-400 to-amber-300" : product.value;
            return (
                <div className="relative flex h-full w-full items-center justify-center">
                    <div className={`absolute h-32 w-32 rounded-full bg-gradient-to-br ${ringClass || "from-slate-400 to-slate-600"} opacity-35 blur-2xl`} />
                    <div className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br p-2 ${ringClass || "from-slate-400 to-slate-600"}`}>
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-900">
                            <ImageIcon size={30} />
                        </div>
                    </div>
                </div>
            );
        }

        if (product.kind === "cosmetic") {
            const bgClass = product.value === "custom-color"
                ? "from-pink-500 via-purple-500 to-cyan-400"
                : product.value === "custom-image"
                    ? "from-slate-900 via-slate-700 to-slate-500"
                    : product.value;
            return (
                <div className="flex h-full w-full items-center justify-center p-5">
                    <div className={`relative h-full w-full rounded-[1.75rem] bg-gradient-to-br ${bgClass || "from-slate-200 to-slate-500"} p-4`}>
                        <div className="h-full w-full rounded-[1.25rem] border border-white/30 bg-white/20 backdrop-blur-md" />
                    </div>
                </div>
            );
        }

        if (product.coverImage) {
            return <Image src={product.coverImage} alt={product.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />;
        }

        return <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-zinc-600"><Package size={48} /></div>;
    };

    const handleCosmeticPurchase = async (product: CatalogProduct) => {
        if (!currentUserId) return toast.error("Login dulu untuk membeli item kosmetik.");
        if ((product.priceRunes || 0) > userPoints) return toast.error(`Rune kamu belum cukup. Butuh ${product.priceRunes} rune.`);

        setBusyProductId(product.id);
        try {
            const result = await purchaseShopItemWithRunes(currentUserId, product.id);
            if (!result.success) return toast.error(result.error || "Gagal membeli item.");
            setUserPoints((prev) => prev - (product.priceRunes || 0));
            setCatalog((prev) => prev.map((item) => item.id === product.id ? { ...item, owned: true } : item));
            toast.success("Item berhasil dibeli. Kamu bisa equip atau custom dari inventory profil.");
            router.refresh();
        } finally {
            setBusyProductId(null);
        }
    };

    const handleToggleEquip = async (product: CatalogProduct) => {
        if (!currentUserId || !product.type || !product.value) return;
        setBusyProductId(product.id);
        try {
            const result = await toggleEquipItem(currentUserId, product.value, product.type as "FRAME" | "BACKGROUND", Boolean(product.equipped));
            if (!result.success) return toast.error(result.error || "Gagal mengubah equipment.");
            setCatalog((prev) => prev.map((item) => {
                if (item.kind !== "cosmetic" || item.type !== product.type) return item;
                return item.id === product.id ? { ...item, equipped: !product.equipped } : { ...item, equipped: false };
            }));
            toast.success(product.equipped ? "Item berhasil dilepas." : "Item berhasil dipakai.");
            router.refresh();
        } finally {
            setBusyProductId(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-8 pb-8">
            <section className="relative overflow-hidden rounded-[2.75rem] border border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.68))] p-6 shadow-[0_40px_120px_-50px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(8,19,29,0.9),rgba(8,19,29,0.72))] sm:p-8 xl:p-10">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-[var(--site-button)]/18 blur-[90px]" />
                    <div className="absolute right-0 top-16 h-80 w-80 rounded-full bg-[var(--site-accent)]/16 blur-[110px]" />
                    <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.045] mix-blend-overlay" />
                </div>

                <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_380px]">
                    <div className="space-y-7">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--site-button)]/15 bg-[var(--site-button)]/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[var(--site-secondary)]">
                            <Sparkles size={14} />
                            Curated Digital Store
                        </span>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-950 dark:text-white sm:text-5xl xl:text-7xl">
                                Store premium untuk aset digital dan <span className="bg-gradient-to-r from-[var(--site-button-prev)] via-[var(--site-accent)] to-[var(--site-button-next)] bg-clip-text text-transparent">identitas visual profil</span>.
                            </h1>
                            <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                                Experience baru yang lebih fokus, interaktif, dan mudah dijelajahi. User bisa cepat memahami koleksi, membedakan cosmetic vs digital goods, lalu beli atau equip tanpa friksi.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {collectionTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setCollectionFilter(tab.id); setFilterCategory("ALL"); }}
                                    className={`rounded-[1.75rem] border p-4 text-left transition-all ${collectionFilter === tab.id ? `${primaryButton} border-transparent` : "border-slate-200/80 bg-white/75 text-slate-700 shadow-sm hover:border-[var(--site-button)]/25 hover:bg-[var(--site-button)]/5 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"}`}
                                >
                                    <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${collectionFilter === tab.id ? "text-[var(--site-button-text)]/70" : "text-slate-400 dark:text-slate-500"}`}>{tab.label}</p>
                                    <p className={`mt-3 text-sm leading-6 ${collectionFilter === tab.id ? "text-[var(--site-button-text)]/85" : "text-slate-500 dark:text-slate-400"}`}>{tab.desc}</p>
                                </button>
                            ))}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-4">
                            {[
                                { label: "Total item", value: stats.total },
                                { label: "Cosmetics", value: stats.cosmetics },
                                { label: "Digital", value: stats.digital },
                                { label: "Custom ready", value: stats.custom },
                            ].map((metric) => (
                                <div key={metric.label} className="rounded-[1.75rem] border border-white/55 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">{metric.label}</p>
                                    <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">{metric.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button onClick={() => document.getElementById("digitalproducts-catalog")?.scrollIntoView({ behavior: "smooth" })} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black transition hover:-translate-y-0.5 ${primaryButton}`}>
                                Jelajahi Store <ArrowRight size={16} />
                            </button>
                            <Link href={currentUserId ? customizationHref : "/login"} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--site-button)]/20 bg-white/75 px-6 py-4 text-sm font-bold text-slate-700 transition hover:border-[var(--site-button)]/35 hover:bg-[var(--site-button)]/5 hover:text-[var(--site-secondary)] dark:bg-white/5 dark:text-slate-200">
                                <Palette size={16} />
                                {currentUserId ? "Buka Inventory & Customizer" : "Login Untuk Membeli"}
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[2.2rem] border border-white/60 bg-white/80 p-5 shadow-[0_36px_120px_-60px_rgba(15,23,42,0.4)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 pb-4 dark:border-white/10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Spotlight</p>
                                <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">Hero pick</h2>
                            </div>
                            <div className="rounded-2xl bg-[var(--site-button)]/10 px-4 py-3 text-right">
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--site-secondary)]">Rune</p>
                                <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{currentUserId ? userPoints.toLocaleString("id-ID") : "Guest"}</p>
                            </div>
                        </div>

                        {featured && (
                            <div className="mt-5 space-y-4">
                                <div className="group relative aspect-[16/10] overflow-hidden rounded-[1.7rem] bg-slate-100 dark:bg-slate-900">
                                    {renderMedia(featured)}
                                    <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-white">
                                        <Star size={12} />
                                        Featured
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--site-secondary)]">{featured.category}</p>
                                    <h3 className="mt-2 text-2xl font-black leading-tight text-slate-950 dark:text-white">{featured.title}</h3>
                                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{featured.description}</p>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Price</p>
                                        <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                                            {getPrice(featured).toLocaleString("id-ID")}
                                            <span className="ml-2 text-xs font-bold text-slate-400">{featured.kind === "cosmetic" ? "RUNES" : (featured.currency || "IDR")}</span>
                                        </p>
                                    </div>
                                    <button onClick={() => document.getElementById("digitalproducts-catalog")?.scrollIntoView({ behavior: "smooth" })} className="rounded-2xl border border-[var(--site-button)]/20 bg-[var(--site-button)]/10 px-4 py-3 text-sm font-bold text-[var(--site-secondary)] transition hover:border-[var(--site-button)]/35 hover:bg-[var(--site-button)]/15">
                                        Lihat katalog
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section id="digitalproducts-catalog" className="space-y-5 rounded-[2.4rem] border border-slate-200/70 bg-white/75 p-5 shadow-[0_35px_120px_-70px_rgba(15,23,42,0.4)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 sm:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[var(--site-secondary)]">Interactive catalog</p>
                        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">{filteredProducts.length} item siap dijelajahi</h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] xl:min-w-[520px]">
                        <label className="group relative block">
                            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--site-secondary)]" />
                            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari produk, cosmetic, atau asset favoritmu..." className="h-14 w-full rounded-2xl border border-slate-200/80 bg-white/85 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--site-button)]/35 dark:border-white/10 dark:bg-black/10 dark:text-white" />
                        </label>
                        <label className="relative block">
                            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="h-14 w-full appearance-none rounded-2xl border border-slate-200/80 bg-white/85 px-4 pr-12 text-sm font-semibold text-slate-700 outline-none transition focus:border-[var(--site-button)]/35 dark:border-white/10 dark:bg-black/10 dark:text-slate-200">
                                {sortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                            </select>
                            <SlidersHorizontal size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </label>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setFilterCategory("ALL")} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${filterCategory === "ALL" ? `${primaryButton} border-transparent` : "border border-slate-200/80 bg-white/70 text-slate-600 hover:border-[var(--site-button)]/25 hover:bg-[var(--site-button)]/5 hover:text-[var(--site-secondary)] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"}`}>
                        <Package size={14} /> Semua kategori
                    </button>
                    {categories.map((category) => (
                        <button key={category} onClick={() => setFilterCategory(category)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${filterCategory === category ? `${primaryButton} border-transparent` : "border border-slate-200/80 bg-white/70 text-slate-600 hover:border-[var(--site-button)]/25 hover:bg-[var(--site-button)]/5 hover:text-[var(--site-secondary)] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"}`}>
                            {getCategoryIcon(category)} {category}
                        </button>
                    ))}
                </div>
            </section>

            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product, index) => {
                        const isCosmetic = product.kind === "cosmetic";
                        const isBusy = busyProductId === product.id;
                        const canAfford = (product.priceRunes || 0) <= userPoints;

                        return (
                            <motion.article key={product.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: index * 0.04 }} whileHover={{ y: -8 }} className="group overflow-hidden rounded-[2.2rem] border border-slate-200/70 bg-white/85 shadow-[0_35px_80px_-52px_rgba(15,23,42,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                                <div className="relative aspect-[4/3] overflow-hidden border-b border-slate-200/70 bg-slate-100 dark:border-white/10 dark:bg-slate-900">
                                    {renderMedia(product)}
                                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-white/88 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-slate-800 shadow-lg dark:bg-black/60 dark:text-white">
                                            {getCategoryIcon(product.category || "")}
                                            {product.category}
                                        </span>
                                        <div className="flex flex-wrap justify-end gap-2">
                                            {product.customizable && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"><Palette size={11} /> Custom</span>}
                                            {isCosmetic && product.owned && <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${product.equipped ? `${primaryButton} shadow-none` : "bg-black/70 text-white"}`}>{product.equipped ? "Equipped" : "Owned"}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col p-6">
                                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">{product.collection === "COSMETIC" ? "Profile Cosmetic" : "Digital Product"}</p>
                                    <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.03em] text-slate-950 dark:text-white">{product.title}</h3>
                                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{product.description || "No description provided."}</p>
                                    {isCosmetic && product.customizationHint && <div className="mt-5 rounded-2xl border border-[var(--site-button)]/15 bg-[var(--site-button)]/8 px-4 py-3 text-sm leading-6 text-[var(--site-secondary)]">{product.customizationHint}</div>}

                                    <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-200/70 pt-6 dark:border-white/10">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Price</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                {isCosmetic && <Sparkles size={18} className="text-[var(--site-secondary)]" />}
                                                <span className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">{getPrice(product).toLocaleString("id-ID")}</span>
                                                <span className="text-xs font-bold uppercase text-slate-400">{isCosmetic ? "RUNES" : (product.currency || "IDR")}</span>
                                            </div>
                                        </div>
                                        {!isCosmetic && <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--site-button)]/10 text-[var(--site-secondary)] transition group-hover:translate-x-1"><ArrowRight size={18} /></div>}
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        {isCosmetic ? (
                                            <>
                                                {!product.owned ? (
                                                    <button onClick={() => handleCosmeticPurchase(product)} disabled={isBusy || !currentUserId || !canAfford} className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${primaryButton}`}>
                                                        {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                                        <span>{currentUserId ? `Beli ${product.priceRunes} Rune` : "Login untuk beli"}</span>
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleToggleEquip(product)} disabled={isBusy} className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black transition ${product.equipped ? "border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "border border-[var(--site-button)]/18 bg-[var(--site-button)]/5 text-[var(--site-secondary)] hover:border-[var(--site-button)]/35 hover:bg-[var(--site-button)]/10"}`}>
                                                        {isBusy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                                        <span>{product.equipped ? "Lepas Item" : "Equip Sekarang"}</span>
                                                    </button>
                                                )}
                                                {product.owned && product.customizable && <Link href={customizationHref} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[var(--site-button)]/35 hover:bg-[var(--site-button)]/5 hover:text-[var(--site-secondary)] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"><Palette size={16} /> <span>Buka Customizer Avatar</span></Link>}
                                            </>
                                        ) : (
                                            <Link href={`/digitalproducts/${product.slug}`} className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black transition hover:-translate-y-0.5 ${primaryButton}`}>
                                                <span>Lihat Detail</span>
                                                <ArrowRight size={16} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-[2.5rem] border border-dashed border-slate-200/80 bg-white/70 px-6 py-20 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--site-button)]/10 text-[var(--site-secondary)]"><Package size={32} /></div>
                    <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">Tidak ada item yang cocok</h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">Coba ubah collection, kategori, atau kata kunci pencarian. Experience baru ini dibuat agar user tetap cepat menemukan jalur eksplorasi yang paling relevan.</p>
                    <button onClick={() => { setSearchQuery(""); setCollectionFilter("ALL"); setFilterCategory("ALL"); setSortMode("featured"); }} className={`mt-8 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 ${primaryButton}`}>
                        Reset Explorasi <ArrowRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
