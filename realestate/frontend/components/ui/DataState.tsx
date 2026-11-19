import { AlertCircle, Loader2 } from "lucide-react";

/** A tidy inline loading row — used instead of blocking the whole page. */
export function LoadingRow({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-5 py-8 text-sm text-text-500">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

/** A tidy inline error row with a retry action. */
export function ErrorRow({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-danger-100 bg-danger-50 px-5 py-4 text-sm text-danger-700">
      <span className="flex items-center gap-2">
        <AlertCircle size={16} className="shrink-0" />
        {message}
      </span>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-danger-700 ring-1 ring-inset ring-danger-200 hover:bg-danger-50">
          Retry
        </button>
      )}
    </div>
  );
}
