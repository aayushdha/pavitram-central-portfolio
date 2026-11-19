export function ProgressBar({
  value,
  max = 100,
  color = "brand",
  className = "",
}: {
  value: number;
  max?: number;
  color?: "brand" | "brass" | "danger" | "ink";
  className?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors: Record<string, string> = {
    brand: "bg-brand-600",
    brass: "bg-brass-500",
    danger: "bg-danger-600",
    ink: "bg-ink-900",
  };
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-stone-150 bg-stone-200 ${className}`}>
      <div
        className={`h-full rounded-full ${colors[color]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function SegmentedBar({
  segments,
}: {
  segments: { value: number; color: string; label: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-xs text-text-600">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label} · {s.value}
          </span>
        ))}
      </div>
    </div>
  );
}
