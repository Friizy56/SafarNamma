/** Stored in both opening_hours and closing_hours for places that never close. */
export const OPEN_24_7 = '24/7';

/** Stored in both fields when the timings are irregular and written in the description instead. */
export const HOURS_IN_DESCRIPTION = 'See description';

/** True for the 24/7 marker, and for older free-text values like "Open 24 hours". */
export const isOpen247 = (open?: string | null, close?: string | null) =>
  [open, close].some((v) => !!v && /24\s*\/\s*7|24\s*h(ou)?rs?|open 24/i.test(v));

/** True when the timings live in the description ("See description" / "Check description"). */
export const isHoursInDescription = (open?: string | null, close?: string | null) =>
  [open, close].some((v) => !!v && /(see|check)\s+(the\s+)?description/i.test(v));

export type HoursMode = 'times' | '247' | 'description';

export const hoursMode = (open?: string | null, close?: string | null): HoursMode =>
  isOpen247(open, close) ? '247' : isHoursInDescription(open, close) ? 'description' : 'times';

/** The value saved in both opening_hours and closing_hours for a special mode. */
export const hoursMarker = (mode: Exclude<HoursMode, 'times'>) => (mode === '247' ? OPEN_24_7 : HOURS_IN_DESCRIPTION);
