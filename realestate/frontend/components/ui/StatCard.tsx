import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  trend = "up",
  icon,
  hint,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-text-600">{label}</p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brass-50 text-brass-600">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-medium text-ink-900">{value}</p>
      <div className="mt-2 flex items-center gap-1.5">
        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              trend === "up" ? "text-success-600" : "text-danger-600"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}
            {delta}
          </span>
        )}
        {hint && <span className="text-xs text-text-400">{hint}</span>}
      </div>
    </div>
  );
}
