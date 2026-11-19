const tones = {
  gold: { bg: "var(--color-gold-dim)", fg: "#8a6a1e" },
  jade: { bg: "var(--color-jade-dim)", fg: "var(--color-jade)" },
  ink: { bg: "#eceef2", fg: "var(--color-ink-2)" },
  rose: { bg: "#f6e2dd", fg: "var(--color-rose)" },
  green: { bg: "var(--color-green-dim)", fg: "var(--color-green)" },
  navy: { bg: "var(--color-navy-2)", fg: "var(--color-gold-light)" },
};

export default function Badge({ children, tone = "ink" }) {
  const t = tones[tone] || tones.ink;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: t.bg, color: t.fg }}
    >
      {children}
    </span>
  );
}
