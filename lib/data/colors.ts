export type ColorItem = {
    id: string;
    name: string;
    hex: string;
    rgb: string;
    cmyk: string;
    family: "Red" | "Orange" | "Yellow" | "Green" | "Teal" | "Blue" | "Purple" | "Pink" | "Brown" | "Gray" | "White" | "Black";
};

// Helper function to calculate CMYK from HEX (for consistency, though we hardcode them here for speed)
export const hexToCMYK = (hex: string): string => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    if (r === 0 && g === 0 && b === 0) {
        return "0%, 0%, 0%, 100%";
    }

    let c = 1 - r / 255;
    let m = 1 - g / 255;
    let y = 1 - b / 255;

    let k = Math.min(c, Math.min(m, y));

    c = Math.round(((c - k) / (1 - k)) * 100) || 0;
    m = Math.round(((m - k) / (1 - k)) * 100) || 0;
    y = Math.round(((y - k) / (1 - k)) * 100) || 0;
    k = Math.round(k * 100) || 0;

    return `${c}%, ${m}%, ${y}%, ${k}%`;
};

// Helper function to calculate RGB from HEX
export const hexToRGB = (hex: string): string => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
};

// A curated list of beautiful, commonly used colors for designers
export const colorsData: ColorItem[] = [
    // Reds
    { id: "r1", name: "Crimson", hex: "#DC143C", rgb: "rgb(220, 20, 60)", cmyk: "0%, 91%, 73%, 14%", family: "Red" },
    { id: "r2", name: "Firebrick", hex: "#B22222", rgb: "rgb(178, 34, 34)", cmyk: "0%, 81%, 81%, 30%", family: "Red" },
    { id: "r3", name: "Indian Red", hex: "#CD5C5C", rgb: "rgb(205, 92, 92)", cmyk: "0%, 55%, 55%, 20%", family: "Red" },
    { id: "r4", name: "Light Coral", hex: "#F08080", rgb: "rgb(240, 128, 128)", cmyk: "0%, 47%, 47%, 6%", family: "Red" },
    { id: "r5", name: "Salmon", hex: "#FA8072", rgb: "rgb(250, 128, 114)", cmyk: "0%, 49%, 54%, 2%", family: "Red" },
    { id: "r6", name: "Tomato", hex: "#FF6347", rgb: "rgb(255, 99, 71)", cmyk: "0%, 61%, 72%, 0%", family: "Red" },
    { id: "r7", name: "Maroon", hex: "#800000", rgb: "rgb(128, 0, 0)", cmyk: "0%, 100%, 100%, 50%", family: "Red" },
    { id: "r8", name: "Rose", hex: "#FF007F", rgb: "rgb(255, 0, 127)", cmyk: "0%, 100%, 50%, 0%", family: "Red" },

    // Oranges
    { id: "o1", name: "Coral", hex: "#FF7F50", rgb: "rgb(255, 127, 80)", cmyk: "0%, 50%, 69%, 0%", family: "Orange" },
    { id: "o2", name: "Dark Orange", hex: "#FF8C00", rgb: "rgb(255, 140, 0)", cmyk: "0%, 45%, 100%, 0%", family: "Orange" },
    { id: "o3", name: "Orange", hex: "#FFA500", rgb: "rgb(255, 165, 0)", cmyk: "0%, 35%, 100%, 0%", family: "Orange" },
    { id: "o4", name: "Gold", hex: "#FFD700", rgb: "rgb(255, 215, 0)", cmyk: "0%, 16%, 100%, 0%", family: "Orange" },
    { id: "o5", name: "Burlywood", hex: "#DEB887", rgb: "rgb(222, 184, 135)", cmyk: "0%, 17%, 39%, 13%", family: "Orange" },
    { id: "o6", name: "Chocolate", hex: "#D2691E", rgb: "rgb(210, 105, 30)", cmyk: "0%, 50%, 86%, 18%", family: "Orange" },
    { id: "o7", name: "Sienna", hex: "#A0522D", rgb: "rgb(160, 82, 45)", cmyk: "0%, 49%, 72%, 37%", family: "Orange" },

    // Yellows
    { id: "y1", name: "Yellow", hex: "#FFFF00", rgb: "rgb(255, 255, 0)", cmyk: "0%, 0%, 100%, 0%", family: "Yellow" },
    { id: "y2", name: "Khaki", hex: "#F0E68C", rgb: "rgb(240, 230, 140)", cmyk: "0%, 4%, 42%, 6%", family: "Yellow" },
    { id: "y3", name: "Goldenrod", hex: "#DAA520", rgb: "rgb(218, 165, 32)", cmyk: "0%, 24%, 85%, 15%", family: "Yellow" },
    { id: "y4", name: "Moccasin", hex: "#FFE4B5", rgb: "rgb(255, 228, 181)", cmyk: "0%, 11%, 29%, 0%", family: "Yellow" },
    { id: "y5", name: "Lemon Chiffon", hex: "#FFFACD", rgb: "rgb(255, 250, 205)", cmyk: "0%, 2%, 20%, 0%", family: "Yellow" },

    // Greens
    { id: "g1", name: "Green", hex: "#008000", rgb: "rgb(0, 128, 0)", cmyk: "100%, 0%, 100%, 50%", family: "Green" },
    { id: "g2", name: "Lime Green", hex: "#32CD32", rgb: "rgb(50, 205, 50)", cmyk: "76%, 0%, 76%, 20%", family: "Green" },
    { id: "g3", name: "Spring Green", hex: "#00FF7F", rgb: "rgb(0, 255, 127)", cmyk: "100%, 0%, 50%, 0%", family: "Green" },
    { id: "g4", name: "Sea Green", hex: "#2E8B57", rgb: "rgb(46, 139, 87)", cmyk: "67%, 0%, 37%, 45%", family: "Green" },
    { id: "g5", name: "Forest Green", hex: "#228B22", rgb: "rgb(34, 139, 34)", cmyk: "76%, 0%, 76%, 45%", family: "Green" },
    { id: "g6", name: "Olive", hex: "#808000", rgb: "rgb(128, 128, 0)", cmyk: "0%, 0%, 100%, 50%", family: "Green" },
    { id: "g7", name: "Dark Olive Green", hex: "#556B2F", rgb: "rgb(85, 107, 47)", cmyk: "21%, 0%, 56%, 58%", family: "Green" },

    // Teals & Cyans
    { id: "t1", name: "Teal", hex: "#008080", rgb: "rgb(0, 128, 128)", cmyk: "100%, 0%, 0%, 50%", family: "Teal" },
    { id: "t2", name: "Dark Cyan", hex: "#008B8B", rgb: "rgb(0, 139, 139)", cmyk: "100%, 0%, 0%, 45%", family: "Teal" },
    { id: "t3", name: "Light Sea Green", hex: "#20B2AA", rgb: "rgb(32, 178, 170)", cmyk: "82%, 0%, 4%, 30%", family: "Teal" },
    { id: "t4", name: "Cyan", hex: "#00FFFF", rgb: "rgb(0, 255, 255)", cmyk: "100%, 0%, 0%, 0%", family: "Teal" },
    { id: "t5", name: "Turquoise", hex: "#40E0D0", rgb: "rgb(64, 224, 208)", cmyk: "71%, 0%, 7%, 12%", family: "Teal" },
    { id: "t6", name: "Medium Turquoise", hex: "#48D1CC", rgb: "rgb(72, 209, 204)", cmyk: "66%, 0%, 2%, 18%", family: "Teal" },
    { id: "t7", name: "Cadet Blue", hex: "#5F9EA0", rgb: "rgb(95, 158, 160)", cmyk: "41%, 1%, 0%, 37%", family: "Teal" },

    // Blues
    { id: "b1", name: "Blue", hex: "#0000FF", rgb: "rgb(0, 0, 255)", cmyk: "100%, 100%, 0%, 0%", family: "Blue" },
    { id: "b2", name: "Medium Blue", hex: "#0000CD", rgb: "rgb(0, 0, 205)", cmyk: "100%, 100%, 0%, 20%", family: "Blue" },
    { id: "b3", name: "Dark Blue", hex: "#00008B", rgb: "rgb(0, 0, 139)", cmyk: "100%, 100%, 0%, 45%", family: "Blue" },
    { id: "b4", name: "Navy", hex: "#000080", rgb: "rgb(0, 0, 128)", cmyk: "100%, 100%, 0%, 50%", family: "Blue" },
    { id: "b5", name: "Royal Blue", hex: "#4169E1", rgb: "rgb(65, 105, 225)", cmyk: "71%, 53%, 0%, 12%", family: "Blue" },
    { id: "b6", name: "Dodger Blue", hex: "#1E90FF", rgb: "rgb(30, 144, 255)", cmyk: "88%, 44%, 0%, 0%", family: "Blue" },
    { id: "b7", name: "Deep Sky Blue", hex: "#00BFFF", rgb: "rgb(0, 191, 255)", cmyk: "100%, 25%, 0%, 0%", family: "Blue" },
    { id: "b8", name: "Steel Blue", hex: "#4682B4", rgb: "rgb(70, 130, 180)", cmyk: "61%, 28%, 0%, 29%", family: "Blue" },
    { id: "b9", name: "Cornflower Blue", hex: "#6495ED", rgb: "rgb(100, 149, 237)", cmyk: "58%, 37%, 0%, 7%", family: "Blue" },

    // Purples
    { id: "p1", name: "Purple", hex: "#800080", rgb: "rgb(128, 0, 128)", cmyk: "0%, 100%, 0%, 50%", family: "Purple" },
    { id: "p2", name: "Dark Magenta", hex: "#8B008B", rgb: "rgb(139, 0, 139)", cmyk: "0%, 100%, 0%, 45%", family: "Purple" },
    { id: "p3", name: "Indigo", hex: "#4B0082", rgb: "rgb(75, 0, 130)", cmyk: "42%, 100%, 0%, 49%", family: "Purple" },
    { id: "p4", name: "Dark Violet", hex: "#9400D3", rgb: "rgb(148, 0, 211)", cmyk: "30%, 100%, 0%, 17%", family: "Purple" },
    { id: "p5", name: "Blue Violet", hex: "#8A2BE2", rgb: "rgb(138, 43, 226)", cmyk: "39%, 81%, 0%, 11%", family: "Purple" },
    { id: "p6", name: "Medium Purple", hex: "#9370DB", rgb: "rgb(147, 112, 219)", cmyk: "33%, 49%, 0%, 14%", family: "Purple" },
    { id: "p7", name: "Amethyst", hex: "#9966CC", rgb: "rgb(153, 102, 204)", cmyk: "25%, 50%, 0%, 20%", family: "Purple" },
    { id: "p8", name: "Plum", hex: "#DDA0DD", rgb: "rgb(221, 160, 221)", cmyk: "0%, 28%, 0%, 13%", family: "Purple" },

    // Pinks
    { id: "pi1", name: "Pink", hex: "#FFC0CB", rgb: "rgb(255, 192, 203)", cmyk: "0%, 25%, 20%, 0%", family: "Pink" },
    { id: "pi2", name: "Hot Pink", hex: "#FF69B4", rgb: "rgb(255, 105, 180)", cmyk: "0%, 59%, 29%, 0%", family: "Pink" },
    { id: "pi3", name: "Deep Pink", hex: "#FF1493", rgb: "rgb(255, 20, 147)", cmyk: "0%, 92%, 42%, 0%", family: "Pink" },
    { id: "pi4", name: "Medium Violet Red", hex: "#C71585", rgb: "rgb(199, 21, 133)", cmyk: "0%, 89%, 33%, 22%", family: "Pink" },
    { id: "pi5", name: "Pale Violet Red", hex: "#DB7093", rgb: "rgb(219, 112, 147)", cmyk: "0%, 49%, 33%, 14%", family: "Pink" },

    // Browns
    { id: "br1", name: "Brown", hex: "#A52A2A", rgb: "rgb(165, 42, 42)", cmyk: "0%, 75%, 75%, 35%", family: "Brown" },
    { id: "br2", name: "Saddle Brown", hex: "#8B4513", rgb: "rgb(139, 69, 19)", cmyk: "0%, 50%, 86%, 45%", family: "Brown" },
    { id: "br3", name: "Peru", hex: "#CD853F", rgb: "rgb(205, 133, 63)", cmyk: "0%, 35%, 69%, 20%", family: "Brown" },
    { id: "br4", name: "Rosy Brown", hex: "#BC8F8F", rgb: "rgb(188, 143, 143)", cmyk: "0%, 24%, 24%, 26%", family: "Brown" },
    { id: "br5", name: "Sandy Brown", hex: "#F4A460", rgb: "rgb(244, 164, 96)", cmyk: "0%, 33%, 61%, 4%", family: "Brown" },

    // Grays
    { id: "gr1", name: "Black", hex: "#000000", rgb: "rgb(0, 0, 0)", cmyk: "0%, 0%, 0%, 100%", family: "Black" },
    { id: "gr2", name: "Dim Gray", hex: "#696969", rgb: "rgb(105, 105, 105)", cmyk: "0%, 0%, 0%, 59%", family: "Gray" },
    { id: "gr3", name: "Gray", hex: "#808080", rgb: "rgb(128, 128, 128)", cmyk: "0%, 0%, 0%, 50%", family: "Gray" },
    { id: "gr4", name: "Dark Gray", hex: "#A9A9A9", rgb: "rgb(169, 169, 169)", cmyk: "0%, 0%, 0%, 34%", family: "Gray" },
    { id: "gr5", name: "Silver", hex: "#C0C0C0", rgb: "rgb(192, 192, 192)", cmyk: "0%, 0%, 0%, 25%", family: "Gray" },
    { id: "gr6", name: "Light Gray", hex: "#D3D3D3", rgb: "rgb(211, 211, 211)", cmyk: "0%, 0%, 0%, 17%", family: "Gray" },
    { id: "gr7", name: "Slate Gray", hex: "#708090", rgb: "rgb(112, 128, 144)", cmyk: "22%, 11%, 0%, 44%", family: "Gray" },
    { id: "gr8", name: "Light Slate Gray", hex: "#778899", rgb: "rgb(119, 136, 153)", cmyk: "22%, 11%, 0%, 40%", family: "Gray" },
    { id: "w1", name: "White", hex: "#FFFFFF", rgb: "rgb(255, 255, 255)", cmyk: "0%, 0%, 0%, 0%", family: "White" },
    { id: "w2", name: "Snow", hex: "#FFFAFA", rgb: "rgb(255, 250, 250)", cmyk: "0%, 2%, 2%, 0%", family: "White" },
    { id: "w3", name: "Honeydew", hex: "#F0FFF0", rgb: "rgb(240, 255, 240)", cmyk: "6%, 0%, 6%, 0%", family: "White" },
    { id: "w4", name: "Mint Cream", hex: "#F5FFFA", rgb: "rgb(245, 255, 250)", cmyk: "4%, 0%, 2%, 0%", family: "White" },
    { id: "w5", name: "Azure", hex: "#F0FFFF", rgb: "rgb(240, 255, 255)", cmyk: "6%, 0%, 0%, 0%", family: "White" },
    { id: "w6", name: "Alice Blue", hex: "#F0F8FF", rgb: "rgb(240, 248, 255)", cmyk: "6%, 3%, 0%, 0%", family: "White" },
    { id: "w7", name: "Ghost White", hex: "#F8F8FF", rgb: "rgb(248, 248, 255)", cmyk: "3%, 3%, 0%, 0%", family: "White" },
    { id: "w8", name: "White Smoke", hex: "#F5F5F5", rgb: "rgb(245, 245, 245)", cmyk: "4%, 4%, 4%, 0%", family: "White" },
];

