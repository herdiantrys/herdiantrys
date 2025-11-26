"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, ArrowRight } from "lucide-react";
import Image from "next/image";

interface Service {
    _id: string;
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    features: string[];
    buttonText?: string;
    orderLink?: string;
}

const GlassServices = ({ services }: { services: Service[] }) => {
    // Duplicate services for infinite loop illusion
    const extendedServices = [...services, ...services, ...services];

    const [currentIndex, setCurrentIndex] = useState(services.length);
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

    const itemWidth = 100 / extendedServices.length;

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
        if (isAnimating) return;
        const nextIndex = currentIndex + 1;
        await slideTo(nextIndex);

        if (nextIndex >= services.length * 2) {
            controls.set({ x: `-${services.length * itemWidth}%` });
            setCurrentIndex(services.length);
        }
    };

    const handlePrev = async () => {
        if (isAnimating) return;
        const prevIndex = currentIndex - 1;
        await slideTo(prevIndex);

        if (prevIndex < services.length) {
            controls.set({ x: `-${(services.length * 2 - 1) * itemWidth}%` });
            setCurrentIndex(services.length * 2 - 1);
        }
    };

    useEffect(() => {
        controls.set({ x: `-${services.length * itemWidth}%` });
    }, [controls, itemWidth, services.length]);

    useEffect(() => {
        if (isAnimating) return;
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
    }, [currentIndex, isAnimating, controls, itemWidth, services.length]);

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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500"
                    >
                        Premium Services
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 max-w-2xl mx-auto"
                    >
                        Elevate your digital presence with our tailored solutions.
                    </motion.p>
                </div>

                <div className="relative max-w-7xl mx-auto">
                    <div
                        className="overflow-hidden py-10 px-4"
                        style={{
                            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                            maskComposite: "intersect",
                            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                            WebkitMaskComposite: "source-in"
                        }}
                    >
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
                                <div
                                    key={`${service._id}-${index}`}
                                    className="w-full px-4"
                                    style={{ width: `${100 / extendedServices.length}%` }}
                                >
                                    <div className="glass h-full rounded-3xl overflow-hidden border border-white/10 shadow-xl backdrop-blur-xl bg-black/40 flex flex-col hover:scale-[1.02] transition-transform duration-300 group">
                                        {/* Image Section */}
                                        <div className="w-full h-48 relative overflow-hidden">
                                            {service.imageUrl ? (
                                                <Image
                                                    src={service.imageUrl}
                                                    alt={service.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                                    <span className="text-gray-500">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                                                {service.title}
                                            </h3>

                                            <p className="text-gray-400 mb-6 text-sm line-clamp-3 flex-grow">
                                                {service.description}
                                            </p>

                                            <div className="grid grid-cols-1 gap-2 mb-6">
                                                {service.features?.slice(0, 4).map((feature, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-gray-300">
                                                        <div className="w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                                                            <Check size={12} />
                                                        </div>
                                                        <span className="text-xs font-medium truncate">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-auto pt-6 border-t border-white/10">
                                                <div className="flex flex-col mb-4">
                                                    <span className="text-gray-500 text-xs line-through decoration-red-500/50 decoration-2 mb-1">
                                                        {(() => {
                                                            const priceStr = service.price.replace(/[^0-9]/g, '');
                                                            const price = parseInt(priceStr);
                                                            if (!isNaN(price)) {
                                                                const originalPrice = Math.round(price * 1.25);
                                                                return `Rp. ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(originalPrice)}`;
                                                            }
                                                            return null;
                                                        })()}
                                                    </span>
                                                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                                                        {(() => {
                                                            const priceStr = service.price.replace(/[^0-9]/g, '');
                                                            const price = parseInt(priceStr);
                                                            if (!isNaN(price)) {
                                                                return `Rp. ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)}`;
                                                            }
                                                            return service.price;
                                                        })()}
                                                    </span>
                                                </div>

                                                <a
                                                    href={service.orderLink || "#contact"}
                                                    className="w-full inline-flex items-center justify-center gap-2 bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-teal-50 transition-all duration-300 group shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]"
                                                >
                                                    {service.buttonText || "Order Now"}
                                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
        </section>
    );
};

export default GlassServices;
