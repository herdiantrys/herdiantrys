"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth-actions";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function NewPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [isPending, startTransition] = useTransition();
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(false);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error("Missing token!");
            return;
        }

        startTransition(async () => {
            const result = await resetPassword(token, password);
            if (result.error) {
                toast.error(result.error);
            } else {
                setSuccess(true);
                toast.success("Password reset successfully!");
            }
        });
    };

    return (
        <div className="w-full max-w-md space-y-8 p-10 bg-zinc-900/50 rounded-2xl border border-white/5 backdrop-blur-xl">
            <div className="text-center">
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                    Enter New Password
                </h2>
                {!token && (
                    <p className="mt-2 text-sm text-red-400">
                        Missing token. Please check your email link.
                    </p>
                )}
            </div>

            {success ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-400">
                        Your password has been reset successfully!
                    </p>
                    <div className="mt-4">
                        <Link href="/auth/login" className="text-sm font-medium text-green-400 hover:text-green-300">
                            Click here to login
                        </Link>
                    </div>
                </div>
            ) : (
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                            New Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                                placeholder="Enter your new password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending || !token}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isPending && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                            Reset Password
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
    );
}

export default function NewPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950">
            <Suspense fallback={<Loader2 className="animate-spin h-8 w-8 text-white" />}>
                <NewPasswordForm />
            </Suspense>
        </div>
    );
}
