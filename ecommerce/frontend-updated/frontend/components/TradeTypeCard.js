export default function TradeTypeCard({ icon: Icon, tag, title, text, example, accent }) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-paper p-6">
      <div className="flex items-center gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Icon size={20} />
        </span>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide"
          style={{ background: `${accent}1f`, color: accent }}
        >
          {tag}
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
      <p className="mt-3 rounded-lg bg-paper-raised px-3 py-2 text-xs text-ink-muted">
        <span className="font-semibold text-ink">Example: </span>
        {example}
      </p>
    </div>
  );
}
