"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

import { usePathname } from "next/navigation";

const ParticleWave = () => {
    const pathname = usePathname();
    const isHomePage = ["/", "/en", "/id"].includes(pathname);

    // Initial check to prevent rendering on non-home pages
    if (!isHomePage) return null;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let mouseX = -1000;
        let mouseY = -1000;

        // Configuration
        // Configuration
        const spacing = 70; // Increased from 40 to 70 to reduce particle count
        const radius = 1.5; // Increased from 1 to 1.5 for visibility
        const mouseRadius = 800; // Increased interaction radius
        const springFactor = 0.02;
        const friction = 0.90;
        const waveSpeed = 0.001;
        const waveAmplitude = 6;

        class Particle {
            x: number;
            y: number;
            originX: number;
            originY: number;
            vx: number;
            vy: number;
            color: string;
            angle: number;

            constructor(x: number, y: number, color: string) {
                this.x = x;
                this.y = y;
                this.originX = x;
                this.originY = y;
                this.vx = 0;
                this.vy = 0;
                this.color = color;
                this.angle = Math.random() * Math.PI * 2; // Random starting angle for wave
            }

            update(time: number) {
                // Idle Wave Motion
                const waveY = Math.sin(time * waveSpeed + this.originX * 0.01) * waveAmplitude;
                const targetY = this.originY + waveY;

                // Distance from mouse
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distanceSq = dx * dx + dy * dy;
                const mouseRadiusSq = mouseRadius * mouseRadius;

                // Mouse interaction (repulsion)
                if (distanceSq < mouseRadiusSq) {
                    const distance = Math.sqrt(distanceSq);
                    const angle = Math.atan2(dy, dx);
                    const force = (mouseRadius - distance) / mouseRadius;
                    const push = force * 8; // Increased push strength

                    this.vx -= Math.cos(angle) * push;
                    this.vy -= Math.sin(angle) * push;
                }

                // Spring back to target (origin + wave)
                const springDx = this.originX - this.x;
                const springDy = targetY - this.y;

                this.vx += springDx * springFactor;
                this.vy += springDy * springFactor;

                // Friction
                this.vx *= friction;
                this.vy *= friction;

                // Update position
                this.x += this.vx;
                this.y += this.vy;
            }

            draw(context: CanvasRenderingContext2D, mouseX: number, mouseY: number) {
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distanceSq = dx * dx + dy * dy;
                const effectRadiusSq = 800 * 800;

                // Calculate dynamic opacity and radius
                // Max distance for effect
                const effectRadius = 800;

                let alpha = 0.333; // Base opacity for far particles
                let currentRadius = radius;

                if (distanceSq < effectRadiusSq) {
                    const distance = Math.sqrt(distanceSq);
                    // Normalize distance (0 to 1, where 0 is close)
                    const normalizedDist = distance / effectRadius;

                    // Opacity: 1 when close, fading to base opacity
                    alpha = 1 - (normalizedDist * (1 - 0.1));

                    // Size: Larger when close
                    const maxRadius = 3;
                    currentRadius = maxRadius - (normalizedDist * (maxRadius - radius));
                }

                context.beginPath();
                context.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);

                // Parse base color to apply dynamic alpha
                // Assuming color is in format "rgba(r, g, b, a)" or similar, but we'll simplify by passing base RGB
                // For now, we'll just use globalAlpha for simplicity if color is constant, 
                // but since we need specific alpha control, let's reconstruct the color string.

                // We'll rely on the color passed being just the RGB part or handle it in init
                // Actually, let's just use the theme check inside draw or pass RGB components

                context.globalAlpha = alpha;
                context.fillStyle = this.color;
                context.fill();
                context.globalAlpha = 1; // Reset
            }
        }

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];

            const cols = Math.floor(canvas.width / spacing);
            const rows = Math.floor(canvas.height / spacing);

            // Use opaque colors as base
            const color = theme === "dark" ? "#ffffff" : "#0096D1"; // Darker purple for light mode

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * spacing + (canvas.width - cols * spacing) / 2;
                    const y = j * spacing + (canvas.height - rows * spacing) / 2;
                    particles.push(new Particle(x, y, color));
                }
            }
        };

        const animate = (time: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.update(time);
                particle.draw(ctx, mouseX, mouseY);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        const handleResize = () => {
            init();
        };

        // Only enable mouse interaction on non-mobile devices (tablets and desktops)
        const isMobile = window.innerWidth < 768;

        if (!isMobile) {
            window.addEventListener("mousemove", handleMouseMove);
        }

        window.addEventListener("resize", handleResize);

        init();
        requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[1] pointer-events-none"
            style={{ opacity: 0.6 }}
        />
    );
};

export default ParticleWave;
