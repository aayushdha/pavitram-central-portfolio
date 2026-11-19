export default function StatCard({ label, value, sub, tone = "ink", icon: Icon }) {
  const colors = {
    ink: "var(--color-ink)",
    gold: "var(--color-gold)",
    jade: "var(--color-jade)",
    rose: "var(--color-rose)",
    green: "var(--color-green)",
  };
  const dims = {
    ink: "var(--color-gold-dim)",
    gold: "var(--color-gold-dim)",
    jade: "var(--color-jade-dim)",
    rose: "var(--color-gold-dim)",
    green: "var(--color-jade-dim)",
  };
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
        {Icon && (
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
            style={{ background: dims[tone] }}
          >
            <Icon size={15} style={{ color: colors[tone] }} />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold" style={{ color: colors[tone] }}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}
