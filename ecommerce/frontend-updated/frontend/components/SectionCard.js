export default function SectionCard({ title, description, icon: Icon, children, accent = "gold", action }) {
  const colors = {
    gold: "var(--color-gold)",
    jade: "var(--color-jade)",
  };
  const dims = {
    gold: "var(--color-gold-dim)",
    jade: "var(--color-jade-dim)",
  };
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
              style={{ background: dims[accent] }}
            >
              <Icon size={18} style={{ color: colors[accent] }} />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>
            {description && <p className="mt-1 text-xs leading-relaxed text-ink-muted">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
