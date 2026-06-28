/* ─────────────────────────────────────────────────────
 * AI Guardian — Formatting utilities
 * ───────────────────────────────────────────────────── */

/**
 * Format a number as US currency.
 * Values below $0.10 show 3 decimal places; otherwise 2.
 */
export function money(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: n < 0.1 ? 3 : 2,
  }).format(n);
}

/**
 * Format a 0-1 decimal as a rounded whole-number percentage string.
 * e.g. 0.782 → "78%"
 */
export function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

/**
 * Format an ISO date string to the user's locale short date.
 */
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}
