import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-dots-pattern pt-28 pb-10">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Sidebar Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-6">
                            <div className="flex flex-col items-center">
                                <Skeleton className="w-24 h-24 rounded-full mb-4" />
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <Skeleton className="h-10 w-full rounded-xl" />
                                <Skeleton className="h-10 w-full rounded-xl" />
                                <Skeleton className="h-10 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Middle Feed Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/5">
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>

                        {/* Activity Cards */}
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                                <div className="flex gap-4 mb-4">
                                    <Skeleton className="w-12 h-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                                <div className="pl-16 space-y-4">
                                    <Skeleton className="h-20 w-full rounded-xl" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Sidebar Skeleton */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-28 space-y-6">
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                                <Skeleton className="h-6 w-40 mb-6" />
                                <div className="space-y-6">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex gap-4">
                                            <Skeleton className="w-16 h-16 rounded-xl" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
