"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Github, Mail, Lock, ArrowRight, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password. Please try again.");
                console.error("Login failed:", result.error);
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-20 pt-28">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="glass p-8 md:p-10 rounded-3xl border-[var(--glass-border)] shadow-2xl backdrop-blur-xl bg-[var(--glass-bg)]">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[var(--glass-text)] mb-2">Welcome Back</h1>
                        <p className="text-[var(--glass-text-muted)]">Sign in to continue to your account</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
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
                            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
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
                            <span className="px-4 bg-transparent text-[var(--glass-text-muted)] backdrop-blur-xl">Or continue with</span>
                        </div>
                    </div>

                    {/* Manual Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--glass-text-muted)] ml-1">Email or Username</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--glass-text-muted)]" size={20} />
                                <input
                                    name="email"
                                    type="text"
                                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl pl-12 pr-4 py-3 text-[var(--glass-text)] placeholder:text-[var(--glass-text-muted)]/50 focus:outline-none focus:border-teal-500 focus:bg-[var(--glass-border)] transition-all"
                                    placeholder="Enter your email"
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
                                    placeholder="Enter your password"
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

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${rememberMe
                                        ? "bg-teal-500 border-teal-500"
                                        : "border-[var(--glass-text-muted)] group-hover:border-teal-500"
                                        }`}>
                                        {rememberMe && <Check size={12} className="text-white" />}
                                    </div>
                                </div>
                                <span className="text-sm text-[var(--glass-text-muted)] group-hover:text-[var(--glass-text)] transition-colors">Remember me</span>
                            </label>
                            <Link href="#" className="text-sm font-medium text-teal-500 hover:text-teal-400 transition-colors">
                                Forgot Password?
                            </Link>
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
                                    <span>Sign In</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[var(--glass-text-muted)]">
                            Don't have an account?{" "}
                            <Link href="/register" className="font-bold text-teal-500 hover:text-teal-400 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
