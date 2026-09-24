/** Stored in both opening_hours and closing_hours for places that never close. */
export const OPEN_24_7 = '24/7';

/** True for the 24/7 marker, and for older free-text values like "Open 24 hours". */
export const isOpen247 = (open?: string | null, close?: string | null) =>
  [open, close].some((v) => !!v && /24\s*\/\s*7|24\s*h(ou)?rs?|open 24/i.test(v));
