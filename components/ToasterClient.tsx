"use client";

import { Toaster } from "sonner";

export default function ToasterClient() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className:
          "rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--glass-text)] font-medium backdrop-blur-2xl shadow-[var(--glass-shadow)]",
        classNames: {
          toast: "group relative flex items-center gap-4 border p-4 overflow-hidden min-w-[320px] max-w-sm",
          title: "text-sm font-bold text-[var(--glass-text)]",
          description: "text-[13px] text-[var(--glass-text-muted)]",
          actionButton:
            "rounded-xl bg-[var(--site-button)] px-3 py-1.5 text-xs font-bold text-[var(--site-button-text)] transition-opacity hover:opacity-90",
          cancelButton:
            "rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs font-bold text-[var(--glass-text-muted)] transition-colors hover:bg-[var(--glass-bg-strong)] hover:text-[var(--glass-text)]",
          closeButton:
            "left-auto right-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--glass-text)] transition-colors hover:bg-[var(--glass-bg-strong)]",
          success:
            "bg-green-500/10 border-green-500/20 text-green-500 dark:text-green-400 [&>[data-icon]]:text-green-500",
          error:
            "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400 [&>[data-icon]]:text-red-500",
          warning:
            "bg-orange-500/10 border-orange-500/20 text-orange-500 dark:text-orange-400 [&>[data-icon]]:text-orange-500",
          info:
            "bg-sky-500/10 border-sky-500/20 text-sky-500 dark:text-sky-400 [&>[data-icon]]:text-sky-500",
          icon: "mr-2 h-5 w-5",
        },
      }}
    />
  );
}
