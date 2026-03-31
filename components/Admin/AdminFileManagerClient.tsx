"use client";

import { FolderOpen } from "lucide-react";

import { MediaLibraryManager } from "@/components/Admin/MediaLibrary";

export default function AdminFileManagerClient() {
    return (
        <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(241,246,255,0.94)_55%,rgba(230,239,251,0.94))] px-6 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(14,20,39,0.88),rgba(11,17,31,0.9)_55%,rgba(17,27,49,0.94))] dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)] md:px-8 md:py-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--site-accent)]/12 text-[var(--site-accent)]">
                        <FolderOpen size={22} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            File Manager
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                            Kelola seluruh aset gambar, video, audio, dan file yang pernah diupload ke server.
                            Kamu bisa cari, upload baru, edit metadata, copy URL, dan hapus file langsung dari sini.
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#08111c]/90 dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
                <MediaLibraryManager
                    title="Library Aset"
                    description="Semua file lama di /public/uploads akan disinkronkan otomatis, jadi aset yang sudah pernah diupload tetap bisa dipakai ulang di form CRUD."
                    preferredFolder="file_manager"
                    allowedKinds={["IMAGE", "VIDEO", "AUDIO", "FILE"]}
                    multiple
                />
            </div>
        </div>
    );
}
