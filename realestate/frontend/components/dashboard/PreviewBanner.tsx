import { Info } from "lucide-react";

export function PreviewBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-info-100 bg-info-100/30 p-4 text-sm text-text-700">
      <Info size={16} className="mt-0.5 shrink-0 text-info-600" />
      <div>
        <p className="font-medium text-ink-900">Preview — not yet backed by real data</p>
        <p className="mt-0.5 text-xs text-text-600">{children}</p>
      </div>
    </div>
  );
}
