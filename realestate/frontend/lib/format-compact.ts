// Hand-rolled Indian-numbering compact formatter.
//
// We deliberately do NOT use Intl.NumberFormat(locale, { notation: "compact" })
// here: Chromium's ICU renders the "thousand" magnitude for en-IN as "T"
// (which reads as Trillion) while Node's ICU renders the same value as "K" —
// a real cross-engine inconsistency. Writing the K / L / Cr thresholds
// ourselves guarantees identical, unambiguous output everywhere this runs.
export function compactINR(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  const trim = (n: number) => {
    const rounded = Math.round(n * 10) / 10;
    return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
  };

  if (abs >= 10000000) return `${sign}${trim(abs / 10000000)}Cr`;
  if (abs >= 100000) return `${sign}${trim(abs / 100000)}L`;
  if (abs >= 1000) return `${sign}${trim(abs / 1000)}K`;
  return `${sign}${abs}`;
}
