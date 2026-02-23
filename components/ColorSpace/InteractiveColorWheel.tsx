"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { generateHarmony, HarmonyType, hsvToHex, hexToHsv } from "@/lib/utils/colorMath";
import { Copy, Check, Info, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const HARMONY_MODES: HarmonyType[] = [
    "Complementary",
    "Analogous",
    "Split Complementary",
    "Triadic",
    "Square",
    "Monochromatic",
];

export default function InteractiveColorWheel() {
    // Current base color HSV State
    const [hue, setHue] = useState(190); // 0-360 (Default Cyan-ish like reference)
    const [saturation, setSaturation] = useState(0.8); // 0-1 (Distance from center)
    const [value, setValue] = useState(0.9); // 0-1 (Constant brightness for wheel logic)

    const [hexInput, setHexInput] = useState(hsvToHex(hue, saturation, value));

    const [harmonyMode, setHarmonyMode] = useState<HarmonyType>("Complementary");
    const [generatedColors, setGeneratedColors] = useState<string[]>([]);
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    const wheelRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Update generated colors AND internal hex string whenever H,S,V or Mode changes
    useEffect(() => {
        const colors = generateHarmony(hue, saturation, value, harmonyMode);
        setGeneratedColors(colors);
        setHexInput(hsvToHex(hue, saturation, value));
    }, [hue, saturation, value, harmonyMode]);

    // Handle typing a HEX code manually
    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setHexInput(val);

        // Try to parse Hex if valid length
        if (/^#?[0-9A-Fa-f]{6}$/.test(val)) {
            const [newH, newS, newV] = hexToHsv(val);
            setHue(newH);
            setSaturation(newS);
            setValue(newV);
        }
    };

    // Calculate position (x, y % offsets) on a 2D wheel from Hue & Saturation
    const getPointFromHSV = (h: number, s: number) => {
        // Hue is angle (0 is right, 90 is bottom, etc.)
        const angleRad = (h * Math.PI) / 180;
        // Saturation is distance from center (0 to 1). 
        // We use 50% radius as max (from center to edge)
        const radiusPct = 50 * s;

        const x = 50 + radiusPct * Math.cos(angleRad);
        const y = 50 + radiusPct * Math.sin(angleRad);
        return { x, y };
    };

    // Handle Drag logic on the 2D wheel
    const handleWheelInteraction = useCallback((clientX: number, clientY: number) => {
        if (!wheelRef.current) return;

        const rect = wheelRef.current.getBoundingClientRect();
        const radius = rect.width / 2;

        // Calculate relative to center
        const centerX = rect.left + radius;
        const centerY = rect.top + radius;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        // Calculate Angle (Hue)
        let angleInRadians = Math.atan2(dy, dx);
        let angleInDegrees = angleInRadians * (180 / Math.PI);
        if (angleInDegrees < 0) angleInDegrees += 360;

        // Calculate Distance from center (Saturation)
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        // Normalize saturation between 0 and 1. Cap at 1 if dragging outside wheel.
        const newSat = Math.min(1, distanceFromCenter / radius);

        setHue(Math.round(angleInDegrees) % 360);
        setSaturation(newSat);
        // During 2D wheel drag, we keep 'Value' constant to whatever it currently is.
    }, []);

    // Pointer event listeners for the wheel
    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (isDragging) {
                handleWheelInteraction(e.clientX, e.clientY);
            }
        };
        const handlePointerUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging, handleWheelInteraction]);

    // Copy Handler
    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value);
        setCopiedValue(value);
        toast.success(`Copied HEX!`, { description: value, icon: <Copy size={16} /> });
        setTimeout(() => setCopiedValue(null), 2000);
    };

    return (
        <div className="flex flex-col md:flex-row gap-12 mt-8 max-w-6xl mx-auto p-4 md:p-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 rounded-3xl shadow-2xl">

            {/* Left: The Visual Wheel Panel */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50/50 dark:bg-black/20 rounded-2xl relative">

                {/* 2D Interactive Wheel Container */}
                <div
                    ref={wheelRef}
                    className="relative w-[320px] h-[320px] rounded-full shrink-0 shadow-[0_0_40px_rgba(0,0,0,0.05)] cursor-crosshair touch-none overflow-hidden"
                    style={{
                        // Base colors using conic-gradient (Hue spectrum)
                        // Then overlay a radial-gradient to handle saturation (white in center fading to transparent)
                        background: `
                            radial-gradient(circle closest-side, #ffffff, transparent),
                            conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)
                        `,
                        backgroundBlendMode: 'screen',
                        // In dark mode or to simulate 'Value' changes, one might add an additional black overlay
                        // For this design exactly like reference (vibrant), this screen merge is good enough.
                    }}
                    onPointerDown={(e) => {
                        if (e.button !== 0) return;
                        setIsDragging(true);
                        handleWheelInteraction(e.clientX, e.clientY);
                    }}
                >
                    {/* Dark/Value Overlay (Simulates brightness slider effect on the literal wheel look) */}
                    <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ backgroundColor: `rgba(0,0,0, ${1 - value})` }}
                    />

                    {/* Plot all generated harmony dots physically on the wheel */}
                    {generatedColors.map((hexColor, index) => {
                        // Find the H and S of this specific harmony color to position it correctly on the wheel surface
                        const [c_h, c_s,] = hexToHsv(hexColor);
                        const pos = getPointFromHSV(c_h, c_s);
                        const isMainColor = index === 0;

                        return (
                            <div
                                key={`dot-${index}-${hexColor}`}
                                className={`absolute rounded-full border-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-75 transform -translate-x-1/2 -translate-y-1/2
                                    ${isMainColor ? "w-7 h-7 border-white z-20" : "w-4 h-4 border-white/80 z-10"}
                                    ${isDragging && isMainColor ? "scale-125 bg-transparent" : "scale-100"}
                                `}
                                style={{
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`,
                                    backgroundColor: isMainColor && isDragging ? 'transparent' : hexColor,
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Right: The Theory Menu & Resulting Swatches */}
            <div className="flex-[1.2] flex flex-col justify-center space-y-8">

                {/* Step 1: Manual Pick */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-[var(--glass-text)] text-gray-500 flex items-center gap-2">
                        1. Pick a color
                    </label>
                    <div className="flex gap-4 items-center">
                        {/* Swatch Preview */}
                        <div
                            className="w-14 h-14 rounded-full shadow-inner shrink-0 transition-colors"
                            style={{ backgroundColor: generatedColors[0] || "#ffffff" }}
                        />
                        {/* Hex Input field */}
                        <input
                            type="text"
                            value={hexInput}
                            onChange={handleHexInputChange}
                            className="flex-1 w-full bg-transparent border border-gray-300 dark:border-white/20 rounded-xl px-4 py-3.5 text-center font-bold tracking-widest text-gray-800 dark:text-gray-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all uppercase"
                        />
                    </div>
                </div>

                {/* Step 2: Harmony Dropdown */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-[var(--glass-text)] text-gray-500 flex items-center gap-2">
                        2. Choose a color combination
                    </label>
                    <div className="relative">
                        <select
                            value={harmonyMode}
                            onChange={(e) => setHarmonyMode(e.target.value as HarmonyType)}
                            className="w-full appearance-none bg-white dark:bg-black/40 border border-gray-300 dark:border-white/20 rounded-xl px-4 py-3.5 text-gray-800 dark:text-gray-200 font-medium cursor-pointer focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                        >
                            {HARMONY_MODES.map(mode => (
                                <option key={mode} value={mode}>{mode}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                    </div>
                </div>

                {/* Resulting Harmony Block */}
                <div className="pt-4">
                    <div className="flex h-[100px] rounded-xl overflow-hidden shadow-md w-full">
                        <AnimatePresence>
                            {generatedColors.map((hex, i) => (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                    key={`block-${hex}-${i}`}
                                    onClick={() => handleCopy(hex)}
                                    className="flex-1 transition-all hover:opacity-90 relative group/block"
                                    style={{ backgroundColor: hex }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/block:opacity-100 transition-opacity bg-black/10 backdrop-blur-sm">
                                        {copiedValue === hex ? <Check size={24} className="text-white drop-shadow" /> : <Copy size={24} className="text-white drop-shadow" />}
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                    {/* Hex Labels below blocks */}
                    <div className="flex mt-3">
                        {generatedColors.map((hex, i) => (
                            <div key={`label-${hex}-${i}`} className="flex-1 text-center font-mono text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                {hex}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
