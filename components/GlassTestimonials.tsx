"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

import { Testimonial } from "@/lib/sanityTestimonials";
import Image from "next/image";
import { SectionTitle } from "@/components/ui/SectionTitle";

const GlassTestimonials = ({ testimonials = [], dict }: { testimonials: Testimonial[], dict: any }) => {
    // Duplicate testimonials to create infinite loop illusion
    // If we have few testimonials, we might need to duplicate more times
    const extendedTestimonials = [...testimonials, ...testimonials, ...testimonials];

    const [currentIndex, setCurrentIndex] = useState(testimonials.length);
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

    const itemWidth = 100 / extendedTestimonials.length; // Width of one item relative to the container

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

        // Reset to middle set if we reach the end
        if (nextIndex >= testimonials.length * 2) {
            controls.set({ x: `-${testimonials.length * itemWidth}%` });
            setCurrentIndex(testimonials.length);
        }
    };

    const handlePrev = async () => {
        if (isAnimating) return;
        const prevIndex = currentIndex - 1;
        await slideTo(prevIndex);

        // Reset to middle set if we reach the beginning
        if (prevIndex < testimonials.length) {
            controls.set({ x: `-${(testimonials.length * 2 - 1) * itemWidth}%` });
            setCurrentIndex(testimonials.length * 2 - 1);
        }
    };

    useEffect(() => {
        // Initial position (start at the middle set)
        controls.set({ x: `-${testimonials.length * itemWidth}%` });
    }, [controls, itemWidth, testimonials.length]);

    useEffect(() => {
        if (isAnimating) return;

        // Reset to middle set if we reach the ends
        // We have 3 sets: [0..N-1] [N..2N-1] [2N..3N-1]
        // We want to keep index in [N..2N-1]
        const N = testimonials.length;

        if (currentIndex >= N * 2) {
            // If we are in the 3rd set, jump back to 2nd set
            const newIndex = currentIndex - N;
            controls.set({ x: `-${newIndex * itemWidth}%` });
            setCurrentIndex(newIndex);
        } else if (currentIndex < N) {
            // If we are in the 1st set, jump forward to 2nd set
            const newIndex = currentIndex + N;
            controls.set({ x: `-${newIndex * itemWidth}%` });
            setCurrentIndex(newIndex);
        }
    }, [currentIndex, isAnimating, controls, itemWidth, testimonials.length]);

    useEffect(() => {
        const timer = setInterval(() => {
            handleNext();
        }, 5000);

        return () => clearInterval(timer);
    }, [currentIndex, isAnimating]);

    if (testimonials.length === 0) return null;

    return (
        <section className="py-20 relative z-10 overflow-hidden">
            <div className="container mx-auto px-4">
                <SectionTitle
                    title={dict.testimonials.title}
                    subtitle={dict.testimonials.description}
                    alignment="center"
                    className="mb-16"
                />

                <div className="relative max-w-7xl mx-auto">
                    <div
                        className="overflow-hidden py-10 px-4 backdrop-blur-sm"
                        style={{
                            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent), linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
                            maskComposite: "intersect",
                            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent), linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
                            WebkitMaskComposite: "source-in"
                        }}
                    >
                        <motion.div
                            ref={containerRef}
                            animate={controls}
                            className="flex cursor-grab active:cursor-grabbing"
                            style={{ width: `${extendedTestimonials.length * (100 / itemsVisible)}%` }} // Adjust width based on total items
                            drag="x"
                            dragConstraints={{ left: -10000, right: 10000 }} // Allow free dragging
                            dragElastic={0.1}
                            dragMomentum={false} // Disable momentum so we can snap immediately
                            onDragEnd={(e, { offset, velocity }) => {
                                if (!containerRef.current || !containerRef.current.parentElement) return;

                                const parentWidth = containerRef.current.parentElement.offsetWidth;
                                const itemPixelWidth = parentWidth / itemsVisible; // items visible

                                // Calculate how many items we dragged past
                                // Negative offset means dragging left (next), positive means right (prev)
                                const draggedItems = -offset.x / itemPixelWidth;

                                // Determine direction based on drag distance and velocity
                                let direction = 0;
                                if (Math.abs(velocity.x) > 500) {
                                    direction = velocity.x < 0 ? 1 : -1;
                                } else {
                                    direction = Math.round(draggedItems);
                                }

                                // If we didn't drag enough to change item, but velocity was low, snap back
                                // If we dragged enough (rounded > 0), we move
                                const targetIndex = currentIndex + direction;

                                slideTo(targetIndex);
                            }}
                        >
                            {extendedTestimonials.map((testimonial, index) => (
                                <div
                                    key={`${testimonial.id}-${index}`}
                                    className="w-full px-3" // Padding for gap
                                    style={{ width: `${100 / extendedTestimonials.length}%` }}
                                >
                                    <div className="glass h-full p-8 rounded-3xl border-[var(--glass-border)] relative bg-[var(--glass-bg)] flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
                                        <Quote className="text-[var(--glass-text-muted)] opacity-20 w-10 h-10 mb-4" />

                                        <p className="text-[var(--glass-text)] italic leading-relaxed mb-6 flex-grow">
                                            "{testimonial.content}"
                                        </p>

                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white font-bold shadow-lg shrink-0 overflow-hidden relative`}>
                                                {testimonial.avatar.startsWith("http") ? (
                                                    <Image
                                                        src={testimonial.avatar}
                                                        alt={testimonial.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    testimonial.avatar
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[var(--glass-text)]">{testimonial.name}</h4>
                                                <p className="text-[var(--glass-text-muted)] text-sm">{testimonial.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 p-3 rounded-full glass hover:bg-[var(--glass-border)] transition-colors text-[var(--glass-text)] z-10"
                        onClick={handlePrev}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 p-3 rounded-full glass hover:bg-[var(--glass-border)] transition-colors text-[var(--glass-text)] z-10"
                        onClick={handleNext}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Dots (Simplified for infinite loop) */}
                <div className="flex justify-center gap-2 mt-8">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                // Calculate target index relative to current position to minimize jump
                                const targetIndex = testimonials.length + index;
                                slideTo(targetIndex);
                            }}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${(currentIndex % testimonials.length) === index ? "bg-[var(--glass-text)] w-6" : "bg-[var(--glass-text-muted)] opacity-50 hover:opacity-100"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default GlassTestimonials;
