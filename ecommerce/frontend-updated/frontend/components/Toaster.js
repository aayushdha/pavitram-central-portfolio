"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";

export default function Toaster() {
  const { toasts } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm font-medium text-ink shadow-lg"
          style={{ minWidth: 240 }}
        >
          {t.tone === "error" ? (
            <AlertCircle size={16} style={{ color: "var(--color-rose)" }} />
          ) : (
            <CheckCircle2 size={16} style={{ color: "var(--color-green)" }} />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
