// Convert HSV (Hue 0-360, Saturation 0-1, Value(Lightness) 0-1) to RGB (0-255)
export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Convert RGB to HEX string
export function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
}

// Convert HSV directly to HEX
export function hsvToHex(h: number, s: number, v: number): string {
    const [r, g, b] = hsvToRgb(h, s, v);
    return rgbToHex(r, g, b);
}

// Convert HEX string to HSV (Hue 0-360, Saturation 0-1, Value 0-1)
export function hexToHsv(hex: string): [number, number, number] {
    // 1. Convert HEX to RGB
    let r = 0, g = 0, b = 0;
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    }

    // 2. Convert RGB to HSV
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const d = max - min;

    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
        switch (max) {
            case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
            case gNorm: h = (bNorm - rNorm) / d + 2; break;
            case bNorm: h = (rNorm - gNorm) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.round(h * 360), parseFloat(s.toFixed(3)), parseFloat(v.toFixed(3))];
}

// Generate exact color harmonies based on a Hue (0-360), Saturation (0-1), and Value (0-1)
export type HarmonyType = "Complementary" | "Analogous" | "Triadic" | "Split Complementary" | "Square" | "Monochromatic";

export function generateHarmony(h: number, s: number, v: number, type: HarmonyType): string[] {
    const baseHex = hsvToHex(h, s, v);
    const result: string[] = [baseHex];

    // Helper to wrap hue globally (0-360)
    const normalizeHue = (hue: number) => (hue + 360) % 360;

    switch (type) {
        case "Complementary":
            // 180 degrees opposite
            result.push(hsvToHex(normalizeHue(h + 180), s, v));
            break;

        case "Analogous":
            // Adjacent colors (+/- 30 degrees)
            result.push(hsvToHex(normalizeHue(h + 30), s, v));
            result.push(hsvToHex(normalizeHue(h - 30), s, v));
            break;

        case "Triadic":
            // Equilateral triangle (spaced by 120 degrees)
            result.push(hsvToHex(normalizeHue(h + 120), s, v));
            result.push(hsvToHex(normalizeHue(h + 240), s, v));
            break;

        case "Split Complementary":
            // Base color and two colors adjacent to its complementary
            result.push(hsvToHex(normalizeHue(h + 150), s, v));
            result.push(hsvToHex(normalizeHue(h + 210), s, v));
            break;

        case "Square":
            // Spaced evenly by 90 degrees
            result.push(hsvToHex(normalizeHue(h + 90), s, v));
            result.push(hsvToHex(normalizeHue(h + 180), s, v));
            result.push(hsvToHex(normalizeHue(h + 270), s, v));
            break;

        case "Monochromatic":
            // Varying Saturation or Value of the same hue
            // We'll generate 3 additional shades/tints
            result.push(hsvToHex(h, Math.max(0, s - 0.4), v)); // Lighter/less sats
            result.push(hsvToHex(h, s, Math.max(0.2, v - 0.4))); // Darker
            result.push(hsvToHex(h, Math.min(1, s + 0.3), Math.min(1, v + 0.2))); // Punchy
            break;
    }

    return result;
}
