export type CosmeticShopItemType = "FRAME" | "BACKGROUND";

export type DefaultCosmeticShopItem = {
    name: string;
    description: string;
    price: number;
    type: CosmeticShopItemType;
    category: "cosmetics";
    value: string;
    icon?: string | null;
};

export const DEFAULT_COSMETIC_SHOP_ITEMS: DefaultCosmeticShopItem[] = [
    {
        name: "Chromaframe Border",
        description: "Border avatar premium yang bisa kamu warnai sendiri. Saat di-equip, border ini tampil di profile, komentar, chat, dan area avatar lainnya.",
        price: 500,
        type: "FRAME",
        category: "cosmetics",
        value: "custom-color",
        icon: null,
    },
    {
        name: "Aurora Pulse Frame",
        description: "Frame gradasi teal-emerald yang memberi aura bersih dan modern pada foto profilmu.",
        price: 320,
        type: "FRAME",
        category: "cosmetics",
        value: "from-cyan-400 via-teal-400 to-emerald-500",
        icon: null,
    },
    {
        name: "Solar Ember Frame",
        description: "Frame hangat bernuansa emas, oranye, dan rose untuk tampilan yang lebih berani.",
        price: 340,
        type: "FRAME",
        category: "cosmetics",
        value: "from-amber-400 via-orange-500 to-rose-500",
        icon: null,
    },
    {
        name: "Nebula Halo Frame",
        description: "Frame neon ungu-biru dengan karakter sci-fi yang menonjol di avatar kecil maupun besar.",
        price: 420,
        type: "FRAME",
        category: "cosmetics",
        value: "from-fuchsia-500 via-violet-500 to-sky-500",
        icon: null,
    },
    {
        name: "Custom Profile Backdrop",
        description: "Unlock background profil berwarna custom agar kartu profilmu bisa disesuaikan dengan warna favorit.",
        price: 450,
        type: "BACKGROUND",
        category: "cosmetics",
        value: "custom-color",
        icon: null,
    },
    {
        name: "Aurora Mist Backdrop",
        description: "Background profil lembut dengan campuran cyan, emerald, dan blue untuk nuansa yang segar.",
        price: 280,
        type: "BACKGROUND",
        category: "cosmetics",
        value: "from-emerald-400 via-cyan-500 to-blue-600",
        icon: null,
    },
    {
        name: "Midnight Flux Backdrop",
        description: "Background gelap dramatis dengan campuran indigo, slate, dan violet agar profil terasa lebih sinematik.",
        price: 310,
        type: "BACKGROUND",
        category: "cosmetics",
        value: "from-indigo-600 via-slate-900 to-fuchsia-500",
        icon: null,
    },
    {
        name: "Custom Image Backdrop",
        description: "Buka slot upload background profil sendiri agar kamu bisa memakai gambar personal sebagai backdrop.",
        price: 650,
        type: "BACKGROUND",
        category: "cosmetics",
        value: "custom-image",
        icon: null,
    },
];

export const getCosmeticShopSlug = (name: string) => {
    return `cosmetic-${name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`;
};
