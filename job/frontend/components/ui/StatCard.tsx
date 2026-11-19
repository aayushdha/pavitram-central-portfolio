import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  deltaLabel = "vs last month",
  icon,
  accent = "brand",
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon?: ReactNode;
  accent?: "brand" | "spark" | "good";
}) {
  const accentBg =
    accent === "spark" ? "bg-[#FFF1E6] text-spark-600" : accent === "good" ? "bg-good-100 text-good-500" : "bg-brand-50 text-brand-600";

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <span className="text-sm text-muted font-medium">{label}</span>
        {icon && <div className={`h-9 w-9 rounded-xl grid place-items-center ${accentBg}`}>{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <span className="font-display text-2xl font-bold text-ink">{value}</span>
        {typeof delta === "number" && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              delta >= 0 ? "text-good-500" : "text-bad-500"
            }`}
          >
            {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {typeof delta === "number" && <span className="text-[11px] text-muted -mt-2">{deltaLabel}</span>}
    </div>
  );
}
