/** "₹250 / person", or "Free entry" for 0 / missing. */
export const formatBudget = (tier?: string | number | null) => {
  const n = Number(tier);
  if (tier === undefined || tier === null || tier === '' || Number.isNaN(n) || n <= 0) return 'Free entry';
  return `₹${n.toLocaleString('en-IN')} / person`;
};

const PLUS_CODE = /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}/i;

/** A tidy, short place label from a free-text location ("JGQP+5FC, Haridevpur, …" → "Haridevpur"). Display only. */
export const shortLocation = (raw?: string | null, max = 30) => {
  if (!raw) return '';
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && !PLUS_CODE.test(s) && !/^\d/.test(s) && !/\b(located|roughly|kilomet|km from)\b/i.test(s));
  const first = parts[0] ?? '';
  return first.length > max ? '' : first;
};