export type PaletteItem = {
    id: string;
    name: string;
    colors: string[]; // HEX codes
    tags: string[];
};

// 30+ Curated Color Palettes
export const palettesData: PaletteItem[] = [
    // Tech & Cyberpunk
    { id: "pl-1", name: "Cyberpunk Sunrise", colors: ["#F9C80E", "#F86624", "#EA3546", "#662E9B", "#43BCCD"], tags: ["Neon", "Cyberpunk", "Vibrant"] },
    { id: "pl-2", name: "Neon Nights", colors: ["#0B0C10", "#1F2833", "#C5C6C7", "#66FCF1", "#45A29E"], tags: ["Dark", "Neon", "Tech"] },
    { id: "pl-3", name: "Synthwave", colors: ["#FF007F", "#791E94", "#541388", "#2E0E87", "#0000FF"], tags: ["Retro", "Purple", "Pink"] },
    { id: "pl-4", name: "Matrix", colors: ["#000000", "#003B00", "#008F11", "#00FF41", "#E0FFE0"], tags: ["Green", "Dark", "Hacker"] },
    { id: "pl-5", name: "Vaporwave", colors: ["#FF71CE", "#01CDFE", "#05FFA1", "#B967FF", "#FFFB96"], tags: ["Pastel", "Retro", "Neon"] },

    // Corporate & Clean
    { id: "pl-6", name: "Modern Corporate", colors: ["#003049", "#D62828", "#F77F00", "#FCBF49", "#EAE2B7"], tags: ["Professional", "Warm"] },
    { id: "pl-7", name: "Trust Blue", colors: ["#EDF2F4", "#8D99AE", "#2B2D42", "#00509D", "#00296B"], tags: ["Blue", "Corporate", "Clean"] },
    { id: "pl-8", name: "Minimalist Gray", colors: ["#F8F9FA", "#E9ECEF", "#DEE2E6", "#CED4DA", "#ADB5BD"], tags: ["Neutral", "Light", "Clean"] },
    { id: "pl-9", name: "Dark Dashboard", colors: ["#121212", "#1E1E1E", "#2C2C2C", "#383838", "#4A4A4A"], tags: ["Dark UI", "Neutral"] },
    { id: "pl-10", name: "SaaS Clean", colors: ["#F4F7F6", "#87BFFF", "#3B82F6", "#1D4ED8", "#111827"], tags: ["Blue", "Light", "App"] },

    // Nature & Earth
    { id: "pl-11", name: "Forest Canopy", colors: ["#2C5F2D", "#97BC62FF", "#006400", "#228B22", "#ADFF2F"], tags: ["Green", "Nature", "Fresh"] },
    { id: "pl-12", name: "Ocean Deep", colors: ["#03045E", "#023E8A", "#0077B6", "#0096C7", "#00B4D8"], tags: ["Blue", "Ocean", "Calm"] },
    { id: "pl-13", name: "Desert Sands", colors: ["#EDC9AF", "#D2B48C", "#C19A6B", "#8B4513", "#A0522D"], tags: ["Brown", "Warm", "Earth"] },
    { id: "pl-14", name: "Sunset Glo", colors: ["#FF7B54", "#FFB26B", "#FFD56B", "#939B62", "#E85D04"], tags: ["Warm", "Sunset"] },
    { id: "pl-15", name: "Mountain Peak", colors: ["#4A4E69", "#9A8C98", "#C9ADA7", "#F2E9E4", "#22223B"], tags: ["Muted", "Purple", "Cool"] },

    // Pastels & Soft
    { id: "pl-16", name: "Pastel Dream", colors: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"], tags: ["Pastel", "Light", "Rainbow"] },
    { id: "pl-17", name: "Cotton Candy", colors: ["#FFC8DD", "#FFAFCC", "#BDE0FE", "#A2D2FF", "#FFFFFF"], tags: ["Pink", "Blue", "Sweet"] },
    { id: "pl-18", name: "Minty Fresh", colors: ["#D4F0F0", "#8FCACA", "#CCE2CB", "#B6CFB6", "#97C1A9"], tags: ["Mint", "Green", "Soft"] },
    { id: "pl-19", name: "Peachy", colors: ["#FFDAB9", "#FFCCB6", "#F3B0C3", "#C8B6E2", "#A2A8D3"], tags: ["Peach", "Warm", "Soft"] },
    { id: "pl-20", name: "Lavender Fields", colors: ["#E6E6FA", "#D8BFD8", "#DDA0DD", "#EE82EE", "#DA70D6"], tags: ["Purple", "Soft"] },

    // Vibrant & Fun
    { id: "pl-21", name: "Pop Art", colors: ["#F94144", "#F3722C", "#F8961E", "#F9C74F", "#90BE6D"], tags: ["Vibrant", "Color", "Pop"] },
    { id: "pl-22", name: "Tropical", colors: ["#00F5D4", "#00BBF9", "#F15BB5", "#FEE440", "#9B5DE5"], tags: ["Summer", "Bright", "Fun"] },
    { id: "pl-23", name: "Candy Crush", colors: ["#FF99C8", "#FCF6BD", "#D0F4DE", "#A9DEF9", "#E4C1F9"], tags: ["Bright", "Pastel"] },
    { id: "pl-24", name: "Fruit Salad", colors: ["#D35400", "#F39C12", "#F1C40F", "#27AE60", "#2ECC71"], tags: ["Citrus", "Green", "Orange"] },
    { id: "pl-25", name: "Retro Wave", colors: ["#E01A4F", "#F15946", "#F9C22E", "#53B3CB", "#0C1B33"], tags: ["Retro", "Bold"] },

    // Elegant & Luxury
    { id: "pl-26", name: "Gold & Black", colors: ["#000000", "#1A1A1A", "#C5B358", "#D4AF37", "#FFDF00"], tags: ["Luxury", "Gold", "Dark"] },
    { id: "pl-27", name: "Rose Gold", colors: ["#B76E79", "#C0C0C0", "#E0BFB8", "#F4E0DB", "#1C1C1C"], tags: ["Pink", "Luxury", "Elegant"] },
    { id: "pl-28", name: "Royal Emerald", colors: ["#053F2C", "#0A7050", "#2E8B57", "#50C878", "#D4AF37"], tags: ["Green", "Gold", "Royal"] },
    { id: "pl-29", name: "Rich Velvet", colors: ["#4A0404", "#7A1010", "#A81C1C", "#1E1E1E", "#D4AF37"], tags: ["Red", "Gold", "Dark"] },
    { id: "pl-30", name: "Monochrome Sleek", colors: ["#0D0D0D", "#262626", "#404040", "#737373", "#BFBFBF"], tags: ["Grayscale", "Minimal"] },

    // Thematic & Seasonal
    { id: "pl-31", name: "Halloween", colors: ["#000000", "#1A1A1A", "#610094", "#3F0071", "#FF7000"], tags: ["Spooky", "Orange", "Purple"] },
    { id: "pl-32", name: "Winter Ice", colors: ["#FFFFFF", "#E0F7FA", "#B2EBF2", "#80DEEA", "#4DD0E1"], tags: ["Winter", "Blue", "Cold"] },
    { id: "pl-33", name: "Autumn Leaves", colors: ["#4A0E4E", "#8B1E41", "#C84B31", "#ECDB54", "#2D4263"], tags: ["Fall", "Warm", "Deep"] },
    { id: "pl-34", name: "Valentine", colors: ["#FFC0CB", "#FFB6C1", "#FF69B4", "#FF1493", "#C71585"], tags: ["Love", "Pink", "Red"] },
    { id: "pl-35", name: "Earth Day", colors: ["#1B4332", "#2D6A4F", "#40916C", "#52B788", "#74C69D"], tags: ["Green", "Earth", "Eco"] },
];
