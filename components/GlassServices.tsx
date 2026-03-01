"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, ArrowRight } from "lucide-react";
import Image from "next/image";
import { SectionTitle } from "@/components/ui/SectionTitle";

interface Service {
    _id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    features: string[];
    buttonText?: string;
    orderLink?: string;
}

// ... imports

const GlassServices = ({ services, dict }: { services: Service[], dict: any }) => {
    // Duplicate services for infinite loop illusion
    const extendedServices = services ? [...services, ...services, ...services] : [];

    const [currentIndex, setCurrentIndex] = useState(services?.length || 0);
    const [isAnimating, setIsAnimating] = useState(false);
    const controls = useAnimation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [itemsVisible, setItemsVisible] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setItemsVisible(1);
            } else if (window.innerWidth < 1024) {
                setItemsVisible(2);
            } else {
                setItemsVisible(3);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const itemWidth = extendedServices.length > 0 ? 100 / extendedServices.length : 0;

    const slideTo = async (index: number) => {
        if (isAnimating) return;
        setIsAnimating(true);

        await controls.start({
            x: `-${index * itemWidth}%`,
            transition: { duration: 0.5, ease: "easeInOut" },
        });

        setCurrentIndex(index);
        setIsAnimating(false);
    };

    const handleNext = async () => {
        if (isAnimating || !services) return;
        const nextIndex = currentIndex + 1;
        await slideTo(nextIndex);

        if (nextIndex >= services.length * 2) {
            controls.set({ x: `-${services.length * itemWidth}%` });
            setCurrentIndex(services.length);
        }
    };

    const handlePrev = async () => {
        if (isAnimating || !services) return;
        const prevIndex = currentIndex - 1;
        await slideTo(prevIndex);

        if (prevIndex < services.length) {
            controls.set({ x: `-${(services.length * 2 - 1) * itemWidth}%` });
            setCurrentIndex(services.length * 2 - 1);
        }
    };

    useEffect(() => {
        if (services && services.length > 0) {
            controls.set({ x: `-${services.length * itemWidth}%` });
        }
    }, [controls, itemWidth, services?.length]);

    useEffect(() => {
        if (isAnimating || !services) return;
        const N = services.length;
        if (currentIndex >= N * 2) {
            const newIndex = currentIndex - N;
            controls.set({ x: `-${newIndex * itemWidth}%` });
            setCurrentIndex(newIndex);
        } else if (currentIndex < N) {
            const newIndex = currentIndex + N;
            controls.set({ x: `-${newIndex * itemWidth}%` });
            setCurrentIndex(newIndex);
        }
    }, [currentIndex, isAnimating, controls, itemWidth, services?.length]);

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            handleNext();
        }, 5000);
        return () => clearInterval(timer);
    }, [currentIndex, isAnimating]);

    if (!services || services.length === 0) {
        return null;
    }

    return (
        <section className="py-20 relative z-10 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--site-secondary)]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-10%" }}
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.08
                            }
                        }
                    }}
                >
                    <SectionTitle
                        title={dict.services.title}
                        subtitle={dict.services.description}
                        alignment="center"
                        className="mb-20"
                    />

                    <div className="relative max-w-7xl mx-auto">
                        <div className="relative">
                            <div className="overflow-hidden py-20 -my-10 px-4" style={{
                                maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
                            }}>
                                <motion.div
                                    ref={containerRef}
                                    animate={controls}
                                    className="flex cursor-grab active:cursor-grabbing"
                                    style={{ width: `${extendedServices.length * (100 / itemsVisible)}%` }}
                                    drag="x"
                                    dragConstraints={{ left: -10000, right: 10000 }}
                                    dragElastic={0.1}
                                    dragMomentum={false}

                                    onDragEnd={(e, { offset, velocity }) => {
                                        if (!containerRef.current || !containerRef.current.parentElement) return;
                                        const parentWidth = containerRef.current.parentElement.offsetWidth;
                                        const itemPixelWidth = parentWidth / itemsVisible;
                                        const draggedItems = -offset.x / itemPixelWidth;
                                        let direction = 0;
                                        if (Math.abs(velocity.x) > 500) {
                                            direction = velocity.x < 0 ? 1 : -1;
                                        } else {
                                            direction = Math.round(draggedItems);
                                        }
                                        const targetIndex = currentIndex + direction;
                                        slideTo(targetIndex);
                                    }}
                                >
                                    {extendedServices.map((service, index) => (
                                        <motion.div
                                            key={`${service._id}-${index}`}
                                            variants={{
                                                hidden: { opacity: 0, y: 30, scale: 0.98, filter: "blur(10px)" },
                                                visible: {
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                    filter: "blur(0px)",
                                                    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
                                                }
                                            }}
                                            className="w-full px-4"
                                            style={{ width: `${100 / extendedServices.length}%` }}
                                        >
                                            <div className="glass h-full rounded-3xl border-[var(--glass-border)] bg-[var(--glass-bg)] overflow-hidden hover:scale-[1.02] transition-transform duration-500 relative group flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/60 dark:border-white/10">
                                                {/* Image */}
                                                <div className="relative h-56 w-full overflow-hidden">
                                                    {service.imageUrl ? (
                                                        <Image
                                                            src={service.imageUrl}
                                                            alt={service.title}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                                            <span className="text-gray-500">{dict.services.no_image}</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                                                </div>

                                                {/* Content */}
                                                <div className="p-6 flex-grow flex flex-col">
                                                    <h3 className="text-xl font-bold mb-2 text-[var(--glass-text)]">{service.title}</h3>
                                                    <p className="text-sm text-[var(--glass-text-muted)] mb-6 line-clamp-3">{service.description}</p>

                                                    {/* ... features ... */}
                                                    <ul className="mb-6 space-y-2 flex-grow">
                                                        {service.features?.slice(0, 4).map((feature, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-[var(--glass-text-muted)]">
                                                                <Check size={16} className="text-[var(--site-secondary)] mt-0.5 shrink-0" />
                                                                <span>{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between mb-6">
                                                        {/* ... prices ... */}
                                                        <span className="text-gray-400 line-through text-sm">
                                                            {(() => {
                                                                const originalPrice = Math.round(service.price * 1.25);
                                                                return `Rp. ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(originalPrice)}`;
                                                            })()}
                                                        </span>
                                                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--site-secondary)] to-[var(--site-secondary)]">
                                                            {(() => {
                                                                return `Rp. ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(service.price)}`;
                                                            })()}
                                                        </span>
                                                    </div>

                                                    <a
                                                        href={service.orderLink || "#contact"}
                                                        className="w-full inline-flex items-center justify-center gap-2 bg-[var(--site-button)] text-[var(--site-button-text)] font-bold py-3.5 px-6 rounded-2xl hover:bg-teal-600 dark:hover:bg-teal-400 transition-all duration-300 group shadow-[0_10px_20px_rgba(20,184,166,0.2)] hover:shadow-[0_15px_30px_rgba(20,184,166,0.4)]"
                                                    >
                                                        {service.buttonText || dict.services.order_now}
                                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                    </a>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>

                            {/* Navigation Buttons */}
                            <button
                                onClick={handlePrev}
                                className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 p-3 rounded-full glass border border-white/10 hover:bg-white/10 transition-all text-white z-20"
                                aria-label="Previous service"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 p-3 rounded-full glass border border-white/10 hover:bg-white/10 transition-all text-white z-20"
                                aria-label="Next service"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>

    );
};

export default GlassServices;
