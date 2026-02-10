"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Github, Mail, Lock, ArrowRight, User, CheckCircle } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/register";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        const result = await registerUser(formData);

        if (result.error) {
            setError(result.error);
        } else {
            // Redirect to login on success
            router.push("/login?registered=true");
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-20">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="glass p-8 md:p-10 rounded-3xl border-[var(--glass-border)] shadow-2xl backdrop-blur-xl bg-[var(--glass-bg)]">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[var(--glass-text)] mb-2">Create Account</h1>
                        <p className="text-[var(--glass-text-muted)]">Join us and start your journey</p>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                            onClick={() => signIn("google")}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-all group"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="text-sm font-medium text-[var(--glass-text)]">Google</span>
                        </button>
                        <button
                            onClick={() => signIn("github")}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-all group"
                        >
                            <Github size={20} className="text-[var(--glass-text)]" />
                            <span className="text-sm font-medium text-[var(--glass-text)]">GitHub</span>
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--glass-border)]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-transparent text-[var(--glass-text-muted)] backdrop-blur-xl">Or register with</span>
                        </div>
                    </div>

                    {/* Manual Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--glass-text-muted)] ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--glass-text-muted)]" size={20} />
                                <input
                                    name="fullName"
                                    type="text"
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl pl-12 pr-4 py-3 text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/50 focus:outline-none focus:border-teal-500 focus:bg-[var(--glass-border)] transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--glass-text-muted)] ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--glass-text-muted)]" size={20} />
                                <input
                                    name="email"
                                    type="email"
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl pl-12 pr-4 py-3 text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/50 focus:outline-none focus:border-teal-500 focus:bg-[var(--glass-border)] transition-all"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--glass-text-muted)] ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--glass-text-muted)]" size={20} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl pl-12 pr-12 py-3 text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/50 focus:outline-none focus:border-teal-500 focus:bg-[var(--glass-border)] transition-all"
                                    placeholder="Create a password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--glass-text-muted)] ml-1">Confirm Password</label>
                            <div className="relative">
                                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--glass-text-muted)]" size={20} />
                                <input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl pl-12 pr-12 py-3 text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/50 focus:outline-none focus:border-teal-500 focus:bg-[var(--glass-border)] transition-all"
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--glass-text-muted)] hover:text-[var(--glass-text)] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign Up</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[var(--glass-text-muted)]">
                            Already have an account?{" "}
                            <Link href="/login" className="font-bold text-teal-500 hover:text-teal-400 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
