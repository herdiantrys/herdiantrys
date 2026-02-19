"use client";

import { useState } from "react";
import { useTransition } from "react";
import { forgotPassword } from "@/lib/auth-actions";
import Turnstile from "react-turnstile";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition();
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!turnstileToken) {
            toast.error("Please complete the captcha challenge");
            return;
        }

        startTransition(async () => {
            const result = await forgotPassword(email, turnstileToken);
            if (result.error) {
                toast.error(result.error);
            } else {
                setSuccess(true);
                toast.success("Reset email sent!");
            }
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950">
            <div className="w-full max-w-md space-y-8 p-10 bg-zinc-900/50 rounded-2xl border border-white/5 backdrop-blur-xl">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                        Wait, I remember my password
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {success ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                        <p className="text-sm text-green-400">
                            We'll send you a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
                        </p>
                        <div className="mt-4">
                            <Link href="/auth/login" className="text-sm font-medium text-green-400 hover:text-green-300">
                                Back to login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Turnstile
                                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                                onVerify={(token) => setTurnstileToken(token)}
                                theme="dark"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isPending && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                                Send Reset Link
                            </button>
                        </div>

                        <div className="text-center">
                            <Link href="/auth/login" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                                Back to login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
