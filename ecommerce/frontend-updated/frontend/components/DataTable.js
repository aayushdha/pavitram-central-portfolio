export default function DataTable({ columns, rows }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line" style={{ background: "var(--color-paper)" }}>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-line last:border-0 hover:bg-[var(--color-paper)]">
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-4 py-3.5 text-ink">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
