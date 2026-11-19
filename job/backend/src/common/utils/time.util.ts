const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Parses strings like "7d", "12h", "30m", "45s", or a plain number of
 * seconds (as jsonwebtoken's `expiresIn` accepts), into milliseconds.
 * Falls back to 7 days if the input can't be parsed.
 */
export function parseDurationToMs(input: string | number): number {
  if (typeof input === 'number') {
    return input * 1000;
  }
  const match = /^(\d+)([smhd])$/.exec(input.trim());
  if (!match) {
    const asNumber = Number(input);
    if (!Number.isNaN(asNumber)) {
      return asNumber * 1000;
    }
    return 7 * UNIT_MS.d;
  }
  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
}
