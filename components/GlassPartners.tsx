"use client";

import { motion } from "framer-motion";


import Image from "next/image";
import { Partner } from "@/lib/sanityPartners";

const GlassPartners = ({ partners }: { partners: Partner[] }) => {
    // Duplicate partners to create seamless infinite loop
    const extendedPartners = [...partners, ...partners, ...partners];
    return (
        <section className="py-10 relative z-10 overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <p className="text-[var(--glass-text-muted)] text-sm uppercase tracking-widest font-semibold">
                    Trusted by Industry Leaders
                </p>
            </div>

            <div
                className="relative w-full overflow-hidden py-10"
                style={{
                    maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                    WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
                }}
            >
                <motion.div
                    className="flex gap-8 md:gap-16 w-max"
                    animate={{ x: [0, "-33.33%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 20, // Adjust speed here
                    }}
                >
                    {extendedPartners.map((partner, index) => (
                        <div
                            key={`${partner.name}-${index}`}
                            className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-default"
                        >
                            <div className="p-3 rounded-xl glass bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-md w-14 h-14 flex items-center justify-center relative">
                                {partner.icon && (
                                    <Image
                                        src={partner.icon}
                                        alt={partner.name}
                                        fill
                                        className="object-contain p-2"
                                    />
                                )}
                            </div>
                            <span className="text-lg md:text-xl font-bold text-[var(--glass-text)] hidden md:block">
                                {partner.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default GlassPartners;
