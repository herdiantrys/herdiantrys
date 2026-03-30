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
        <section className="relative z-10 overflow-hidden py-16 sm:py-20">
            {/* Background Elements */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--site-secondary)]/10 blur-[100px] sm:h-[50rem] sm:w-[50rem]" />

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
                        className="mb-14 sm:mb-20"
                    />

                    <div className="relative max-w-7xl mx-auto">
                        <div className="relative">
                            <div className="overflow-hidden px-1 py-14 sm:-my-10 sm:px-4 sm:py-20" style={{
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
                                            className="w-full px-2 sm:px-4"
                                            style={{ width: `${100 / extendedServices.length}%` }}
                                        >
                                            <div className="glass group relative flex h-full flex-col overflow-hidden rounded-[2rem] border-[var(--glass-border)] border-white/60 bg-[var(--glass-bg)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:border-white/10 dark:shadow-none dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                                                {/* Image */}
                                                <div className="relative h-48 w-full overflow-hidden sm:h-56">
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
                                                <div className="flex flex-grow flex-col p-5 sm:p-6">
                                                    <h3 className="mb-2 text-lg font-bold text-[var(--glass-text)] sm:text-xl">{service.title}</h3>
                                                    <p className="mb-5 text-sm text-[var(--glass-text-muted)] line-clamp-3 sm:mb-6">{service.description}</p>

                                                    {/* ... features ... */}
                                                    <ul className="mb-5 flex-grow space-y-2 sm:mb-6">
                                                        {service.features?.slice(0, 4).map((feature, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-[var(--glass-text-muted)]">
                                                                <Check size={16} className="text-[var(--site-secondary)] mt-0.5 shrink-0" />
                                                                <span>{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    <div className="mt-auto mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 sm:mb-6">
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
                                                        className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--site-button)] px-6 py-3.5 font-bold text-[var(--site-button-text)] shadow-[0_10px_20px_rgba(20,184,166,0.2)] transition-all duration-300 hover:bg-teal-600 hover:shadow-[0_15px_30px_rgba(20,184,166,0.4)] dark:hover:bg-teal-400"
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
                                className="absolute -left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 p-3 text-white transition-all hover:bg-white/10 md:-left-12 sm:flex"
                                aria-label="Previous service"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute -right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 p-3 text-white transition-all hover:bg-white/10 md:-right-12 sm:flex"
                                aria-label="Next service"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-3 sm:hidden">
                            <button
                                onClick={handlePrev}
                                className="glass inline-flex items-center justify-center rounded-full border border-white/10 p-3 text-[var(--glass-text)] transition-all hover:bg-white/10"
                                aria-label="Previous service"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="glass inline-flex items-center justify-center rounded-full border border-white/10 p-3 text-[var(--glass-text)] transition-all hover:bg-white/10"
                                aria-label="Next service"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>

    );
};

export default GlassServices;
